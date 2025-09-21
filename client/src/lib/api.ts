// API client functions for TranslateBridge

interface TranslationResult {
  translation: string;
  culturalNotes: string;
}

interface BackTranslationResult {
  backTranslation: string;
  culturalAnalysis: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function translateMessage(
  message: string, 
  targetLanguage: string
): Promise<TranslationResult> {
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      targetLanguage,
    }),
  });

  const result: ApiResponse<TranslationResult> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Translation failed');
  }

  return result.data;
}

export async function backTranslateMessage(
  originalMessage: string,
  translation: string,
  targetLanguage: string
): Promise<BackTranslationResult> {
  const response = await fetch('/api/back-translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      originalMessage,
      translation,
      targetLanguage,
    }),
  });

  const result: ApiResponse<BackTranslationResult> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Back-translation failed');
  }

  return result.data;
}

interface AudioResult {
  audioUrl: string;
}

export async function generateAudio(
  text: string,
  language: string
): Promise<AudioResult> {
  const response = await fetch('/api/generate-audio', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      language,
    }),
  });

  const result: ApiResponse<AudioResult> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Audio generation failed');
  }

  return result.data;
}