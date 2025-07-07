
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Header } from '@/components/Header';
import { MoodInput } from '@/components/MoodInput';
import { AIArtCanvas } from '@/components/AIArtCanvas';
import { ParticleBackground } from '@/components/ParticleBackground';
import { AnimatedImageBackground } from '@/components/AnimatedImageBackground';
import { WalletConnect } from '@/components/WalletConnect';
import { Zap, Lock } from 'lucide-react';

interface Collaborator {
  id: string;
  address?: string;
  mood: string;
  timestamp: number;
}

const Button = ({ children, onClick, className = "", disabled = false }: any) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 ${className}`}
  >
    {children}
  </button>
);

const Index = () => {
  const [currentMood, setCurrentMood] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [generation, setGeneration] = useState(1);
  const { isConnected } = useAccount();

  const handleMoodSubmit = (mood: string, collabData?: Collaborator[]) => {
    if (!isConnected) return;
    
    setCurrentMood(mood);
    setCollaborators(collabData || []);
    setIsGenerating(true);
    setHasGenerated(false);
    setGeneration(1);
  };

  const handleGenerationComplete = () => {
    setIsGenerating(false);
    setHasGenerated(true);
  };

  const handleCreateNew = () => {
    setCurrentMood('');
    setCollaborators([]);
    setHasGenerated(false);
    setIsGenerating(false);
    setGeneration(1);
  };

  const handleEvolution = () => {
    setIsGenerating(true);
    setHasGenerated(false);
    setGeneration(prev => prev + 1);
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <AnimatedImageBackground />
      <ParticleBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <Header />
          <WalletConnect />
        </div>
        
        <div className="space-y-12">
          {!currentMood && (
            <div className="relative">
              {!isConnected && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <Lock className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Wallet Required</h3>
                    <p className="text-purple-200 max-w-sm">
                      Connect your wallet above to start creating AI-generated mood art on Monad
                    </p>
                  </div>
                </div>
              )}
              <MoodInput onSubmit={handleMoodSubmit} isGenerating={isGenerating} />
            </div>
          )}
          
          {currentMood && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-2">
                  {collaborators.length > 1 ? 'Collaborative Mood:' : 'Your Mood:'}
                </h3>
                <p className="text-lg text-purple-200 italic">"{currentMood}"</p>
                {collaborators.length > 1 && (
                  <p className="text-sm text-purple-300 mt-2">
                    Created with {collaborators.length} collaborators
                  </p>
                )}
                {generation > 1 && (
                  <p className="text-sm text-green-300 mt-1">
                    Evolution #{generation}
                  </p>
                )}
              </div>
              
              <AIArtCanvas 
                mood={currentMood}
                isGenerating={isGenerating}
                onGenerationComplete={handleGenerationComplete}
                collaborators={collaborators}
                generation={generation}
              />
              
              {hasGenerated && (
                <div className="text-center space-y-4">
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-4 border border-green-500/30">
                    <p className="text-green-200 font-medium">
                      🎨 Your unique AI artwork has been generated on Monad!
                    </p>
                    <p className="text-sm text-green-300 mt-1">
                      Your wallet is connected - you can now mint as NFT, or create new variations
                    </p>
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <Button 
                      onClick={handleCreateNew}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Create New Art
                    </Button>
                    <Button 
                      onClick={handleEvolution}
                      disabled={isGenerating}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Zap className="w-4 h-4" />
                      Evolve Art
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
