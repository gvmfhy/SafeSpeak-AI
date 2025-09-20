import { useState } from "react";
import { Send, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface MessageInputProps {
  message: string;
  onMessageChange: (message: string) => void;
  targetLanguage: string;
  onLanguageChange: (language: string) => void;
  onTranslate: () => void;
  isTranslating?: boolean;
}

export function MessageInput({
  message,
  onMessageChange,
  targetLanguage,
  onLanguageChange,
  onTranslate,
  isTranslating = false,
}: MessageInputProps) {
  const languages = [
    { value: "mandarin", label: "Mandarin Chinese", flag: "🇨🇳" },
    { value: "spanish", label: "Spanish", flag: "🇪🇸" },
    { value: "arabic", label: "Arabic", flag: "🇸🇦" },
    { value: "french", label: "French", flag: "🇫🇷" },
    { value: "portuguese", label: "Portuguese", flag: "🇵🇹" },
    { value: "russian", label: "Russian", flag: "🇷🇺" },
    { value: "korean", label: "Korean", flag: "🇰🇷" },
    { value: "vietnamese", label: "Vietnamese", flag: "🇻🇳" },
  ];

  const selectedLanguage = languages.find(lang => lang.value === targetLanguage);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Languages className="w-4 h-4" />
          <h3 className="text-sm font-medium">Healthcare Message</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="message">English Message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Enter your message to the patient in English..."
            className="min-h-32 resize-none"
            data-testid="textarea-message"
          />
        </div>
        
        <div>
          <Label htmlFor="language">Target Language</Label>
          <Select value={targetLanguage} onValueChange={onLanguageChange}>
            <SelectTrigger data-testid="select-target-language">
              <SelectValue>
                {selectedLanguage && (
                  <div className="flex items-center space-x-2">
                    <span>{selectedLanguage.flag}</span>
                    <span>{selectedLanguage.label}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language.value} value={language.value}>
                  <div className="flex items-center space-x-2">
                    <span>{language.flag}</span>
                    <span>{language.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={onTranslate}
          disabled={!message.trim() || isTranslating}
          className="w-full"
          size="lg"
          data-testid="button-translate"
        >
          {isTranslating ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              <span>Translating...</span>
            </div>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Translate Message
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}