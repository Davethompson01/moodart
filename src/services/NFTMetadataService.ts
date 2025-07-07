
export interface NFTTrait {
  trait_type: string;
  value: string | number;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: NFTTrait[];
  animation_url?: string;
}

export class NFTMetadataService {
  static generateTraitsFromMood(mood: string, imageUrl: string, seed: number): NFTTrait[] {
    const baseMood = mood.toLowerCase();
    const traits: NFTTrait[] = [];

    // Emotion Analysis
    if (baseMood.includes('happy') || baseMood.includes('joy') || baseMood.includes('excited')) {
      traits.push({ trait_type: 'Emotion', value: 'Joyful' });
      traits.push({ trait_type: 'Energy Level', value: 'High' });
    } else if (baseMood.includes('sad') || baseMood.includes('melancholy') || baseMood.includes('blue')) {
      traits.push({ trait_type: 'Emotion', value: 'Melancholic' });
      traits.push({ trait_type: 'Energy Level', value: 'Low' });
    } else if (baseMood.includes('calm') || baseMood.includes('peaceful') || baseMood.includes('serene')) {
      traits.push({ trait_type: 'Emotion', value: 'Serene' });
      traits.push({ trait_type: 'Energy Level', value: 'Balanced' });
    } else if (baseMood.includes('angry') || baseMood.includes('furious') || baseMood.includes('rage')) {
      traits.push({ trait_type: 'Emotion', value: 'Intense' });
      traits.push({ trait_type: 'Energy Level', value: 'Explosive' });
    } else {
      traits.push({ trait_type: 'Emotion', value: 'Complex' });
      traits.push({ trait_type: 'Energy Level', value: 'Variable' });
    }

    // Color Palette Analysis
    if (baseMood.includes('red') || baseMood.includes('fire') || baseMood.includes('warm')) {
      traits.push({ trait_type: 'Color Palette', value: 'Warm' });
    } else if (baseMood.includes('blue') || baseMood.includes('cool') || baseMood.includes('cold')) {
      traits.push({ trait_type: 'Color Palette', value: 'Cool' });
    } else if (baseMood.includes('green') || baseMood.includes('nature') || baseMood.includes('forest')) {
      traits.push({ trait_type: 'Color Palette', value: 'Natural' });
    } else {
      traits.push({ trait_type: 'Color Palette', value: 'Mixed' });
    }

    // Theme Classification
    if (baseMood.includes('dog') || baseMood.includes('cat') || baseMood.includes('animal')) {
      traits.push({ trait_type: 'Theme', value: 'Animal' });
    } else if (baseMood.includes('nature') || baseMood.includes('forest') || baseMood.includes('mountain')) {
      traits.push({ trait_type: 'Theme', value: 'Nature' });
    } else if (baseMood.includes('love') || baseMood.includes('heart') || baseMood.includes('romance')) {
      traits.push({ trait_type: 'Theme', value: 'Romance' });
    } else if (baseMood.includes('space') || baseMood.includes('star') || baseMood.includes('cosmic')) {
      traits.push({ trait_type: 'Theme', value: 'Cosmic' });
    } else {
      traits.push({ trait_type: 'Theme', value: 'Abstract' });
    }

    // Rarity based on seed
    const rarity = this.calculateRarity(seed);
    traits.push({ trait_type: 'Rarity', value: rarity });
    
    // Generation timestamp
    traits.push({ trait_type: 'Generation', value: new Date().toISOString().split('T')[0] });
    
    // Seed for uniqueness tracking
    traits.push({ trait_type: 'Seed', value: seed });

    return traits;
  }

  static calculateRarity(seed: number): string {
    const rarityChance = seed % 100;
    if (rarityChance < 5) return 'Legendary';
    if (rarityChance < 15) return 'Epic';
    if (rarityChance < 35) return 'Rare';
    if (rarityChance < 65) return 'Uncommon';
    return 'Common';
  }

  static generateNFTMetadata(
    mood: string,
    imageUrl: string,
    seed: number,
    collaborators?: string[]
  ): NFTMetadata {
    const traits = this.generateTraitsFromMood(mood, imageUrl, seed);
    
    if (collaborators && collaborators.length > 1) {
      traits.push({ trait_type: 'Collaboration', value: `${collaborators.length} Artists` });
      traits.push({ trait_type: 'Type', value: 'Collaborative' });
    } else {
      traits.push({ trait_type: 'Type', value: 'Solo' });
    }

    const name = this.generateArtName(mood, seed);
    const description = this.generateDescription(mood, collaborators);

    return {
      name,
      description,
      image: imageUrl,
      external_url: window.location.origin,
      attributes: traits,
    };
  }

  static generateArtName(mood: string, seed: number): string {
    const prefixes = ['Essence of', 'Spirit of', 'Vision of', 'Dream of', 'Soul of'];
    const suffixes = ['Genesis', 'Reflection', 'Manifestation', 'Expression', 'Journey'];
    
    const prefix = prefixes[seed % prefixes.length];
    const suffix = suffixes[(seed * 7) % suffixes.length];
    
    const cleanMood = mood.split(' ').slice(0, 3).join(' ');
    return `${prefix} ${cleanMood} - ${suffix} #${seed}`;
  }

  static generateDescription(mood: string, collaborators?: string[]): string {
    const baseDescription = `A unique AI-generated artwork born from the emotional expression: "${mood}". This digital masterpiece captures the essence of human emotion and transforms it into visual poetry through advanced artificial intelligence.`;
    
    if (collaborators && collaborators.length > 1) {
      return `${baseDescription}\n\nThis piece represents a collaborative creation, where ${collaborators.length} individuals contributed their emotional input to create this unified artistic vision.`;
    }
    
    return `${baseDescription}\n\nEach piece in the Mood Art Genesis collection is completely unique, generated from genuine human emotional expression and preserved forever on the blockchain.`;
  }
}
