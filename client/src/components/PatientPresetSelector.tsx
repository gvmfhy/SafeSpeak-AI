import { useState } from "react";
import { Settings, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface PatientPreset {
  id: string;
  name: string;
  greeting: string;
  tone: string;
  customInstructions: string;
  language: string;
}

interface PatientPresetSelectorProps {
  presets: PatientPreset[];
  selectedPresetId?: string;
  onPresetChange: (presetId: string) => void;
  onPresetCreate: (preset: Omit<PatientPreset, 'id'>) => void;
}

export function PatientPresetSelector({
  presets,
  selectedPresetId,
  onPresetChange,
  onPresetCreate,
}: PatientPresetSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPreset, setNewPreset] = useState({
    name: "",
    greeting: "",
    tone: "warm",
    customInstructions: "",
    language: "mandarin",
  });

  const selectedPreset = presets.find(p => p.id === selectedPresetId);

  const handleCreatePreset = () => {
    if (newPreset.name.trim()) {
      onPresetCreate(newPreset);
      setIsDialogOpen(false);
      setNewPreset({
        name: "",
        greeting: "",
        tone: "warm",
        customInstructions: "",
        language: "mandarin",
      });
      console.log('Preset created:', newPreset);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4" />
          <h3 className="text-sm font-medium">Patient Preset</h3>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              data-testid="button-create-preset"
              className="hover-elevate"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Patient Preset</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Patient Name</Label>
                <Input
                  id="name"
                  value={newPreset.name}
                  onChange={(e) => setNewPreset(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Mr. Lee"
                  data-testid="input-patient-name"
                />
              </div>
              <div>
                <Label htmlFor="greeting">Custom Greeting</Label>
                <Input
                  id="greeting"
                  value={newPreset.greeting}
                  onChange={(e) => setNewPreset(prev => ({ ...prev, greeting: e.target.value }))}
                  placeholder="Hi Mr. Lee"
                  data-testid="input-greeting"
                />
              </div>
              <div>
                <Label htmlFor="language">Target Language</Label>
                <Select value={newPreset.language} onValueChange={(value) => setNewPreset(prev => ({ ...prev, language: value }))}>
                  <SelectTrigger data-testid="select-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mandarin">Mandarin Chinese</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="arabic">Arabic</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="portuguese">Portuguese</SelectItem>
                    <SelectItem value="russian">Russian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tone">Tone</Label>
                <Select value={newPreset.tone} onValueChange={(value) => setNewPreset(prev => ({ ...prev, tone: value }))}>
                  <SelectTrigger data-testid="select-tone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warm">Warm</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="clear">Clear</SelectItem>
                    <SelectItem value="respectful">Respectful</SelectItem>
                    <SelectItem value="compassionate">Compassionate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="instructions">Custom Instructions</Label>
                <Textarea
                  id="instructions"
                  value={newPreset.customInstructions}
                  onChange={(e) => setNewPreset(prev => ({ ...prev, customInstructions: e.target.value }))}
                  placeholder="Additional context and cultural considerations..."
                  data-testid="textarea-instructions"
                  rows={3}
                />
              </div>
              <Button 
                onClick={handleCreatePreset}
                className="w-full"
                data-testid="button-save-preset"
              >
                Save Preset
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Select value={selectedPresetId} onValueChange={onPresetChange}>
          <SelectTrigger data-testid="select-preset">
            <SelectValue placeholder="Select a patient preset..." />
          </SelectTrigger>
          <SelectContent>
            {presets.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                <div className="flex items-center space-x-2">
                  <span>{preset.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({preset.language}, {preset.tone})
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedPreset && (
          <div className="mt-3 p-3 bg-muted/50 rounded-md">
            <p className="text-xs text-muted-foreground mb-1">Preview:</p>
            <p className="text-sm">
              <span className="font-medium">{selectedPreset.greeting}</span>
              {selectedPreset.greeting && " — "}
              <span className="italic">{selectedPreset.tone} tone, {selectedPreset.language}</span>
            </p>
            {selectedPreset.customInstructions && (
              <p className="text-xs text-muted-foreground mt-2">
                Custom: {selectedPreset.customInstructions}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}