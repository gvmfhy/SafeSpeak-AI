import { StepIndicator } from '../StepIndicator';

export default function StepIndicatorExample() {
  const steps = ["Input", "Translation", "Quality Check", "Audio"];
  
  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-8">Step Indicators</h2>
      
      <div className="space-y-8">
        <div>
          <p className="text-sm text-muted-foreground mb-4">Step 1 - Input Phase</p>
          <StepIndicator currentStep={1} steps={steps} />
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-4">Step 3 - Quality Check Phase</p>
          <StepIndicator currentStep={3} steps={steps} />
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-4">Completed Workflow</p>
          <StepIndicator currentStep={5} steps={steps} />
        </div>
      </div>
    </div>
  );
}