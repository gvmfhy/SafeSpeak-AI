// API client functions for TranslateBridge

interface TranslationResult {
  translation: string;
  culturalNotes: string;
  // Enhanced cultural intelligence analysis
  intent?: string;
  culturalConsiderations?: string;
  strategy?: string;
}

interface BackTranslationResult {
  backTranslation: string;
  culturalAnalysis: string;
  // Enhanced safety check analysis
  literalTranslation?: string;
  perceivedTone?: string;
  culturalNuance?: string;
}

interface RefinementRequest {
  originalMessage: string;
  currentTranslation: string;
  targetLanguage: string;
  userFeedback: string;
  conversationContext?: string;
}

interface RefinementResult {
  revisedTranslation: string;
  changesExplanation: string;
  improvementNotes: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function translateMessage(
  message: string, 
  targetLanguage: string,
  systemPrompt?: string,
  presetContext?: {
    tone: string;
    culturalContext: string;
    customPrompt?: string;
  },
  customKeys?: { anthropic: string; elevenlabs: string }
): Promise<TranslationResult> {
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      targetLanguage,
      systemPrompt,
      presetContext,
      customKeys,
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
  targetLanguage: string,
  customKeys?: { anthropic: string; elevenlabs: string }
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
      customKeys,
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
  language: string,
  customKeys?: { anthropic: string; elevenlabs: string }
): Promise<AudioResult> {
  const response = await fetch('/api/generate-audio', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      language,
      customKeys,
    }),
  });

  const result: ApiResponse<AudioResult> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Audio generation failed');
  }

  return result.data;
}

export async function refineTranslation(
  refinementRequest: RefinementRequest,
  customKeys?: { anthropic: string; elevenlabs: string }
): Promise<RefinementResult> {
  const response = await fetch('/api/refine-translation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...refinementRequest,
      customKeys,
    }),
  });

  const result: ApiResponse<RefinementResult> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Translation refinement failed');
  }

  return result.data;
}