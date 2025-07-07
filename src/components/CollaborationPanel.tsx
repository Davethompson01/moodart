
import { useState } from 'react';
import { Users, Plus, X } from 'lucide-react';

interface Collaborator {
  id: string;
  address?: string;
  mood: string;
  timestamp: number;
}

interface CollaborationPanelProps {
  onCollaborate: (collaborators: Collaborator[]) => void;
  isGenerating: boolean;
}

const Button = ({ children, onClick, variant = "default", size = "default", className = "", disabled = false }: any) => {
  let baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  if (size === "sm") {
    baseClasses += " h-9 rounded-md px-3";
  } else {
    baseClasses += " h-10 px-4 py-2";
  }
  
  if (variant === "outline") {
    baseClasses += " border border-input bg-background hover:bg-accent hover:text-accent-foreground";
  } else if (variant === "ghost") {
    baseClasses += " hover:bg-accent hover:text-accent-foreground";
  } else {
    baseClasses += " bg-primary text-primary-foreground hover:bg-primary/90";
  }
  
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseClasses} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, className = "" }: any) => (
  <input
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);

const Textarea = ({ value, onChange, placeholder, className = "", rows = 3 }: any) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);

export const CollaborationPanel = ({ onCollaborate, isGenerating }: CollaborationPanelProps) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [newMood, setNewMood] = useState('');
  const [collaboratorAddress, setCollaboratorAddress] = useState('');
  const [isCollabMode, setIsCollabMode] = useState(false);

  const addCollaborator = () => {
    if (!newMood.trim()) {
      return;
    }

    const newCollaborator: Collaborator = {
      id: crypto.randomUUID(),
      address: collaboratorAddress.trim() || undefined,
      mood: newMood.trim(),
      timestamp: Date.now(),
    };

    setCollaborators([...collaborators, newCollaborator]);
    setNewMood('');
    setCollaboratorAddress('');
  };

  const removeCollaborator = (id: string) => {
    setCollaborators(collaborators.filter(c => c.id !== id));
  };

  const handleCollaborate = () => {
    if (collaborators.length < 2) {
      return;
    }
    onCollaborate(collaborators);
  };

  if (!isCollabMode) {
    return (
      <div className="text-center">
        <Button
          onClick={() => setIsCollabMode(true)}
          variant="outline"
          className="border-purple-400 text-purple-200 hover:bg-purple-500/20 flex items-center gap-2"
        >
          <Users className="w-4 h-4" />
          Start Collaboration
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/10 to-indigo-900/10 rounded-2xl p-6 backdrop-blur-sm border border-purple-500/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Users className="w-5 h-5" />
          Collaborative Art Creation
        </h3>
        <Button
          onClick={() => setIsCollabMode(false)}
          variant="ghost"
          size="sm"
          className="text-purple-300 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-1">
              Collaborator's Mood/Emotion
            </label>
            <Textarea
              value={newMood}
              onChange={(e: any) => setNewMood(e.target.value)}
              placeholder="Describe their emotional state..."
              className="bg-black/20 border-purple-500/30 text-white placeholder-purple-300/50"
              rows={2}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-1">
              Wallet Address (Optional)
            </label>
            <Input
              value={collaboratorAddress}
              onChange={(e: any) => setCollaboratorAddress(e.target.value)}
              placeholder="0x..."
              className="bg-black/20 border-purple-500/30 text-white placeholder-purple-300/50"
            />
          </div>

          <Button
            onClick={addCollaborator}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Collaborator
          </Button>
        </div>

        {collaborators.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-lg font-medium text-purple-200">
              Collaborators ({collaborators.length})
            </h4>
            <div className="space-y-2">
              {collaborators.map((collaborator, index) => (
                <div
                  key={collaborator.id}
                  className="bg-purple-500/10 rounded-lg p-3 flex justify-between items-start"
                >
                  <div className="flex-1">
                    <div className="text-sm text-purple-300 mb-1">
                      Collaborator #{index + 1}
                    </div>
                    <div className="text-white text-sm mb-1">
                      "{collaborator.mood}"
                    </div>
                    {collaborator.address && (
                      <div className="text-xs text-purple-400">
                        {collaborator.address.slice(0, 6)}...{collaborator.address.slice(-4)}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => removeCollaborator(collaborator.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {collaborators.length >= 2 && (
          <Button
            onClick={handleCollaborate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-lg py-3"
          >
            Generate Collaborative Art
          </Button>
        )}
      </div>
    </div>
  );
};
