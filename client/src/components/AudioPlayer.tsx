import { useState, useRef } from "react";
import { Play, Pause, Download, Volume2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

interface AudioPlayerProps {
  audioUrl?: string;
  translatedText: string;
  language: string;
  onRestart?: () => void;
}

export function AudioPlayer({
  audioUrl,
  translatedText,
  language,
  onRestart,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // todo: remove mock functionality - simulate audio playback
  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      console.log('Audio paused');
    } else {
      setIsPlaying(true);
      console.log('Playing audio for:', translatedText);
      
      // Simulate audio duration and playback
      setDuration(5); // 5 seconds
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= 5) {
            setIsPlaying(false);
            clearInterval(interval);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
  };

  const handleDownload = () => {
    console.log('Downloading audio file...');
    // todo: implement actual download
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    console.log('Seeking to:', newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const languageLabels: Record<string, string> = {
    mandarin: "Mandarin Chinese",
    spanish: "Spanish",
    arabic: "Arabic",
    french: "French", 
    portuguese: "Portuguese",
    russian: "Russian",
    korean: "Korean",
    vietnamese: "Vietnamese",
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4" />
            <h3 className="text-sm font-medium">Generated Audio</h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            {languageLabels[language]} • ElevenLabs
          </Badge>
        </div>
        {onRestart && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRestart}
            data-testid="button-restart-workflow"
            className="hover-elevate"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Text being spoken */}
        <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-md">
          <p className="text-sm text-muted-foreground mb-1">Audio Content:</p>
          <p className="text-base leading-relaxed">{translatedText}</p>
        </div>

        {/* Audio controls */}
        <div className="space-y-3">
          <div className="flex items-center space-x-4">
            <Button
              onClick={handlePlayPause}
              size="lg"
              className="w-12 h-12 rounded-full p-0"
              data-testid="button-play-pause"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </Button>
            
            <div className="flex-1 space-y-1">
              <Slider
                value={[currentTime]}
                max={duration}
                step={0.1}
                onValueChange={handleSeek}
                className="w-full"
                data-testid="slider-progress"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleDownload}
              variant="outline"
              data-testid="button-download-audio"
              className="hover-elevate"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Audio File
            </Button>
          </div>
        </div>

        {/* Success message */}
        <div className="p-3 bg-secondary/10 rounded-md">
          <p className="text-sm text-secondary font-medium mb-1">
            ✓ Translation Complete
          </p>
          <p className="text-xs text-muted-foreground">
            Your message has been translated and is ready for patient communication. 
            You can play the audio directly or download it for later use.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}