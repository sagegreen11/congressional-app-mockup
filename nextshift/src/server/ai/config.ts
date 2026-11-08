import type { InterviewLang } from '@/lib/interview-locale';

export const SUPPORTED_LANGS: InterviewLang[] = ['en', 'es', 'zh-CN'];

function read(name: string) {
  const value = process.env[name];
  return typeof value === 'string' ? value.trim() : '';
}

export function hfToken() {
  return read('HF_TOKEN') || read('HUGGINGFACE_TOKEN') || read('HUGGING_FACE_HUB_TOKEN');
}

export function routerBase() {
  return (read('HF_ROUTER_BASE') || 'https://router.huggingface.co').replace(/\/$/, '');
}

export function geminiKey() {
  return read('GEMINI_API_KEY');
}

export function geminiModel() {
  const configured = read('GEMINI_MODEL');
  if (!configured || configured === 'gemini-3.8-flash') return 'gemini-3.5-flash';
  return configured;
}

export function sttModel() {
  return read('HF_STT_MODEL') || 'openai/whisper-large-v3';
}

export function ttsModel(language: InterviewLang) {
  if (language === 'es') return read('HF_TTS_MODEL_ES') || 'facebook/mms-tts-spa';
  if (language === 'zh-CN') return read('HF_TTS_MODEL_ZH') || 'facebook/mms-tts-cmn';
  return read('HF_TTS_MODEL_EN') || 'microsoft/speecht5_tts';
}

export function parseLanguage(value: unknown): InterviewLang | null {
  return value === 'en' || value === 'es' || value === 'zh-CN' ? value : null;
}
