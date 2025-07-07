import { useState, useEffect } from 'react';
import { MintNFT } from './MintNFT';
import { RunwareService } from '../services/RunwareService';
import { toast } from 'sonner';

interface AIArtCanvasProps {
  mood: string;
  isGenerating: boolean;
  onGenerationComplete: () => void;
  collaborators?: any[];
  generation?: number;
}

const Progress = ({ value, className }: { value: number, className?: string }) => (
  <div className={`relative h-4 w-full overflow-hidden rounded-full bg-secondary ${className}`}>
    <div 
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
);

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-muted ${className}`} />
);

export const AIArtCanvas = ({ 
  mood, 
  isGenerating, 
  onGenerationComplete,
  collaborators = [],
  generation = 1 
}: AIArtCanvasProps) => {
  const [imageUrl, setImageUrl] = useState('');
  const [metadata, setMetadata] = useState({});
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('');
  const apiKey = 'ZLx8nBtjkZgGkURm2L9SlVeCuSok2sKn';

  useEffect(() => {
    if (isGenerating && mood) {
      generateAIArt();
    }
  }, [isGenerating, mood, generation, onGenerationComplete]);

  const generateAIArt = async () => {
    try {
      setLoadingProgress(0);
      setLoadingStage('Initializing AI generation...');
      
      const runwareService = new RunwareService(apiKey);
      
      setLoadingProgress(20);
      setLoadingStage('Processing your mood...');
      
      const prompt = `${mood}, high quality`;
      
      setLoadingProgress(40);
      setLoadingStage('Connecting to AI service...');
      
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 80) {
            clearInterval(progressInterval);
            return 80;
          }
          return prev + 5;
        });
      }, 500);
      
      setLoadingStage('Creating your unique artwork...');
      
      const result = await runwareService.generateImage({
        positivePrompt: prompt,
        model: "runware:100@1",
        numberResults: 1,
        outputFormat: "WEBP"
      });

      clearInterval(progressInterval);
      setLoadingProgress(100);
      setLoadingStage('Finalizing artwork...');

      setImageUrl(result.imageURL);
      setMetadata({ 
        mood, 
        generation, 
        timestamp: Date.now(),
        prompt,
        seed: result.seed
      });
      
      setTimeout(() => {
        onGenerationComplete();
        setLoadingProgress(0);
        setLoadingStage('');
      }, 500);
      
    } catch (error) {
      console.error('AI art generation failed:', error);
      toast.error('Failed to generate AI art. Please check your API key.');
      setLoadingProgress(0);
      setLoadingStage('');
      onGenerationComplete();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="bg-gradient-to-br from-purple-900/10 to-indigo-900/10 rounded-2xl p-8 backdrop-blur-sm border border-purple-500/20">
        <h3 className="text-xl font-semibold text-white mb-4 text-center">
          AI Art Generation
        </h3>
        
        <div className="aspect-square max-w-md mx-auto bg-black/20 rounded-lg border border-purple-500/30 flex items-center justify-center">
          {isGenerating ? (
            <div className="text-center space-y-6 w-full max-w-xs px-4">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-indigo-500 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              
              <div className="space-y-2">
                <Progress value={loadingProgress} className="w-full h-2" />
                <p className="text-purple-200 text-sm font-medium">{loadingProgress}%</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-white font-medium">Generating your mood art...</p>
                <p className="text-purple-300 text-sm">{loadingStage}</p>
              </div>
              
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          ) : imageUrl ? (
            <div className="w-full h-full relative">
              <img 
                src={imageUrl} 
                alt="Generated mood art" 
                className="w-full h-full object-cover rounded-lg opacity-0 animate-fade-in"
                onLoad={(e) => {
                  e.currentTarget.classList.remove('opacity-0');
                  e.currentTarget.classList.add('opacity-100');
                }}
              />
              <div className="absolute top-4 right-4 bg-green-500/90 text-white px-3 py-1 rounded-full text-sm font-medium animate-fade-in">
                Your nft
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-lg mx-auto flex items-center justify-center border border-purple-500/30">
                <span className="text-2xl">🎨</span>
              </div>
              <p className="text-purple-300">Your art will appear here</p>
            </div>
          )}
        </div>
      </div>

      {isGenerating && (
        <div className="space-y-4">
          <Skeleton className="h-8 w-48 mx-auto bg-purple-500/10" />
          <Skeleton className="h-12 w-full bg-purple-500/10" />
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1 bg-purple-500/10" />
            <Skeleton className="h-10 flex-1 bg-purple-500/10" />
          </div>
        </div>
      )}

      {imageUrl && !isGenerating && (
        <MintNFT 
          imageUrl={imageUrl}
          metadata={metadata}
          mood={mood}
        />
      )}
    </div>
  );
};
