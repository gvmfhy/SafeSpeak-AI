import { ThemeToggle } from '../ThemeToggle';
import { ThemeProvider } from '../ThemeProvider';

export default function ThemeToggleExample() {
  return (
    <ThemeProvider>
      <div className="p-8">
        <h2 className="text-2xl font-semibold mb-4">Theme Toggle</h2>
        <p className="text-muted-foreground mb-4">Click to toggle between light and dark mode.</p>
        <ThemeToggle />
      </div>
    </ThemeProvider>
  );
}