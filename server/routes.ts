import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { translateMessage, backTranslateMessage } from "./lib/anthropic";
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

  const httpServer = createServer(app);

  return httpServer;
}
