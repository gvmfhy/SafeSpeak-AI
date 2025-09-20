import { SystemPromptEditor } from '../SystemPromptEditor';
import { PatientPreset } from '../PatientPresetSelector';

export default function SystemPromptEditorExample() {
  // todo: remove mock functionality
  const mockPreset: PatientPreset = {
    id: "1",
    name: "Mr. Lee",
    greeting: "您好，李先生",
    tone: "respectful",
    customInstructions: "Elderly patient, prefers formal address, has hearing difficulty",
    language: "mandarin"
  };

  const handleSave = (prompt: string) => {
    console.log('System prompt saved:', prompt);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-4">System Prompt Editor</h2>
      <p className="text-muted-foreground mb-4">
        Configure advanced XML-structured prompts for healthcare translation with chain-of-thought reasoning.
      </p>
      <SystemPromptEditor
        selectedPreset={mockPreset}
        onSave={handleSave}
      />
    </div>
  );
}