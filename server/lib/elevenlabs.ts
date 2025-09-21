interface ElevenLabsOptions {
  apiKey: string;
  voiceId?: string;
  model?: string;
}

interface GenerateAudioResponse {
  audioUrl: string;
  audioData: Buffer;
}

class ElevenLabsService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';
  private defaultVoiceId = 'pNInz6obpgDQGcFmaJgB'; // Adam - v3 optimized multilingual voice
  private defaultModel = 'eleven_v3'; // Latest v3 model

  constructor(options: ElevenLabsOptions) {
    this.apiKey = options.apiKey;
  }

  async generateAudio(text: string, language: string): Promise<GenerateAudioResponse> {
    try {
      // Use default multilingual voice for all languages - it works with v3 model
      const voiceId = this.defaultVoiceId;
      
      // Map language names to proper language codes
      const languageCodeMap: Record<string, string> = {
        'spanish': 'es',
        'mandarin chinese': 'zh',
        'japanese': 'ja', 
        'arabic': 'ar',
        'french': 'fr',
        'portuguese': 'pt',
        'russian': 'ru',
        'korean': 'ko',
        'vietnamese': 'vi',
      };
      
      const languageCode = languageCodeMap[language.toLowerCase()] || 'en';

      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: this.defaultModel,
          language_code: languageCode,
          voice_settings: {
            stability: 0.3, // Creative mode for maximum v3 expressiveness
            similarity_boost: 0.8, // Higher similarity for v3
            style: 0.2, // Enhanced style for v3
            use_speaker_boost: true // Enhanced clarity
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      const audioBuffer = Buffer.from(await response.arrayBuffer());
      
      // In a real implementation, you'd save this to cloud storage and return a URL
      // For now, we'll create a data URL or save to local filesystem
      const audioUrl = `data:audio/mpeg;base64,${audioBuffer.toString('base64')}`;

      return {
        audioUrl,
        audioData: audioBuffer
      };
    } catch (error) {
      console.error('ElevenLabs audio generation error:', error);
      throw new Error('Failed to generate audio: ' + (error as Error).message);
    }
  }

  async getAvailableVoices(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Error fetching voices:', error);
      return [];
    }
  }
}

export { ElevenLabsService };
export type { GenerateAudioResponse };