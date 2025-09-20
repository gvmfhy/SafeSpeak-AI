import { useState } from "react";
import { Edit, Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface TranslationCardProps {
  original: string;
  translation: string;
  language: string;
  reasoning?: string;
  onEdit: (newTranslation: string) => void;
  onBackTranslate: () => void;
  isBackTranslating?: boolean;
}

export function TranslationCard({
  original,
  translation,
  language,
  reasoning,
  onEdit,
  onBackTranslate,
  isBackTranslating = false,
}: TranslationCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTranslation, setEditedTranslation] = useState(translation);

  const handleSaveEdit = () => {
    onEdit(editedTranslation);
    setIsEditing(false);
    console.log('Translation edited:', editedTranslation);
  };

  const handleCancelEdit = () => {
    setEditedTranslation(translation);
    setIsEditing(false);
  };

  const languageLabels: Record<string, string> = {
    mandarin: "Mandarin Chinese",
    spanish: "Spanish", 
    arabic: "Arabic",
    french: "French",
    portuguese: "Portuguese",
    russian: "Russian",
    korean: "Korean",
    vietnamese: "Vietnamese",
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">AI Translation Result</h3>
          <Badge variant="secondary" className="text-xs">
            {languageLabels[language] || language}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditing(!isEditing)}
          data-testid="button-edit-translation"
          className="hover-elevate"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Original Message */}
        <div className="p-3 bg-muted/30 rounded-md">
          <p className="text-xs text-muted-foreground mb-1">Original (English):</p>
          <p className="text-sm">{original}</p>
        </div>

        {/* AI Reasoning */}
        {reasoning && (
          <div className="p-3 bg-accent/30 rounded-md">
            <p className="text-xs text-muted-foreground mb-1">AI Cultural Analysis:</p>
            <p className="text-sm italic">{reasoning}</p>
          </div>
        )}

        {/* Translation */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Translation:</p>
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editedTranslation}
                onChange={(e) => setEditedTranslation(e.target.value)}
                className="min-h-20"
                data-testid="textarea-edit-translation"
              />
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  data-testid="button-save-edit"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEdit}
                  data-testid="button-cancel-edit"
                >
                  <X className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-card border border-card-border rounded-md">
              <p className="text-base leading-relaxed">{translation}</p>
            </div>
          )}
        </div>

        {/* Back-translate Action */}
        <div className="pt-2 border-t">
          <Button
            onClick={onBackTranslate}
            disabled={isBackTranslating || isEditing}
            className="w-full"
            variant="outline"
            data-testid="button-back-translate"
          >
            {isBackTranslating ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                <span>Back-translating for Quality Control...</span>
              </div>
            ) : (
              <>
                <ArrowRight className="w-4 h-4 mr-2" />
                Proceed to Quality Control
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}