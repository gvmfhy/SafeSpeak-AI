import { useState } from "react";
import { TranslationCard } from '../TranslationCard';

export default function TranslationCardExample() {
  // todo: remove mock functionality
  const [translation, setTranslation] = useState("请和食物一起服用您的药物，在饭后服用。");
  const [isBackTranslating, setIsBackTranslating] = useState(false);

  const handleEdit = (newTranslation: string) => {
    setTranslation(newTranslation);
    console.log('Translation updated:', newTranslation);
  };

  const handleBackTranslate = () => {
    setIsBackTranslating(true);
    console.log('Starting back-translation...');
    
    // Simulate back-translation delay
    setTimeout(() => {
      setIsBackTranslating(false);
      console.log('Back-translation completed');
    }, 2500);
  };

  return (
    <div className="p-8 max-w-2xl">
      <h2 className="text-2xl font-semibold mb-4">Translation Card</h2>
      <TranslationCard
        original="Please take your medication with food after meals."
        translation={translation}
        language="mandarin"
        reasoning="The AI considered formal address patterns in Mandarin for elderly patients and healthcare contexts. Used 请 (qǐng) for politeness and structured the sentence to emphasize the important timing of medication with food."
        onEdit={handleEdit}
        onBackTranslate={handleBackTranslate}
        isBackTranslating={isBackTranslating}
      />
    </div>
  );
}