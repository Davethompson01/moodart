export class ImageCompressionService {
  private static readonly MAX_WIDTH = 512;
  private static readonly MAX_HEIGHT = 512;
  private static readonly QUALITY = 0.6;
  private static readonly MAX_FILE_SIZE = 15000; // ~15KB limit

  static async compressImage(imageUrl: string): Promise<string> {
    try {
      console.log('🖼️ Starting image compression...');
      
      // Load the image
      const img = await this.loadImage(imageUrl);
      console.log('📊 Original dimensions:', img.width, 'x', img.height);

      // Create canvas for compression
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Calculate new dimensions while maintaining aspect ratio
      const { width, height } = this.calculateOptimalSize(img.width, img.height);
      
      canvas.width = width;
      canvas.height = height;
      
      console.log('📊 Compressed dimensions:', width, 'x', height);

      // Draw and compress the image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to base64 with compression
      let quality = this.QUALITY;
      let compressedData = canvas.toDataURL('image/jpeg', quality);
      
      // Keep reducing quality until we hit size target
      while (compressedData.length > this.MAX_FILE_SIZE && quality > 0.1) {
        quality -= 0.1;
        compressedData = canvas.toDataURL('image/jpeg', quality);
        console.log('🔄 Reducing quality to', quality.toFixed(1), 'Size:', compressedData.length);
      }
      
      console.log('✅ Final compressed size:', compressedData.length, 'bytes');
      console.log('📉 Compression ratio:', ((imageUrl.length - compressedData.length) / imageUrl.length * 100).toFixed(1) + '%');
      
      return compressedData;
    } catch (error) {
      console.error('❌ Image compression failed:', error);
      throw error;
    }
  }

  private static calculateOptimalSize(originalWidth: number, originalHeight: number) {
    let { width, height } = { width: originalWidth, height: originalHeight };
    
    // Scale down if too large
    if (width > this.MAX_WIDTH || height > this.MAX_HEIGHT) {
      const aspectRatio = width / height;
      
      if (width > height) {
        width = this.MAX_WIDTH;
        height = Math.round(width / aspectRatio);
      } else {
        height = this.MAX_HEIGHT;
        width = Math.round(height * aspectRatio);
      }
    }
    
    return { width, height };
  }

  private static loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.crossOrigin = 'anonymous';
      img.src = src;
    });
  }

  static estimateGasCost(dataSize: number): string {
    // Rough estimation: ~68 gas per byte + base transaction cost
    const gasPerByte = 68;
    const baseGas = 21000;
    const estimatedGas = baseGas + (dataSize * gasPerByte);
    return (estimatedGas / 1000000).toFixed(3) + 'M gas';
  }
}
