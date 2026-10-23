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
  Speech.stop();
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.speechSynthesis?.cancel();
  }
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
