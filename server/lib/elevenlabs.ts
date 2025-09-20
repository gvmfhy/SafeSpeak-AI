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
  private defaultVoiceId = 'ErXwobaYiN019PkySvjV'; // Default voice suitable for healthcare
  private defaultModel = 'eleven_multilingual_v2';

  constructor(options: ElevenLabsOptions) {
    this.apiKey = options.apiKey;
  }

  async generateAudio(text: string, language: string): Promise<GenerateAudioResponse> {
    try {
      // Map languages to appropriate voice IDs for better pronunciation
      const voiceMap: Record<string, string> = {
        'mandarin': 'XrExE9yKIg1WjnnlVkGX', // Multilingual voice good for Mandarin
        'spanish': '21m00Tcm4TlvDq8ikWAM', // Spanish-optimized voice
        'arabic': 'AZnzlk1XvdvUeBnXmlld', // Multilingual voice
        'french': 'ErXwobaYiN019PkySvjV', // French-capable voice
        'portuguese': 'MF3mGyEYCl7XYWbV9V6O', // Portuguese voice
        'russian': 'VR6AewLTigWG4xSOukaG', // Russian voice
        'korean': 'pqHfZKP75CvOlQylNhV4', // Korean voice  
        'vietnamese': 'IKne3meq5aSn9XLyUdCD', // Vietnamese voice
      };

      const voiceId = voiceMap[language] || this.defaultVoiceId;

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
          voice_settings: {
            stability: 0.75, // Good for medical content - clear and consistent
            similarity_boost: 0.75, // Maintain natural voice characteristics
            style: 0.25, // Less dramatic, more professional
            use_speaker_boost: true // Enhance clarity
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