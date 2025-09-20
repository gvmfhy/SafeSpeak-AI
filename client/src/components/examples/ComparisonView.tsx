import { useState } from "react";
import { ComparisonView } from '../ComparisonView';

export default function ComparisonViewExample() {
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  const handleApprove = () => {
    setIsGeneratingAudio(true);
    console.log('Translation approved, generating audio...');
    
    // Simulate audio generation delay
    setTimeout(() => {
      setIsGeneratingAudio(false);
      console.log('Audio generation completed');
    }, 3000);
  };

  const handleReject = () => {
    console.log('Translation rejected, returning to previous step');
  };

  return (
    <div className="p-8 max-w-5xl">
      <h2 className="text-2xl font-semibold mb-4">Comparison View</h2>
      <div className="space-y-6">
        <ComparisonView
          original="Please take your medication with food after meals."
          translation="请和食物一起服用您的药物，在饭后服用。"
          backTranslation="Please take your medicine with food, take it after meals."
          language="mandarin"
          qualityScore={92}
          onApprove={handleApprove}
          onReject={handleReject}
          isGeneratingAudio={isGeneratingAudio}
        />
        
        <div className="pt-4">
          <p className="text-sm text-muted-foreground">
            Example showing high-quality translation with 92% match score
          </p>
        </div>
      </div>
    </div>
  );
}