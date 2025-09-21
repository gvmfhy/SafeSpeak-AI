import { useState, useRef, useEffect } from "react";
import { MessageSquare, Settings, Pencil, Check, X, Play, Download, RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "./ThemeToggle";
import { SettingsDrawer, type RecipientPreset } from "./SettingsDrawer";
import { translateMessage, backTranslateMessage, generateAudio } from "@/lib/api";

export function TranslateBridge() {
  // Application state - single page, no steps
  const [isTranslating, setIsTranslating] = useState(false);
  const [isBackTranslating, setIsBackTranslating] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  // Core data
  const [message, setMessage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("spanish");
  
  // Results
  const [translationResult, setTranslationResult] = useState<{
    translation: string;
    culturalNotes: string;
  } | null>(null);
  
  const [backTranslationResult, setBackTranslationResult] = useState<{
    backTranslation: string;
    culturalAnalysis: string;
  } | null>(null);
  
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  // UI state
  const [isEditingTranslation, setIsEditingTranslation] = useState(false);
  const [editedTranslation, setEditedTranslation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Audio ref for playback
  const audioRef = useRef<HTMLAudioElement>(null);

  // Settings state
  const [recipientPresets, setRecipientPresets] = useState<RecipientPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>(undefined);
  const [systemPrompt, setSystemPrompt] = useState(`Claude, please think through this carefully.

I need you to translate the following message with cultural sensitivity and appropriate tone. Consider the cultural context, communication patterns, and any nuances that would make this message more natural and respectful in the target culture.

<thinking>
[Consider cultural context, tone, formality level, and word choices that would be most appropriate]
</thinking>

<translation>
[Your translation in the target language]
</translation>

<cultural_notes>
[Explain any cultural adaptations you made and why they improve communication effectiveness]
</cultural_notes>`);
  const [hasEditedPrompt, setHasEditedPrompt] = useState(false);
  
  // API key management state
  const [useManagedKeys, setUseManagedKeys] = useState(true);
  const [customKeys, setCustomKeys] = useState({ anthropic: "", elevenlabs: "" });

  const languages = [
    { value: "spanish", label: "Spanish" },
    { value: "mandarin", label: "Mandarin Chinese" },
    { value: "arabic", label: "Arabic" },
    { value: "french", label: "French" },
    { value: "portuguese", label: "Portuguese" },
    { value: "russian", label: "Russian" },
    { value: "korean", label: "Korean" },
    { value: "vietnamese", label: "Vietnamese" },
  ];

  const handleTranslate = async () => {
    if (!message.trim()) return;
    
    setIsTranslating(true);
    setTranslationResult(null);
    setBackTranslationResult(null);
    setAudioUrl(null);
    setError(null);
    
    try {
      // Get preset context if one is selected
      const selectedPreset = recipientPresets.find(p => p.id === selectedPresetId);
      const presetContext = selectedPreset ? {
        tone: selectedPreset.tone,
        culturalContext: selectedPreset.culturalContext,
        customPrompt: selectedPreset.customPrompt
      } : undefined;
      
      const result = await translateMessage(message, targetLanguage, hasEditedPrompt ? systemPrompt : undefined, presetContext, useManagedKeys ? undefined : customKeys);
      
      setTranslationResult(result);
      
      // Auto-start back-translation
      handleBackTranslate(result.translation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleBackTranslate = async (translation?: string) => {
    const translationToUse = translation || translationResult?.translation;
    if (!translationToUse) return;
    
    setIsBackTranslating(true);
    
    try {
      const result = await backTranslateMessage(message, translationToUse, targetLanguage, useManagedKeys ? undefined : customKeys);
      setBackTranslationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Back-translation failed');
    } finally {
      setIsBackTranslating(false);
    }
  };

  const handleApprove = async () => {
    if (!translationResult) return;
    
    setIsGeneratingAudio(true);
    setError(null);
    
    try {
      const result = await generateAudio(translationResult.translation, targetLanguage, useManagedKeys ? undefined : customKeys);
      setAudioUrl(result.audioUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Audio generation failed');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleStartOver = () => {
    setMessage("");
    setTranslationResult(null);
    setBackTranslationResult(null);
    setAudioUrl(null);
    setIsEditingTranslation(false);
    setError(null);
    setIsPlaying(false);
    
    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // Settings handlers
  const handlePresetChange = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = recipientPresets.find(p => p.id === presetId);
    if (preset) {
      setTargetLanguage(preset.language);
    }
  };

  const handlePresetCreate = (presetData: Omit<RecipientPreset, 'id'>) => {
    const newPreset: RecipientPreset = {
      ...presetData,
      id: Date.now().toString(), // Simple ID generation
    };
    setRecipientPresets(prev => [...prev, newPreset]);
  };

  const handlePresetDelete = (presetId: string) => {
    setRecipientPresets(prev => prev.filter(p => p.id !== presetId));
    if (selectedPresetId === presetId) {
      setSelectedPresetId(undefined);
    }
  };

  const handleSystemPromptChange = (prompt: string) => {
    setSystemPrompt(prompt);
    setHasEditedPrompt(true);
  };

  const handleManagedKeysChange = (managed: boolean) => {
    setUseManagedKeys(managed);
    if (managed) {
      // Clear custom keys when switching back to managed
      setCustomKeys({ anthropic: "", elevenlabs: "" });
    }
  };

  const handleCustomKeysChange = (keys: { anthropic: string; elevenlabs: string }) => {
    setCustomKeys(keys);
  };

  // Load settings from localStorage and sessionStorage on mount
  useEffect(() => {
    const savedPresets = localStorage.getItem('translatebridge-presets');
    const savedSystemPrompt = localStorage.getItem('translatebridge-system-prompt');
    const savedHasEditedPrompt = localStorage.getItem('translatebridge-has-edited-prompt');
    const savedSelectedPreset = localStorage.getItem('translatebridge-selected-preset');
    const savedUseManagedKeys = sessionStorage.getItem('translatebridge-use-managed-keys');
    const savedCustomKeys = sessionStorage.getItem('translatebridge-custom-keys');
    
    if (savedPresets) {
      try {
        setRecipientPresets(JSON.parse(savedPresets));
      } catch (e) {
        console.warn('Failed to load saved presets:', e);
      }
    }
    
    if (savedSystemPrompt) {
      setSystemPrompt(savedSystemPrompt);
    }
    
    if (savedHasEditedPrompt) {
      try {
        setHasEditedPrompt(JSON.parse(savedHasEditedPrompt));
      } catch (e) {
        console.warn('Failed to load hasEditedPrompt:', e);
      }
    }
    
    if (savedSelectedPreset) {
      setSelectedPresetId(savedSelectedPreset);
    }
    
    if (savedUseManagedKeys !== null) {
      setUseManagedKeys(savedUseManagedKeys === 'true');
    }
    
    if (savedCustomKeys) {
      try {
        setCustomKeys(JSON.parse(savedCustomKeys));
      } catch (e) {
        console.warn('Failed to load saved custom keys:', e);
      }
    }
  }, []);

  // Save settings to localStorage and sessionStorage when they change
  useEffect(() => {
    localStorage.setItem('translatebridge-presets', JSON.stringify(recipientPresets));
  }, [recipientPresets]);

  useEffect(() => {
    localStorage.setItem('translatebridge-system-prompt', systemPrompt);
  }, [systemPrompt]);

  useEffect(() => {
    localStorage.setItem('translatebridge-has-edited-prompt', JSON.stringify(hasEditedPrompt));
  }, [hasEditedPrompt]);

  useEffect(() => {
    if (selectedPresetId) {
      localStorage.setItem('translatebridge-selected-preset', selectedPresetId);
    } else {
      localStorage.removeItem('translatebridge-selected-preset');
    }
  }, [selectedPresetId]);

  useEffect(() => {
    sessionStorage.setItem('translatebridge-use-managed-keys', useManagedKeys.toString());
  }, [useManagedKeys]);

  useEffect(() => {
    sessionStorage.setItem('translatebridge-custom-keys', JSON.stringify(customKeys));
  }, [customKeys]);

  const handleEditTranslation = () => {
    if (translationResult) {
      setEditedTranslation(translationResult.translation);
      setIsEditingTranslation(true);
    }
  };

  const handleSaveEdit = () => {
    if (translationResult) {
      setTranslationResult({
        ...translationResult,
        translation: editedTranslation
      });
      setIsEditingTranslation(false);
      // Re-run back-translation with edited text
      handleBackTranslate(editedTranslation);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingTranslation(false);
    setEditedTranslation("");
  };

  const handlePlayAudio = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleDownloadAudio = () => {
    if (!audioUrl || !translationResult) return;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `translation-${targetLanguage}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">TranslateBridge</h1>
                <p className="text-xs text-muted-foreground">
                  AI-Powered Communication Across Languages
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <SettingsDrawer
                recipientPresets={recipientPresets}
                selectedPresetId={selectedPresetId}
                onPresetChange={handlePresetChange}
                onPresetCreate={handlePresetCreate}
                onPresetDelete={handlePresetDelete}
                systemPrompt={systemPrompt}
                onSystemPromptChange={handleSystemPromptChange}
                useManagedKeys={useManagedKeys}
                onManagedKeysChange={handleManagedKeysChange}
                customKeys={customKeys}
                onCustomKeysChange={handleCustomKeysChange}
              />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Single Page */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Message Input - Always at Top */}
          <Card>
            <CardHeader className="pb-4">
              <h2 className="text-lg font-semibold">Your Message</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">What would you like to say?</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="min-h-24 resize-none"
                  data-testid="textarea-main-message"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Label htmlFor="language">Translate to</Label>
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger data-testid="select-target-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-6">
                  <Button
                    onClick={handleTranslate}
                    disabled={!message.trim() || isTranslating}
                    size="lg"
                    className="px-8"
                    data-testid="button-translate"
                  >
                    {isTranslating ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        <span>Translating...</span>
                      </div>
                    ) : (
                      "Translate"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Translation Result */}
          {translationResult && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <h3 className="text-base font-semibold">Translation</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEditTranslation}
                  disabled={isEditingTranslation}
                  className="hover-elevate"
                  data-testid="button-edit-translation"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditingTranslation ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editedTranslation}
                      onChange={(e) => setEditedTranslation(e.target.value)}
                      className="min-h-16"
                      data-testid="textarea-edit-translation"
                    />
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={handleSaveEdit} data-testid="button-save-edit">
                        <Check className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-md">
                    <p className="text-base leading-relaxed">{translationResult.translation}</p>
                  </div>
                )}
                
                <div className="p-3 bg-accent/30 rounded-md">
                  <p className="text-sm text-muted-foreground mb-1">Cultural Notes:</p>
                  <p className="text-sm">{translationResult.culturalNotes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quality Check */}
          {backTranslationResult && (
            <Card>
              <CardHeader>
                <h3 className="text-base font-semibold">Quality Check</h3>
                <p className="text-sm text-muted-foreground">
                  Does this look right to you?
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <Badge variant="outline" className="mb-2">Original</Badge>
                    <p className="bg-muted/30 p-3 rounded-md">{message}</p>
                  </div>
                  <div>
                    <Badge variant="secondary" className="mb-2">Translation</Badge>
                    <p className="bg-secondary/10 p-3 rounded-md font-medium">
                      {translationResult?.translation}
                    </p>
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-2">Back-check</Badge>
                    <p className="bg-accent/30 p-3 rounded-md">
                      {isBackTranslating ? "Checking..." : backTranslationResult.backTranslation}
                    </p>
                  </div>
                </div>
                
                <div className="p-3 bg-card border border-card-border rounded-md">
                  <p className="text-sm text-muted-foreground mb-1">Cultural Analysis:</p>
                  <p className="text-sm">{backTranslationResult.culturalAnalysis}</p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleStartOver}
                    variant="outline"
                    className="flex-1"
                    disabled={isGeneratingAudio}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Start Over
                  </Button>
                  <Button
                    onClick={handleApprove}
                    className="flex-1"
                    disabled={isGeneratingAudio}
                    data-testid="button-approve"
                  >
                    {isGeneratingAudio ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        <span>Generating Audio...</span>
                      </div>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Generate Audio
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Audio Player */}
          {audioUrl && (
            <Card>
              <CardHeader>
                <h3 className="text-base font-semibold">Your Audio is Ready</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-md">
                  <p className="text-sm text-muted-foreground mb-1">Audio Content:</p>
                  <p className="text-base">{translationResult?.translation}</p>
                </div>
                
                <div className="flex items-center justify-center space-x-4">
                  <Button 
                    size="lg" 
                    className="w-16 h-16 rounded-full p-0"
                    onClick={handlePlayAudio}
                    disabled={!audioUrl}
                    data-testid="button-play-audio"
                  >
                    {isPlaying ? (
                      <div className="w-6 h-6 border-2 border-primary-foreground rounded-sm" />
                    ) : (
                      <Play className="w-6 h-6 ml-0.5" />
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="hover-elevate"
                    onClick={handleDownloadAudio}
                    disabled={!audioUrl}
                    data-testid="button-download-audio"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="ghost" onClick={handleStartOver}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Start Over
                  </Button>
                </div>
                
                {/* Hidden audio element for playback */}
                {audioUrl && (
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={handleAudioEnded}
                    className="hidden"
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}