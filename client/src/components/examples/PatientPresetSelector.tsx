import { useState } from "react";
import { PatientPresetSelector, PatientPreset } from '../PatientPresetSelector';

export default function PatientPresetSelectorExample() {
  // todo: remove mock functionality
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
    }
  ]);
  
  const [selectedPresetId, setSelectedPresetId] = useState<string>("1");

  const handleCreatePreset = (newPreset: Omit<PatientPreset, 'id'>) => {
    const preset: PatientPreset = {
      ...newPreset,
      id: (presets.length + 1).toString()
    };
    setPresets([...presets, preset]);
    setSelectedPresetId(preset.id);
    console.log('New preset created:', preset);
  };

  return (
    <div className="p-8 max-w-md">
      <h2 className="text-2xl font-semibold mb-4">Patient Preset Selector</h2>
      <PatientPresetSelector
        presets={presets}
        selectedPresetId={selectedPresetId}
        onPresetChange={setSelectedPresetId}
        onPresetCreate={handleCreatePreset}
      />
    </div>
  );
}