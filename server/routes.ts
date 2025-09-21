import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { translateMessage, backTranslateMessage, refineTranslation, streamTranslation } from "./lib/anthropic";
import { ElevenLabsService } from "./lib/elevenlabs";
import { z } from "zod";

// Validation schemas
const translateSchema = z.object({
  message: z.string().min(1),
  targetLanguage: z.string().min(1),
  systemPrompt: z.string().optional(),
  presetContext: z.object({
    tone: z.string(),
    culturalContext: z.string(),
    customPrompt: z.string().optional(),
  }).optional(),
  customKeys: z.object({
    anthropic: z.string(),
    elevenlabs: z.string(),
  }).optional()
});

const backTranslateSchema = z.object({
  originalMessage: z.string().min(1),
  translation: z.string().min(1),
  targetLanguage: z.string().min(1),
  customKeys: z.object({
    anthropic: z.string(),
    elevenlabs: z.string(),
  }).optional()
});

const generateAudioSchema = z.object({
  text: z.string().min(1),
  language: z.string().min(1),
  customKeys: z.object({
    anthropic: z.string(),
    elevenlabs: z.string(),
  }).optional()
});

const refineTranslationSchema = z.object({
  originalMessage: z.string().min(1),
  currentTranslation: z.string().min(1),
  targetLanguage: z.string().min(1),
  userFeedback: z.string().min(1),
  conversationContext: z.string().optional(),
  customKeys: z.object({
    anthropic: z.string(),
    elevenlabs: z.string(),
  }).optional()
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Translation endpoint
  app.post('/api/translate', async (req, res) => {
    try {
      const { message, targetLanguage, systemPrompt, presetContext, customKeys } = translateSchema.parse(req.body);
      
      const result = await translateMessage(message, targetLanguage, systemPrompt, presetContext, customKeys?.anthropic);
      
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

  // Streaming translation endpoint
  app.post('/api/translate-stream', async (req, res) => {
    try {
      const { message, targetLanguage, systemPrompt, presetContext, customKeys } = translateSchema.parse(req.body);
      
      // Set up Server-Sent Events headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

      try {
        // Start streaming translation
        const streamingTranslation = await streamTranslation(message, targetLanguage, systemPrompt, presetContext, customKeys?.anthropic);
        
        // Send start event
        res.write(`data: ${JSON.stringify({ type: 'start' })}\n\n`);
        
        let fullTranslation = '';
        
        // Stream translation chunks
        for await (const chunk of streamingTranslation) {
          fullTranslation += chunk;
          res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`);
        }
        
        // Send complete event with full translation
        res.write(`data: ${JSON.stringify({ type: 'complete', fullText: fullTranslation })}\n\n`);
        res.end();
        
      } catch (streamError) {
        res.write(`data: ${JSON.stringify({ type: 'error', error: streamError instanceof Error ? streamError.message : 'Streaming failed' })}\n\n`);
        res.end();
      }
      
    } catch (error) {
      console.error('Streaming translation error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Streaming translation failed'
      });
    }
  });

  // Back-translation endpoint
  app.post('/api/back-translate', async (req, res) => {
    try {
      const { originalMessage, translation, targetLanguage, customKeys } = backTranslateSchema.parse(req.body);
      
      const result = await backTranslateMessage(originalMessage, translation, targetLanguage, customKeys?.anthropic);
      
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
      const { text, language, customKeys } = generateAudioSchema.parse(req.body);
      
      const elevenLabsApiKey = customKeys?.elevenlabs || process.env.ELEVENLABS_API_KEY;
      if (!elevenLabsApiKey) {
        throw new Error('ElevenLabs API key not configured');
      }
      
      const elevenLabsService = new ElevenLabsService({
        apiKey: elevenLabsApiKey
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

  // Translation refinement endpoint
  app.post('/api/refine-translation', async (req, res) => {
    try {
      const { originalMessage, currentTranslation, targetLanguage, userFeedback, conversationContext, customKeys } = refineTranslationSchema.parse(req.body);
      
      const result = await refineTranslation(
        originalMessage, 
        currentTranslation, 
        targetLanguage, 
        userFeedback, 
        conversationContext || '', 
        customKeys?.anthropic
      );
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Refinement error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Translation refinement failed'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
