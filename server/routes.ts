import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { translateMessage, backTranslateMessage } from "./lib/anthropic";
import { ElevenLabsService } from "./lib/elevenlabs";
import { z } from "zod";

// Validation schemas
const translateSchema = z.object({
  message: z.string().min(1),
  targetLanguage: z.string().min(1)
});

const backTranslateSchema = z.object({
  originalMessage: z.string().min(1),
  translation: z.string().min(1),
  targetLanguage: z.string().min(1)
});

const generateAudioSchema = z.object({
  text: z.string().min(1),
  language: z.string().min(1)
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Translation endpoint
  app.post('/api/translate', async (req, res) => {
    try {
      const { message, targetLanguage } = translateSchema.parse(req.body);
      
      const result = await translateMessage(message, targetLanguage);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Translation error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Translation failed'
      });
    }
  });

  // Back-translation endpoint
  app.post('/api/back-translate', async (req, res) => {
    try {
      const { originalMessage, translation, targetLanguage } = backTranslateSchema.parse(req.body);
      
      const result = await backTranslateMessage(originalMessage, translation, targetLanguage);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Back-translation error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Back-translation failed'
      });
    }
  });

  // Audio generation endpoint
  app.post('/api/generate-audio', async (req, res) => {
    try {
      const { text, language } = generateAudioSchema.parse(req.body);
      
      if (!process.env.ELEVENLABS_API_KEY) {
        throw new Error('ElevenLabs API key not configured');
      }
      
      const elevenLabsService = new ElevenLabsService({
        apiKey: process.env.ELEVENLABS_API_KEY
      });
      
      const result = await elevenLabsService.generateAudio(text, language);
      
      res.json({
        success: true,
        data: {
          audioUrl: result.audioUrl
        }
      });
    } catch (error) {
      console.error('Audio generation error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Audio generation failed'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
