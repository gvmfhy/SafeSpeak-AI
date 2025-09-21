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
  private defaultVoiceId = 'yjJ45q8TVCrtMhEKurxY'; // Professional v3-optimized voice
  private defaultModel = 'eleven_v3'; // ElevenLabs' latest flagship model

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
        'mandarin': 'zh', // Fix for Mandarin mapping bug
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
            stability: 0.5, // Balanced stability for natural speech
            similarity_boost: 0.8, // High similarity for voice consistency
            style: 0.0, // Style is only for v2 English models
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