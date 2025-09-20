import { ThemeProvider } from '../ThemeProvider';
import { Button } from "@/components/ui/button";

export default function ThemeProviderExample() {
  return (
    <ThemeProvider>
      <div className="p-8">
        <h2 className="text-2xl font-semibold mb-4">Theme Provider Test</h2>
        <p className="text-muted-foreground mb-4">This should switch between light and dark mode.</p>
        <Button>Test Button</Button>
      </div>
    </ThemeProvider>
  );
}