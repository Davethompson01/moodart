import { toast } from "sonner";

const API_ENDPOINT = "https://api.runware.ai/v1";

export interface GenerateImageParams {
  positivePrompt: string;
  model?: string;
  numberResults?: number;
  outputFormat?: string;
  CFGScale?: number;
  scheduler?: string;
  strength?: number;
  seed?: number | null;
}

export interface GeneratedImage {
  imageURL: string;
  positivePrompt: string;
  seed: number;
  NSFWContent: boolean;
}

export class RunwareService {
  private apiKey: string | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(params: GenerateImageParams): Promise<GeneratedImage> {
    try {
      const taskUUID = crypto.randomUUID();

      const body = [
        {
          taskType: "imageInference",
          taskUUID,
          model: params.model || "runware:100@1",
          width: 1024,
          height: 1024,
          numberResults: params.numberResults || 1,
          outputFormat: params.outputFormat || "WEBP",
          steps: 4,
          CFGScale: params.CFGScale || 1,
          scheduler: params.scheduler || "FlowMatchEulerDiscreteScheduler",
          strength: params.strength || 0.8,
          positivePrompt: params.positivePrompt,
          ...(params.seed ? { seed: params.seed } : {}),
        }
      ];

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.apiKey ? { "Authorization": `Bearer ${this.apiKey}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Runware API error response:", errorData); // Log full error response
        const errorMessage = errorData.errorMessage || errorData.message || 'Failed to generate image.';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.error || data.errors) {
        const errorMessage = data.errorMessage || data.errors?.[0]?.message || 'An error occurred';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      // Find the imageInference result in the response
      const imageResult = Array.isArray(data.data)
        ? data.data.find((item: any) => item.taskType === "imageInference")
        : data;

      return imageResult;
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate image.');
      throw error;
    }
  }
}
