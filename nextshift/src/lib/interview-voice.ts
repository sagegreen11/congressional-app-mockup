import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

let recognition: SpeechRecognitionInstance | null = null;
let htmlAudio: HTMLAudioElement | null = null;
let htmlUrl: string | null = null;
let soundOn = true;
let playGeneration = 0;

type SavedClip = { text: string; language: string; blob: Blob | null };
let savedClip: SavedClip | null = null;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return null;
  }
  const webWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return webWindow.SpeechRecognition ?? webWindow.webkitSpeechRecognition ?? null;
}

export function canListen(): boolean {
  return getRecognitionCtor() !== null;
}

export async function requestMicrophone(): Promise<void> {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return;
  }
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  stream.getTracks().forEach((track) => track.stop());
}

export function stopSpeaking() {
  playGeneration += 1;
  Speech.stop();
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.speechSynthesis?.cancel();
  }
  if (htmlAudio) {
    htmlAudio.pause();
    htmlAudio.src = '';
    htmlAudio = null;
  }
  if (htmlUrl) {
    URL.revokeObjectURL(htmlUrl);
    htmlUrl = null;
  }
}

export function isSoundOn() {
  return soundOn;
}

export function setSoundOn(next: boolean) {
  soundOn = next;
  if (!next) stopSpeaking();
}

export function pauseCoachAudio() {
  if (htmlAudio && !htmlAudio.paused) {
    htmlAudio.pause();
    return;
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.speechSynthesis?.pause();
  }
  const speech = Speech as typeof Speech & { pause?: () => void };
  speech.pause?.();
}

export function playCoachAudio() {
  if (!soundOn) return;
  if (htmlAudio?.paused && htmlAudio.src) {
    void htmlAudio.play();
    return;
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.speechSynthesis?.resume();
  }
  const speech = Speech as typeof Speech & { resume?: () => void };
  speech.resume?.();
}

export function replayCoachAudio() {
  if (!savedClip || !soundOn) return Promise.resolve();
  return playAnswer(savedClip.text, savedClip.language, savedClip.blob);
}

export function stopListening() {
  if (!recognition) return;
  try {
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    recognition.abort();
  } catch {
    // Recognition may already be stopped.
  }
  recognition = null;
}

export function speakAloud(text: string, language = 'en-US'): Promise<void> {
  stopSpeaking();
  return new Promise((resolve) => {
    Speech.speak(text, {
      language,
      rate: 0.94,
      pitch: 1,
      onDone: () => resolve(),
      onStopped: () => resolve(),
      onError: () => resolve(),
    });
  });
}

export function listenOnce(onPartial?: (text: string) => void, language = 'en-US'): Promise<string> {
  const Ctor = getRecognitionCtor();
  if (!Ctor) {
    return Promise.reject(new Error('Voice listening needs Chrome, Edge, or Safari on the web app.'));
  }

  stopListening();

  return new Promise((resolve, reject) => {
    const rec = new Ctor();
    recognition = rec;
    rec.lang = language;
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    let finalText = '';
    let settled = false;

    const finish = (text: string) => {
      if (settled) return;
      settled = true;
      recognition = null;
      resolve(text.trim());
    };

    rec.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const piece = event.results[i][0]?.transcript ?? '';
        if (event.results[i].isFinal) {
          finalText = `${finalText} ${piece}`.trim();
        } else {
          interim += piece;
        }
      }
      onPartial?.(finalText || interim);
    };

    rec.onerror = (event) => {
      if (settled) return;
      settled = true;
      recognition = null;
      if (event.error === 'no-speech' || event.error === 'aborted') {
        resolve(finalText.trim());
        return;
      }
      reject(new Error(event.error));
    };

    rec.onend = () => finish(finalText);

    try {
      rec.start();
    } catch (error) {
      settled = true;
      recognition = null;
      reject(error instanceof Error ? error : new Error('Could not start the microphone.'));
    }
  });
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';
  const size = 0x8000;
  for (let index = 0; index < bytes.length; index += size) {
    binary += String.fromCharCode(...bytes.subarray(index, index + size));
  }
  return btoa(binary);
}

function stopRecorder(recorder: MediaRecorder, chunks: Blob[]) {
  if (recorder.state === 'inactive') {
    return Promise.resolve(chunks);
  }
  return new Promise<Blob[]>((resolve) => {
    recorder.onstop = () => resolve(chunks);
    recorder.stop();
  });
}

export async function captureSpoken(
  onPartial?: (text: string) => void,
  language = 'en-US',
): Promise<{ text: string; audioBase64: string | null; mimeType: string | null }> {
  let recorder: MediaRecorder | null = null;
  let stream: MediaStream | null = null;
  const chunks: Blob[] = [];
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined') {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferred = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
      const mimeType = preferred.find((item) => MediaRecorder.isTypeSupported(item));
      recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      });
      recorder.start();
    } catch {
      stream?.getTracks().forEach((track) => track.stop());
      recorder = null;
      stream = null;
    }
  }

  try {
    const text = await listenOnce(onPartial, language);
    const recorded = recorder ? await stopRecorder(recorder, chunks) : [];
    const blob = recorded.length ? new Blob(recorded, { type: recorder?.mimeType || 'audio/webm' }) : null;
    if (!blob || blob.size < 32) {
      return { text, audioBase64: null, mimeType: null };
    }
    const bytes = new Uint8Array(await blob.arrayBuffer());
    return {
      text,
      audioBase64: bytesToBase64(bytes),
      mimeType: (blob.type || 'audio/webm').split(';')[0],
    };
  } finally {
    if (recorder && recorder.state !== 'inactive') {
      try {
        recorder.stop();
      } catch {
        // The recorder may already have stopped with the recognition result.
      }
    }
    stream?.getTracks().forEach((track) => track.stop());
  }
}

async function playBlob(blob: Blob) {
  stopSpeaking();
  const generation = playGeneration;
  if (typeof Audio === 'undefined') return false;
  htmlUrl = URL.createObjectURL(blob);
  const audio = new Audio(htmlUrl);
  htmlAudio = audio;
  return new Promise<boolean>((resolve) => {
    const finish = (ok: boolean) => resolve(generation === playGeneration ? ok : true);
    audio.onended = () => finish(true);
    audio.onerror = () => finish(false);
    void audio.play().then(
      () => undefined,
      () => finish(false),
    );
  });
}

export async function playAnswer(text: string, language: string, blob: Blob | null) {
  savedClip = { text, language, blob };
  if (!soundOn) return;
  if (blob) {
    const played = await playBlob(blob);
    if (played) return;
  }
  await speakAloud(text, language);
}
