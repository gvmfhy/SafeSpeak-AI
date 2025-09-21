import { useState, useRef, useEffect } from "react";
import { MessageSquare, Settings, Pencil, Check, X, Play, Download, RotateCcw, AlertCircle, Edit, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "./ThemeToggle";
import { SettingsDrawer, type RecipientPreset } from "./SettingsDrawer";
import { translateMessage, backTranslateMessage, generateAudio, refineTranslation, streamTranslation } from "@/lib/api";

export function TranslateBridge() {
  // Application state - single page, no steps
  const [isTranslating, setIsTranslating] = useState(false);
  const [isBackTranslating, setIsBackTranslating] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  
  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [cancelStream, setCancelStream] = useState<(() => void) | null>(null);

  // Core data
  const [message, setMessage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("spanish");
  
  // Results
  const [translationResult, setTranslationResult] = useState<{
    translation: string;
    culturalNotes: string;
    intent?: string;
    culturalConsiderations?: string;
    strategy?: string;
  } | null>(null);
  
  const [backTranslationResult, setBackTranslationResult] = useState<{
    backTranslation: string;
    culturalAnalysis: string;
    literalTranslation?: string;
    perceivedTone?: string;
    culturalNuance?: string;
  } | null>(null);
  
  // Refinement state
  const [isRefining, setIsRefining] = useState(false);
  const [refinementFeedback, setRefinementFeedback] = useState("");
  const [showRefinement, setShowRefinement] = useState(false);
  const [refinementResult, setRefinementResult] = useState<{
    revisedTranslation: string;
    changesExplanation: string;
    improvementNotes: string;
  } | null>(null);
  
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  // UI state
  const [isEditingTranslation, setIsEditingTranslation] = useState(false);
  const [editedTranslation, setEditedTranslation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showRefineSection, setShowRefineSection] = useState<boolean>(false);
  const [streamPreview, setStreamPreview] = useState<string>('');
  const [showStreamPreview, setShowStreamPreview] = useState<boolean>(false);
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
    { value: "japanese", label: "Japanese" },
    { value: "arabic", label: "Arabic" },
    { value: "french", label: "French" },
    { value: "portuguese", label: "Portuguese" },
    { value: "russian", label: "Russian" },
    { value: "korean", label: "Korean" },
    { value: "vietnamese", label: "Vietnamese" },
  ];

  // Helper functions to eliminate repetition
  const getLanguageLabel = () => {
    const selectedLang = languages.find(lang => lang.value === targetLanguage);
    return selectedLang ? selectedLang.label : targetLanguage;
  };

  const getApiKeys = () => useManagedKeys ? undefined : customKeys;

  const handleTranslate = async () => {
    if (!message.trim()) return;
    
    setIsTranslating(true);
    setIsStreaming(true);
    setStreamingText("");
    setTranslationResult(null);
    setBackTranslationResult(null);
    setAudioUrl(null);
    setError(null);
    
    // Cancel any existing stream
    if (cancelStream) {
      cancelStream();
      setCancelStream(null);
    }
    
    try {
      // Get preset context if one is selected
      const selectedPreset = recipientPresets.find(p => p.id === selectedPresetId);
      const presetContext = selectedPreset ? {
        tone: selectedPreset.tone,
        culturalContext: selectedPreset.culturalContext,
        customPrompt: selectedPreset.customPrompt
      } : undefined;
      
      // Append the target language to the message so Claude knows exactly what language to translate to
      const messageWithLanguage = `${message} [translate to ${getLanguageLabel()}]`;
      
      // Start streaming translation for immediate feedback
      const cancel = await streamTranslation(
        messageWithLanguage,
        getLanguageLabel(),
        {
          onStart: () => {
            console.log("🚀 Streaming started");
            setStreamingText("");
            setStreamPreview("");
            setShowStreamPreview(true);
          },
          onChunk: (chunk: string) => {
            console.log("📝 Streaming chunk:", chunk);
            
            // Update stream preview immediately for responsive feedback
            setStreamPreview(prev => prev + chunk);
            
            // Add artificial delay for main translation display for better typewriter effect
            setTimeout(() => {
              setStreamingText(prev => {
                const newText = prev + chunk;
                console.log("📄 Current streaming text:", newText);
                return newText;
              });
            }, 50); // 50ms delay between chunks for visible typewriter effect
          },
          onComplete: async (fullText: string) => {
            console.log("✅ Streaming complete:", fullText);
            setIsStreaming(false);
            setStreamingText(fullText);
            
            // Fade out stream preview after a delay
            setTimeout(() => {
              setShowStreamPreview(false);
            }, 1200);
            
            // Now run structured analysis in background for complete cultural intelligence
            try {
              const structuredResult = await translateMessage(messageWithLanguage, getLanguageLabel(), hasEditedPrompt ? systemPrompt : undefined, presetContext, getApiKeys());
              
              // Merge streaming result with structured analysis
              setTranslationResult({
                translation: fullText, // Use streaming result for translation
                culturalNotes: structuredResult.culturalNotes,
                intent: structuredResult.intent,
                culturalConsiderations: structuredResult.culturalConsiderations,
                strategy: structuredResult.strategy
              });
              
              // Start back-translation in background
              setTimeout(() => {
                handleBackTranslate(fullText);
              }, 500);
              
            } catch (analysisError) {
              // If structured analysis fails, still use streaming result
              setTranslationResult({
                translation: fullText,
                culturalNotes: "Analysis temporarily unavailable",
                intent: "User intent analysis pending",
                culturalConsiderations: "Cultural analysis pending", 
                strategy: "Translation strategy pending"
              });
            }
          },
          onError: (error: string) => {
            setIsStreaming(false);
            setError(`Streaming failed: ${error}`);
          }
        },
        hasEditedPrompt ? systemPrompt : undefined,
        presetContext,
        getApiKeys()
      );
      
      setCancelStream(() => cancel);
      
    } catch (err) {
      setIsStreaming(false);
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
      // Use original message for back-translation (not the one with language appended)
      const result = await backTranslateMessage(message, translationToUse, getLanguageLabel(), getApiKeys());
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
      const result = await generateAudio(translationResult.translation, getLanguageLabel(), getApiKeys());
      setAudioUrl(result.audioUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Audio generation failed');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleRefine = async () => {
    if (!translationResult || !refinementFeedback.trim()) return;
    
    setIsRefining(true);
    setError(null);
    
    try {
      const result = await refineTranslation({
        originalMessage: message,
        currentTranslation: translationResult.translation,
        targetLanguage,
        userFeedback: refinementFeedback,
        conversationContext: `Original analysis - Intent: ${translationResult.intent || 'N/A'}, Cultural Considerations: ${translationResult.culturalConsiderations || 'N/A'}, Strategy: ${translationResult.strategy || 'N/A'}. Target language: ${getLanguageLabel()}`
      }, getApiKeys());
      
      setRefinementResult(result);
      
      // Clear feedback input
      setRefinementFeedback("");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation refinement failed');
    } finally {
      setIsRefining(false);
    }
  };

  const handleUseRefinedTranslation = () => {
    if (!refinementResult) return;
    
    // Update the translation result with the refined version
    setTranslationResult(prev => prev ? {
      ...prev,
      translation: refinementResult.revisedTranslation
    } : null);
    
    // Clear refinement state
    setRefinementResult(null);
    setShowRefinement(false);
    
    // Re-run back-translation on the refined version
    handleBackTranslate(refinementResult.revisedTranslation);
  };

  const handleStartOver = () => {
    setMessage("");
    setTranslationResult(null);
    setBackTranslationResult(null);
    setAudioUrl(null);
    setIsEditingTranslation(false);
    setError(null);
    setIsPlaying(false);
    setShowRefinement(false);
    setRefinementFeedback("");
    setRefinementResult(null);
    
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

          {/* Step 1: Translate */}
          <Card>
            <CardHeader className="pb-4">
              <h2 className="text-lg font-semibold">Step 1: Translate</h2>
              <p className="text-sm text-muted-foreground">Enter your message and select target language</p>
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
                
                <div className="pt-6 relative">
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
                  
                  {/* Streaming Preview Ticker */}
                  {showStreamPreview && (
                    <div 
                      className="absolute top-full left-0 mt-2 p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-md shadow-sm z-10 max-w-xs"
                      data-testid="stream-ticker"
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">AI Translating...</span>
                      </div>
                      <p className="text-sm text-blue-800 dark:text-blue-200 truncate">
                        {streamPreview}
                        {isStreaming && <span className="animate-pulse text-blue-500">|</span>}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Translation Results & Step 3: Safety Check */}
          {translationResult && (
            <div className="space-y-6">
              
              {/* Step 2 Header */}
              <div className="text-center">
                <h2 className="text-lg font-semibold">Step 2: Translation Complete</h2>
                <p className="text-sm text-muted-foreground">Review your translation and approve or refine as needed</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* AI Reasoning Box (Visible by default) */}
                <Card>
                  <CardHeader>
                    <h3 className="text-base font-semibold">AI Reasoning</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {translationResult.intent && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 rounded-r-md">
                        <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">Communication Intent:</p>
                        <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">{translationResult.intent}</p>
                      </div>
                    )}
                    
                    {translationResult.culturalConsiderations && (
                      <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border-l-4 border-purple-500 rounded-r-md">
                        <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">Cultural Considerations:</p>
                        <p className="text-sm text-purple-900 dark:text-purple-100 leading-relaxed">{translationResult.culturalConsiderations}</p>
                      </div>
                    )}
                    
                    {translationResult.strategy && (
                      <div className="p-3 bg-green-50 dark:bg-green-950/30 border-l-4 border-green-500 rounded-r-md">
                        <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">Translation Strategy:</p>
                        <p className="text-sm text-green-900 dark:text-green-100 leading-relaxed">{translationResult.strategy}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Translation Box (The final text) */}
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
                  <CardContent>
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
                        <p className="text-base leading-relaxed font-medium">{translationResult.translation}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Safety Check Box (The blind verification) - Placeholder until back-translation loads */}
                <Card>
                  <CardHeader>
                    <h3 className="text-base font-semibold">Safety Check</h3>
                  </CardHeader>
                  <CardContent>
                    {backTranslationResult ? (
                      <div className="space-y-4">
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 rounded-r-md">
                          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-2">Back-Translation:</p>
                          <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">{backTranslationResult.backTranslation}</p>
                        </div>
                        
                        {backTranslationResult.perceivedTone && (
                          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 rounded-r-md">
                            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">Perceived Tone:</p>
                            <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">{backTranslationResult.perceivedTone}</p>
                          </div>
                        )}
                        
                        {backTranslationResult.culturalNuance && (
                          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border-l-4 border-rose-500 rounded-r-md">
                            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300 mb-2">Cultural Nuance:</p>
                            <p className="text-sm text-rose-900 dark:text-rose-100 leading-relaxed">{backTranslationResult.culturalNuance}</p>
                          </div>
                        )}
                        
                        {backTranslationResult.culturalAnalysis && (
                          <div className="p-3 bg-slate-50 dark:bg-slate-950/30 border-l-4 border-slate-500 rounded-r-md">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Overall Assessment:</p>
                            <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed">{backTranslationResult.culturalAnalysis}</p>
                          </div>
                        )}
                      </div>
                    ) : isBackTranslating ? (
                      <div className="p-4 text-center">
                        <div className="inline-flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm text-muted-foreground">Running safety check...</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center">
                        <Button 
                          onClick={() => handleBackTranslate()} 
                          variant="outline" 
                          size="sm"
                          data-testid="button-run-safety-check"
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Run Safety Check
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          Optional: Verify translation accuracy
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Primary Action Section - Centered and Immediate */}
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Button
                    onClick={handleApprove}
                    size="lg"
                    className="px-8 py-3 text-lg"
                    disabled={isGeneratingAudio}
                    data-testid="button-approve-generate"
                  >
                    {isGeneratingAudio ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        <span>Generating Audio...</span>
                      </div>
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Approve & Generate Audio
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Secondary Refine Section - Collapsible */}
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRefineSection(!showRefineSection)}
                    data-testid="button-refine-toggle"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Need to refine it?
                    <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showRefineSection ? 'rotate-180' : ''}`} />
                  </Button>
                </div>
                
                {/* Collapsible Refine Section */}
                {showRefineSection && (
                  <Card className="bg-muted/30">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <Label>Tell us how to improve the translation:</Label>
                        <Textarea
                          value={refinementFeedback}
                          onChange={(e) => setRefinementFeedback(e.target.value)}
                          placeholder="e.g., 'Make it more formal' or 'Add politeness markers'"
                          className="min-h-[80px] resize-none"
                          data-testid="textarea-refine-feedback"
                        />
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleRefine}
                            disabled={!refinementFeedback.trim() || isRefining}
                            data-testid="button-revise"
                          >
                            {isRefining ? 'Revising...' : 'Revise Translation'}
                          </Button>
                          <Button 
                            variant="ghost" 
                            onClick={() => setShowRefineSection(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Step 3: Safety Check (Background) */}
              <div className="text-center">
                <h2 className="text-lg font-semibold">Step 3: Safety Check <span className="text-sm text-muted-foreground">(Background)</span></h2>
                <p className="text-sm text-muted-foreground">Independent verification running automatically</p>
              </div>
            </div>
          )}


          {/* Refinement Result */}
          {refinementResult && (
            <Card>
              <CardHeader>
                <h3 className="text-base font-semibold">Refined Translation</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
                  <p className="text-base leading-relaxed font-medium">{refinementResult.revisedTranslation}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-muted/30 rounded-md">
                    <p className="font-medium text-foreground mb-1">Changes Made:</p>
                    <p className="text-muted-foreground">{refinementResult.changesExplanation}</p>
                  </div>
                  
                  <div className="p-3 bg-muted/30 rounded-md">
                    <p className="font-medium text-foreground mb-1">Improvement Notes:</p>
                    <p className="text-muted-foreground">{refinementResult.improvementNotes}</p>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    onClick={handleUseRefinedTranslation}
                    className="flex-1"
                    data-testid="button-use-refined"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Use This Translation
                  </Button>
                  <Button
                    onClick={() => setRefinementResult(null)}
                    variant="outline"
                    className="flex-1"
                    data-testid="button-discard-refined"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Discard
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