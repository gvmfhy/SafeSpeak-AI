import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ComparisonViewProps {
  original: string;
  translation: string;
  backTranslation: string;
  language: string;
  qualityScore?: number;
  onApprove: () => void;
  onReject: () => void;
  isGeneratingAudio?: boolean;
}

export function ComparisonView({
  original,
  translation,
  backTranslation,
  language,
  qualityScore = 85,
  onApprove,
  onReject,
  isGeneratingAudio = false,
}: ComparisonViewProps) {
  const getQualityColor = (score: number) => {
    if (score >= 80) return "text-secondary";
    if (score >= 60) return "text-yellow-600";
    return "text-destructive";
  };

  const getQualityIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4 text-secondary" />;
    if (score >= 60) return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <XCircle className="w-4 h-4 text-destructive" />;
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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Quality Control Review</h3>
          <div className="flex items-center space-x-2">
            {getQualityIcon(qualityScore)}
            <span className={`text-sm font-medium ${getQualityColor(qualityScore)}`}>
              {qualityScore}% Match
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Three-column comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Original */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                1. Original
              </Badge>
            </div>
            <div className="p-3 bg-muted/30 rounded-md min-h-20">
              <p className="text-sm leading-relaxed">{original}</p>
            </div>
            <p className="text-xs text-muted-foreground">English</p>
          </div>

          {/* Translation */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                2. Translation
              </Badge>
            </div>
            <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-md min-h-20">
              <p className="text-sm leading-relaxed font-medium">{translation}</p>
            </div>
            <p className="text-xs text-muted-foreground">{languageLabels[language]}</p>
          </div>

          {/* Back-translation */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                3. Back-check
              </Badge>
            </div>
            <div className="p-3 bg-accent/30 rounded-md min-h-20">
              <p className="text-sm leading-relaxed">{backTranslation}</p>
            </div>
            <p className="text-xs text-muted-foreground">Back to English</p>
          </div>
        </div>

        {/* Quality assessment */}
        <div className="p-4 bg-card border border-card-border rounded-md">
          <div className="flex items-start space-x-3">
            {getQualityIcon(qualityScore)}
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Quality Assessment</p>
              <p className="text-sm text-muted-foreground">
                {qualityScore >= 80 
                  ? "The translation maintains the original meaning well. Cultural context and medical terminology are appropriately handled."
                  : qualityScore >= 60
                  ? "The translation is generally accurate but may need minor adjustments for optimal clarity."
                  : "The translation may not fully capture the original meaning. Consider revising before proceeding."
                }
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-3">
          <Button
            onClick={onReject}
            variant="outline"
            className="flex-1"
            disabled={isGeneratingAudio}
            data-testid="button-reject-translation"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Needs Revision
          </Button>
          <Button
            onClick={onApprove}
            className="flex-1"
            disabled={isGeneratingAudio}
            data-testid="button-approve-translation"
          >
            {isGeneratingAudio ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                <span>Generating Audio...</span>
              </div>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve & Generate Audio
              </>
            )}
          </Button>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Tip: Click on step indicators above to navigate between completed steps
          </p>
        </div>
      </CardContent>
    </Card>
  );
}