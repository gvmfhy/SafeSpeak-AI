import { useState } from "react";
import { Heart, Settings } from "lucide-react";
import { StepIndicator } from "./StepIndicator";
import { PatientPresetSelector, PatientPreset } from "./PatientPresetSelector";
import { MessageInput } from "./MessageInput";
import { TranslationCard } from "./TranslationCard";
import { ComparisonView } from "./ComparisonView";
import { AudioPlayer } from "./AudioPlayer";
import { ThemeToggle } from "./ThemeToggle";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TranslationResult {
  original: string;
  translation: string;
  reasoning: string;
  language: string;
}

interface BackTranslationResult {
  backTranslation: string;
  qualityScore: number;
}

export function HealthcareTranslator() {
  // Workflow state
  const [currentStep, setCurrentStep] = useState(1);
  const steps = ["Input", "Translation", "Quality Check", "Audio"];

  // todo: remove mock functionality
  // Patient presets
  const [presets, setPresets] = useState<PatientPreset[]>([
    {
      id: "1",
      name: "Mr. Lee",
      greeting: "您好，李先生",
      tone: "respectful",
      customInstructions: "Elderly patient, prefers formal address, has hearing difficulty",
      language: "mandarin"
    },
    {
      id: "2",
      name: "Maria Santos", 
      greeting: "Hola Señora Santos",
      tone: "warm",
      customInstructions: "Mother of three, appreciates clear explanations",
      language: "spanish"
    },
    {
      id: "3",
      name: "Dr. Ahmed",
      greeting: "مرحبا دكتور أحمد",
      tone: "formal",
      customInstructions: "Medical colleague, use professional terminology",
      language: "arabic"
    }
  ]);

  const [selectedPresetId, setSelectedPresetId] = useState<string>("1");

  // Message and language
  const [message, setMessage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("mandarin");

  // Translation results
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [backTranslationResult, setBackTranslationResult] = useState<BackTranslationResult | null>(null);

  // Loading states
  const [isTranslating, setIsTranslating] = useState(false);
  const [isBackTranslating, setIsBackTranslating] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  // Audio result
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleCreatePreset = (newPreset: Omit<PatientPreset, 'id'>) => {
    const preset: PatientPreset = {
      ...newPreset,
      id: (presets.length + 1).toString()
    };
    setPresets([...presets, preset]);
    setSelectedPresetId(preset.id);
    console.log('New preset created:', preset);
  };

  const handleTranslate = async () => {
    setIsTranslating(true);
    console.log('Translating message:', message, 'to', targetLanguage);
    
    // todo: remove mock functionality
    // Simulate AI translation with reasoning
    setTimeout(() => {
      const mockTranslations: Record<string, string> = {
        mandarin: "请和食物一起服用您的药物，在饭后服用。",
        spanish: "Por favor tome su medicamento con comida después de las comidas.",
        arabic: "يرجى تناول الدواء مع الطعام بعد الوجبات.",
        french: "Veuillez prendre vos médicaments avec de la nourriture après les repas.",
        portuguese: "Por favor, tome seu medicamento com comida após as refeições.",
        russian: "Пожалуйста, принимайте лекарство с едой после приема пищи."
      };

      const result: TranslationResult = {
        original: message,
        translation: mockTranslations[targetLanguage] || "Translation not available",
        reasoning: `The AI considered cultural context for ${targetLanguage}, ensuring respectful medical communication. Used formal address patterns appropriate for healthcare settings and emphasized the important timing of medication with food.`,
        language: targetLanguage
      };

      setTranslationResult(result);
      setCurrentStep(2);
      setIsTranslating(false);
      console.log('Translation completed:', result);
    }, 2000);
  };

  const handleEditTranslation = (newTranslation: string) => {
    if (translationResult) {
      setTranslationResult({
        ...translationResult,
        translation: newTranslation
      });
      console.log('Translation edited:', newTranslation);
    }
  };

  const handleBackTranslate = async () => {
    if (!translationResult) return;
    
    setIsBackTranslating(true);
    console.log('Starting back-translation...');
    
    // todo: remove mock functionality
    // Simulate back-translation
    setTimeout(() => {
      const result: BackTranslationResult = {
        backTranslation: "Please take your medicine with food, take it after meals.",
        qualityScore: 92
      };

      setBackTranslationResult(result);
      setCurrentStep(3);
      setIsBackTranslating(false);
      console.log('Back-translation completed:', result);
    }, 2500);
  };

  const handleApproveTranslation = async () => {
    setIsGeneratingAudio(true);
    console.log('Translation approved, generating audio...');
    
    // todo: remove mock functionality
    // Simulate audio generation
    setTimeout(() => {
      setAudioUrl("mock-audio-url");
      setCurrentStep(4);
      setIsGeneratingAudio(false);
      console.log('Audio generation completed');
    }, 3000);
  };

  const handleRejectTranslation = () => {
    console.log('Translation rejected, returning to translation step');
    setCurrentStep(2);
    setBackTranslationResult(null);
  };

  const handleRestartWorkflow = () => {
    setCurrentStep(1);
    setMessage("");
    setTranslationResult(null);
    setBackTranslationResult(null);
    setAudioUrl(null);
    console.log('Workflow restarted');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">HealthSpeak</h1>
                <p className="text-xs text-muted-foreground">
                  AI-Powered Healthcare Translation
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} steps={steps} />

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Step 1: Input */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <PatientPresetSelector
                presets={presets}
                selectedPresetId={selectedPresetId}
                onPresetChange={setSelectedPresetId}
                onPresetCreate={handleCreatePreset}
              />
              
              <MessageInput
                message={message}
                onMessageChange={setMessage}
                targetLanguage={targetLanguage}
                onLanguageChange={setTargetLanguage}
                onTranslate={handleTranslate}
                isTranslating={isTranslating}
              />
            </div>
          )}

          {/* Step 2: Translation */}
          {currentStep === 2 && translationResult && (
            <TranslationCard
              original={translationResult.original}
              translation={translationResult.translation}
              language={translationResult.language}
              reasoning={translationResult.reasoning}
              onEdit={handleEditTranslation}
              onBackTranslate={handleBackTranslate}
              isBackTranslating={isBackTranslating}
            />
          )}

          {/* Step 3: Quality Check */}
          {currentStep === 3 && translationResult && backTranslationResult && (
            <ComparisonView
              original={translationResult.original}
              translation={translationResult.translation}
              backTranslation={backTranslationResult.backTranslation}
              language={translationResult.language}
              qualityScore={backTranslationResult.qualityScore}
              onApprove={handleApproveTranslation}
              onReject={handleRejectTranslation}
              isGeneratingAudio={isGeneratingAudio}
            />
          )}

          {/* Step 4: Audio */}
          {currentStep === 4 && translationResult && audioUrl && (
            <AudioPlayer
              audioUrl={audioUrl}
              translatedText={translationResult.translation}
              language={translationResult.language}
              onRestart={handleRestartWorkflow}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/30 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>© 2024 HealthSpeak. Empowering healthcare communication.</p>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}