import { AudioPlayer } from '../AudioPlayer';

export default function AudioPlayerExample() {
  const handleRestart = () => {
    console.log('Restarting workflow...');
  };

  return (
    <div className="p-8 max-w-lg">
      <h2 className="text-2xl font-semibold mb-4">Audio Player</h2>
      <AudioPlayer
        translatedText="请和食物一起服用您的药物，在饭后服用。"
        language="mandarin"
        onRestart={handleRestart}
      />
    </div>
  );
}