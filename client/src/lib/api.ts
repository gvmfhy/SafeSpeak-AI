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

interface StreamingCallbacks {
  onStart?: () => void;
  onChunk?: (text: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: string) => void;
}

export async function streamTranslation(
  message: string,
  targetLanguage: string,
  callbacks: StreamingCallbacks,
  systemPrompt?: string,
  presetContext?: {
    tone: string;
    culturalContext: string;
    customPrompt?: string;
  },
  customKeys?: { anthropic: string; elevenlabs: string }
): Promise<() => void> {
  return new Promise((resolve, reject) => {
    // Create POST request body
    const requestBody = {
      message,
      targetLanguage,
      systemPrompt,
      presetContext,
      customKeys,
    };

    // Use fetch to initiate the SSE stream
    fetch('/api/translate-stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      let cancelled = false;
      const decoder = new TextDecoder();

      const readStream = async () => {
        try {
          while (!cancelled) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  switch (data.type) {
                    case 'start':
                      callbacks.onStart?.();
                      break;
                    case 'chunk':
                      callbacks.onChunk?.(data.text);
                      break;
                    case 'complete':
                      callbacks.onComplete?.(data.fullText);
                      return; // Exit the stream
                    case 'error':
                      callbacks.onError?.(data.error);
                      return;
                  }
                } catch (parseError) {
                  // Ignore malformed JSON chunks
                }
              }
            }
          }
        } catch (error) {
          if (!cancelled) {
            callbacks.onError?.(error instanceof Error ? error.message : 'Stream error');
          }
        }
      };

      readStream();
      
      // Return cancellation function
      resolve(() => {
        cancelled = true;
        reader.cancel();
      });
      
    }).catch(error => {
      callbacks.onError?.(error instanceof Error ? error.message : 'Request failed');
      reject(error);
    });
  });
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