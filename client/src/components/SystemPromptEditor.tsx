import { useState } from "react";
import { Settings, Save, Eye, Code, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PatientPreset } from "./PatientPresetSelector";

interface SystemPromptEditorProps {
  selectedPreset?: PatientPreset;
  onSave: (prompt: string) => void;
}

export function SystemPromptEditor({ selectedPreset, onSave }: SystemPromptEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  const getDefaultPrompt = () => {
    const greeting = selectedPreset?.greeting || "{GREETING}";
    const patientName = selectedPreset?.name || "{PATIENT_NAME}";
    const tone = selectedPreset?.tone || "professional";
    const language = selectedPreset?.language || "{TARGET_LANGUAGE}";
    const customInstructions = selectedPreset?.customInstructions || "";

    return `<system_instructions>
You are a healthcare translation AI specialized in culturally-sensitive medical communication. You will receive an English message that needs to be translated for patient care.

<patient_context>
Patient: ${patientName}
Greeting: ${greeting}
Tone: ${tone}
Language: ${language}
${customInstructions ? `Additional Context: ${customInstructions}` : ''}
</patient_context>

<translation_requirements>
1. Use formal, respectful medical language appropriate for healthcare settings
2. Maintain accuracy of medical terminology and dosage information
3. Consider cultural communication patterns for the target language
4. Include appropriate greetings and honorifics based on patient context
5. Ensure clarity for patients who may have limited literacy
</translation_requirements>

<response_format>
Before providing the translation, think through the cultural and linguistic considerations:

<thinking>
- What cultural communication patterns should I consider for ${language}?
- Are there specific medical terms that need cultural adaptation?
- How should I structure this message to be most clear and respectful?
- What tone adjustments are needed for this patient context?
</thinking>

Then provide your translation in this exact format:

<translation>
[Your ${language} translation here, including ${greeting} if appropriate]
</translation>

<reasoning>
[Explain your cultural and linguistic choices, including why you structured the message this way and any specific cultural considerations you applied]
</reasoning>
</response_format>
</system_instructions>`;
  };

  const [previewPrompt, setPreviewPrompt] = useState(getDefaultPrompt());

  const handleSave = () => {
    const finalPrompt = customPrompt || previewPrompt;
    onSave(finalPrompt);
    setIsOpen(false);
    console.log('System prompt saved:', finalPrompt);
  };

  const handleReset = () => {
    setCustomPrompt("");
    setPreviewPrompt(getDefaultPrompt());
    console.log('System prompt reset to default');
  };

  const exampleTranslationCall = `// Translation API Call Structure
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-20250514",
  system: systemPrompt, // Your customized prompt above
  messages: [
    {
      role: "user", 
      content: "Please take your medication with food after meals."
    }
  ],
  max_tokens: 1000
});`;

  const exampleBackTranslationCall = `// Back-translation Quality Control
const backTranslationResponse = await anthropic.messages.create({
  model: "claude-sonnet-4-20250514",
  system: "You are a medical translator. Translate this [LANGUAGE] text back to English, maintaining medical accuracy.",
  messages: [
    {
      role: "user",
      content: \`Original English: "\${originalMessage}"
      
[LANGUAGE] Translation: "\${translation}"

Please translate the [LANGUAGE] version back to English for quality verification.\`
    }
  ],
  max_tokens: 500
});`;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          data-testid="button-system-prompt-editor"
          className="hover-elevate"
        >
          <Code className="w-4 h-4 mr-2" />
          System Prompt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Advanced System Prompt Configuration</span>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="prompt" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="prompt">XML Prompt Structure</TabsTrigger>
            <TabsTrigger value="preview">Live Preview</TabsTrigger>
            <TabsTrigger value="api">API Integration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="prompt" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="system-prompt">System Prompt Template</Label>
              <div className="text-sm text-muted-foreground mb-2">
                This prompt uses XML tags for structured reasoning and chain-of-thought processing.
                Variables like {'{PATIENT_NAME}'} will be replaced with actual preset values.
              </div>
              <Textarea
                id="system-prompt"
                value={customPrompt || previewPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="min-h-96 font-mono text-sm"
                placeholder="Customize your system prompt here..."
                data-testid="textarea-system-prompt"
              />
            </div>
            
            <div className="flex justify-between">
              <Button
                onClick={handleReset}
                variant="ghost"
                size="sm"
                data-testid="button-reset-prompt"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to Default
              </Button>
              <div className="space-x-2">
                <Button
                  onClick={() => setPreviewPrompt(customPrompt || previewPrompt)}
                  variant="outline"
                  size="sm"
                  data-testid="button-update-preview"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Update Preview
                </Button>
                <Button onClick={handleSave} data-testid="button-save-prompt">
                  <Save className="w-4 h-4 mr-2" />
                  Save Prompt
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Live Preview</Badge>
                {selectedPreset && (
                  <Badge variant="outline">
                    Patient: {selectedPreset.name} ({selectedPreset.language})
                  </Badge>
                )}
              </div>
              
              <Card>
                <CardHeader className="pb-3">
                  <h4 className="text-sm font-medium">Generated System Prompt</h4>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted/50 p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
                    {previewPrompt}
                  </pre>
                </CardContent>
              </Card>
              
              <div className="text-sm text-muted-foreground">
                <p><strong>Key XML Elements:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><code>&lt;thinking&gt;</code> - Chain-of-thought reasoning before translation</li>
                  <li><code>&lt;translation&gt;</code> - Structured output for the translated text</li>
                  <li><code>&lt;reasoning&gt;</code> - Cultural context explanation</li>
                  <li><code>&lt;patient_context&gt;</code> - Patient-specific customization variables</li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="api" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Translation API Call</Label>
                <Card className="mt-2">
                  <CardContent className="pt-4">
                    <pre className="text-xs bg-muted/50 p-4 rounded-md overflow-x-auto">
                      {exampleTranslationCall}
                    </pre>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Label>Back-Translation Quality Control</Label>
                <Card className="mt-2">
                  <CardContent className="pt-4">
                    <pre className="text-xs bg-muted/50 p-4 rounded-md overflow-x-auto">
                      {exampleBackTranslationCall}
                    </pre>
                  </CardContent>
                </Card>
              </div>
              
              <div className="p-3 bg-accent/30 rounded-md">
                <p className="text-sm">
                  <strong>Data Flow:</strong> User Input → System Prompt + Message → Claude Translation → 
                  Back-translation Verification → ElevenLabs Audio Generation
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}