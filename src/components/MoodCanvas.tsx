import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface MoodCanvasProps {
  mood: string;
  isGenerating: boolean;
  onGenerationComplete: () => void;
}

export const MoodCanvas = ({ mood, isGenerating, onGenerationComplete }: MoodCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = Math.min(containerWidth * 0.75, 500); // 4:3 aspect ratio, max 500px height

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    
    renderer.setSize(containerWidth, containerHeight);
    renderer.setClearColor(0x000000, 0);
    
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    camera.position.z = 5;
    setIsReady(true);

    // Cleanup function
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!isReady || !mood || !sceneRef.current || !rendererRef.current || !cameraRef.current) return;
    if (!isGenerating) return;

    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;

    // Clear previous objects (keep lights)
    const objectsToRemove = scene.children.filter(child => child.type === 'Mesh');
    objectsToRemove.forEach(obj => scene.remove(obj));

    // Generate art based on mood
    const generateArt = () => {
      const moodLower = mood.toLowerCase();
      
      // Color palette based on mood
      let colors = [0x6366f1, 0x8b5cf6, 0xa855f7]; // Default purple theme
      
      if (moodLower.includes('happy') || moodLower.includes('joy')) {
        colors = [0xfbbf24, 0xf59e0b, 0xfcd34d]; // Yellow/gold
      } else if (moodLower.includes('sad') || moodLower.includes('blue')) {
        colors = [0x3b82f6, 0x1d4ed8, 0x60a5fa]; // Blue
      } else if (moodLower.includes('love') || moodLower.includes('heart')) {
        colors = [0xf43f5e, 0xe11d48, 0xfb7185]; // Pink/red
      } else if (moodLower.includes('nature') || moodLower.includes('green')) {
        colors = [0x10b981, 0x059669, 0x34d399]; // Green
      } else if (moodLower.includes('calm') || moodLower.includes('peace')) {
        colors = [0x06b6d4, 0x0891b2, 0x22d3ee]; // Cyan
      } else if (moodLower.includes('dog') || moodLower.includes('pet')) {
        colors = [0xf59e0b, 0xd97706, 0x92400e]; // Brown/orange
      }

      // Create geometric shapes based on mood
      const shapes: THREE.Mesh[] = [];
      
      for (let i = 0; i < 8; i++) {
        let geometry;
        const colorIndex = Math.floor(Math.random() * colors.length);
        
        if (moodLower.includes('dog') || moodLower.includes('pet')) {
          // Create dog-like shapes
          geometry = new THREE.SphereGeometry(0.3 + Math.random() * 0.4, 12, 12);
        } else if (moodLower.includes('sharp') || moodLower.includes('angry')) {
          geometry = new THREE.ConeGeometry(0.3, 0.8, 6);
        } else if (moodLower.includes('round') || moodLower.includes('soft')) {
          geometry = new THREE.SphereGeometry(0.3 + Math.random() * 0.4, 16, 16);
        } else {
          // Default mix of shapes
          const shapeType = Math.random();
          if (shapeType < 0.33) {
            geometry = new THREE.BoxGeometry(0.4 + Math.random() * 0.3, 0.4 + Math.random() * 0.3, 0.4 + Math.random() * 0.3);
          } else if (shapeType < 0.66) {
            geometry = new THREE.SphereGeometry(0.3 + Math.random() * 0.3, 12, 12);
          } else {
            geometry = new THREE.ConeGeometry(0.3, 0.8, 8);
          }
        }

        const material = new THREE.MeshPhongMaterial({ 
          color: colors[colorIndex],
          shininess: 100,
          transparent: true,
          opacity: 0.7 + Math.random() * 0.3
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Position within view
        mesh.position.x = (Math.random() - 0.5) * 6;
        mesh.position.y = (Math.random() - 0.5) * 4;
        mesh.position.z = (Math.random() - 0.5) * 3;
        
        // Random rotation
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;
        mesh.rotation.z = Math.random() * Math.PI;
        
        scene.add(mesh);
        shapes.push(mesh);
      }

      // Animation loop
      const animate = () => {
        animationIdRef.current = requestAnimationFrame(animate);
        
        shapes.forEach((shape, index) => {
          shape.rotation.x += 0.005 + (index * 0.001);
          shape.rotation.y += 0.008 + (index * 0.002);
          shape.position.y += Math.sin(Date.now() * 0.001 + shape.position.x + index) * 0.002;
        });
        
        renderer.render(scene, camera);
      };
      
      animate();

      // Complete generation after delay
      setTimeout(() => {
        onGenerationComplete();
      }, 3000);
    };

    generateArt();
  }, [mood, isGenerating, isReady, onGenerationComplete]);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-2xl p-6 backdrop-blur-sm border border-purple-500/20">
        <div ref={containerRef} className="relative w-full" style={{ minHeight: '400px' }}>
          <canvas 
            ref={canvasRef}
            className="w-full h-full rounded-lg shadow-2xl border border-purple-500/30"
            style={{ display: 'block', background: 'linear-gradient(135deg, rgba(59, 7, 100, 0.1) 0%, rgba(76, 29, 149, 0.1) 100%)' }}
          />
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg backdrop-blur-sm">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
                <p className="text-white text-lg font-medium">Generating your mood art...</p>
                <p className="text-purple-200 text-sm mt-2">Creating unique 3D shapes...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
