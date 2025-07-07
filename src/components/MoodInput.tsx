
import { useState } from 'react';

interface MoodInputProps {
  onSubmit: (mood: string) => void;
  isGenerating: boolean;
}

const Button = ({ children, type = "button", disabled = false, className = "", onClick }: any) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 ${className}`}
  >
    {children}
  </button>
);

const Textarea = ({ id, value, onChange, placeholder, className = "", disabled = false }: any) => (
  <textarea
    id={id}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);

export const MoodInput = ({ onSubmit, isGenerating }: MoodInputProps) => {
  const [mood, setMood] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mood.trim() && !isGenerating) {
      onSubmit(mood.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-purple-900/10 to-indigo-900/10 rounded-2xl p-8 backdrop-blur-sm border border-purple-500/20">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Express Your Mood
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="mood" className="block text-sm font-medium text-purple-200 mb-2">
              What's on your mind?
            </label>
            <Textarea
              id="mood"
              value={mood}
              onChange={(e: any) => setMood(e.target.value)}
              placeholder="Describe your mood, feelings, or thoughts..."
              className="min-h-24 bg-black/20 border-purple-500/30 text-white placeholder-purple-300/50 focus:border-purple-400 focus:ring-purple-400/20"
              disabled={isGenerating}
            />
          </div>

          <Button 
            type="submit" 
            disabled={!mood.trim() || isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {isGenerating ? 'Generating Art...' : 'Generate Art'}
          </Button>
        </form>
      </div>
    </div>
  );
};
