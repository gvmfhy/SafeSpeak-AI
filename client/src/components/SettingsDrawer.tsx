import { useState, useEffect } from "react";
import { Settings, User, Code, Key, Plus, Save, X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface RecipientPreset {
  id: string;
  name: string;
  description: string;
  language: string;
  tone: "formal" | "friendly" | "professional" | "warm";
  culturalContext: string;
  customPrompt?: string;
}

interface SettingsDrawerProps {
  recipientPresets: RecipientPreset[];
  selectedPresetId?: string;
  onPresetChange: (presetId: string) => void;
  onPresetCreate: (preset: Omit<RecipientPreset, 'id'>) => void;
  onPresetDelete: (presetId: string) => void;
  systemPrompt: string;
  onSystemPromptChange: (prompt: string) => void;
  useManagedKeys: boolean;
  onManagedKeysChange: (useManagedKeys: boolean) => void;
  customKeys: { anthropic: string; elevenlabs: string };
  onCustomKeysChange: (keys: { anthropic: string; elevenlabs: string }) => void;
}

export function SettingsDrawer({
  recipientPresets,
  selectedPresetId,
  onPresetChange,
  onPresetCreate,
  onPresetDelete,
  systemPrompt,
  onSystemPromptChange,
  useManagedKeys,
  onManagedKeysChange,
  customKeys,
  onCustomKeysChange,
}: SettingsDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreatePresetOpen, setIsCreatePresetOpen] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);

  const [newPreset, setNewPreset] = useState({
    name: "",
    description: "",
    language: "spanish",
    tone: "friendly" as const,
    culturalContext: "",
    customPrompt: "",
  });

  const [editedSystemPrompt, setEditedSystemPrompt] = useState(systemPrompt);

  // Sync editedSystemPrompt with prop changes (e.g., after localStorage load)
  useEffect(() => {
    setEditedSystemPrompt(systemPrompt);
  }, [systemPrompt]);

  const handleCreatePreset = () => {
    if (newPreset.name.trim() && newPreset.description.trim()) {
      onPresetCreate(newPreset);
      setIsCreatePresetOpen(false);
      setNewPreset({
        name: "",
        description: "",
        language: "spanish",
        tone: "friendly",
        culturalContext: "",
        customPrompt: "",
      });
    }
  };

  const handleSaveSystemPrompt = () => {
    onSystemPromptChange(editedSystemPrompt);
    // Show success feedback would go here if we had toast system
  };

  const resetSystemPrompt = () => {
    const defaultPrompt = `Claude, please think through this carefully.

I need you to translate the following message with cultural sensitivity and appropriate tone. Consider the cultural context, communication patterns, and any nuances that would make this message more natural and respectful in the target culture.

<thinking>
[Consider cultural context, tone, formality level, and word choices that would be most appropriate]
</thinking>

<translation>
[Your translation in the target language]
</translation>

<cultural_notes>
[Explain any cultural adaptations you made and why they improve communication effectiveness]
</cultural_notes>`;
    
    setEditedSystemPrompt(defaultPrompt);
  };

  const selectedPreset = recipientPresets.find(p => p.id === selectedPresetId);
  
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

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          data-testid="button-settings"
          className="hover-elevate"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          <Tabs defaultValue="presets" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="presets">Recipients</TabsTrigger>
              <TabsTrigger value="prompt">System Prompt</TabsTrigger>
              <TabsTrigger value="keys">API Keys</TabsTrigger>
            </TabsList>

            {/* Recipient Presets Tab */}
            <TabsContent value="presets" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Recipient Presets</h3>
                <Dialog open={isCreatePresetOpen} onOpenChange={setIsCreatePresetOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid="button-add-preset"
                      className="hover-elevate"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Preset
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create Recipient Preset</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="preset-name">Name</Label>
                        <Input
                          id="preset-name"
                          placeholder="e.g., Business Partner, Family Member"
                          value={newPreset.name}
                          onChange={(e) => setNewPreset({ ...newPreset, name: e.target.value })}
                          data-testid="input-preset-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="preset-description">Description</Label>
                        <Input
                          id="preset-description"
                          placeholder="Brief description of this recipient"
                          value={newPreset.description}
                          onChange={(e) => setNewPreset({ ...newPreset, description: e.target.value })}
                          data-testid="input-preset-description"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="preset-language">Default Language</Label>
                        <Select
                          value={newPreset.language}
                          onValueChange={(value) => setNewPreset({ ...newPreset, language: value })}
                        >
                          <SelectTrigger data-testid="select-preset-language">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map(lang => (
                              <SelectItem key={lang.value} value={lang.value}>
                                {lang.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="preset-tone">Communication Tone</Label>
                        <Select
                          value={newPreset.tone}
                          onValueChange={(value) => setNewPreset({ ...newPreset, tone: value as any })}
                        >
                          <SelectTrigger data-testid="select-preset-tone">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="formal">Formal</SelectItem>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="friendly">Friendly</SelectItem>
                            <SelectItem value="warm">Warm</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="preset-context">Cultural Context</Label>
                        <Textarea
                          id="preset-context"
                          placeholder="Any specific cultural considerations for this recipient..."
                          value={newPreset.culturalContext}
                          onChange={(e) => setNewPreset({ ...newPreset, culturalContext: e.target.value })}
                          data-testid="textarea-preset-context"
                          className="min-h-20"
                        />
                      </div>
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsCreatePresetOpen(false)}
                          data-testid="button-cancel-preset"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreatePreset}
                          data-testid="button-save-preset"
                        >
                          Save Preset
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3">
                {recipientPresets.length === 0 ? (
                  <Card className="p-6 text-center text-muted-foreground">
                    <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recipient presets created yet</p>
                    <p className="text-xs mt-1">Create presets to quickly customize translations for specific recipients</p>
                  </Card>
                ) : (
                  recipientPresets.map((preset) => (
                    <Card key={preset.id} className={`p-4 cursor-pointer hover-elevate ${selectedPreset?.id === preset.id ? 'border-primary' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex-1"
                          onClick={() => onPresetChange(preset.id)}
                          data-testid={`preset-card-${preset.id}`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-sm">{preset.name}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {languages.find(l => l.value === preset.language)?.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{preset.description}</p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {preset.tone}
                            </Badge>
                            {preset.culturalContext && (
                              <Badge variant="outline" className="text-xs">
                                Cultural Context
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onPresetDelete(preset.id)}
                          data-testid={`button-delete-preset-${preset.id}`}
                          className="hover-elevate"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* System Prompt Tab */}
            <TabsContent value="prompt" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">System Prompt</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetSystemPrompt}
                    data-testid="button-reset-prompt"
                    className="hover-elevate"
                  >
                    Reset to Default
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveSystemPrompt}
                    data-testid="button-save-prompt"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
              
              <Alert>
                <Code className="h-4 w-4" />
                <AlertDescription>
                  Customize the system prompt to control how Claude approaches translations. Use variables like {`{TARGET_LANGUAGE}`} for dynamic content.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="system-prompt">System Prompt</Label>
                <Textarea
                  id="system-prompt"
                  value={editedSystemPrompt}
                  onChange={(e) => setEditedSystemPrompt(e.target.value)}
                  className="min-h-64 font-mono text-sm"
                  data-testid="textarea-system-prompt"
                />
              </div>
            </TabsContent>

            {/* API Keys Tab */}
            <TabsContent value="keys" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">API Key Management</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowApiKeys(!showApiKeys)}
                  data-testid="button-toggle-api-keys"
                  className="hover-elevate"
                >
                  {showApiKeys ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showApiKeys ? "Hide" : "Show"}
                </Button>
              </div>

              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  Choose between managed API keys (handled by TranslateBridge) or bring your own keys for maximum control.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="managed-keys"
                    checked={useManagedKeys}
                    onCheckedChange={onManagedKeysChange}
                    data-testid="switch-managed-keys"
                  />
                  <Label htmlFor="managed-keys">Use managed API keys</Label>
                </div>

                {!useManagedKeys && (
                  <div className="space-y-4 border rounded-md p-4 bg-muted/30">
                    <h4 className="font-medium text-sm">Your API Keys</h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="anthropic-key">Anthropic API Key</Label>
                      <Input
                        id="anthropic-key"
                        type={showApiKeys ? "text" : "password"}
                        placeholder="sk-ant-..."
                        value={customKeys.anthropic}
                        onChange={(e) => onCustomKeysChange({ ...customKeys, anthropic: e.target.value })}
                        data-testid="input-anthropic-key"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="elevenlabs-key">ElevenLabs API Key</Label>
                      <Input
                        id="elevenlabs-key"
                        type={showApiKeys ? "text" : "password"}
                        placeholder="your_api_key_here"
                        value={customKeys.elevenlabs}
                        onChange={(e) => onCustomKeysChange({ ...customKeys, elevenlabs: e.target.value })}
                        data-testid="input-elevenlabs-key"
                      />
                    </div>

                    <Alert>
                      <AlertDescription className="text-xs">
                        Your API keys are stored locally and never sent to our servers except for making API calls on your behalf.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {useManagedKeys && (
                  <div className="border rounded-md p-4 bg-accent/30">
                    <h4 className="font-medium text-sm mb-2">Managed Keys Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Anthropic (Claude)</span>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>ElevenLabs (Audio)</span>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}