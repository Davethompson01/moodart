
import { useState, useRef } from 'react';
import { Mic, MicOff, Square } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
}

const Button = ({ children, onClick, variant = "default", className = "", disabled = false }: any) => {
  let baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2";
  
  if (variant === "outline") {
    baseClasses += " border border-input bg-background hover:bg-accent hover:text-accent-foreground";
  } else if (variant === "destructive") {
    baseClasses += " bg-destructive text-destructive-foreground hover:bg-destructive/90";
  }
  
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseClasses} ${className}`}>
      {children}
    </button>
  );
};

export const VoiceRecorder = ({ onTranscription, isRecording, setIsRecording }: VoiceRecorderProps) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        simulateTranscription();
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const simulateTranscription = () => {
    setTimeout(() => {
      const mockTranscriptions = [
        "I'm feeling really creative and inspired today, like I could paint the whole world in bright colors",
        "There's a sense of melancholy in my heart, like watching rain drops on a window",
        "I feel energetic and wild, like dancing under stormy skies with lightning all around",
        "Peaceful and calm, like floating on a quiet lake surrounded by mountains",
        "Excited and joyful, like a child seeing fireworks for the first time"
      ];
      const randomTranscription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
      onTranscription(randomTranscription);
    }, 2000);
  };

  return (
    <div className="flex items-center gap-3">
      {!isRecording ? (
        <Button
          onClick={startRecording}
          variant="outline"
          className="border-purple-400 text-purple-200 hover:bg-purple-500/20 flex items-center gap-2"
        >
          <Mic className="w-4 h-4" />
          Record Voice
        </Button>
      ) : (
        <Button
          onClick={stopRecording}
          variant="destructive"
          className="flex items-center gap-2 animate-pulse"
        >
          <Square className="w-4 h-4" />
          Stop Recording
        </Button>
      )}
      {isRecording && (
        <div className="flex items-center gap-2 text-red-400">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-sm">Recording...</span>
        </div>
      )}
    </div>
  );
};
