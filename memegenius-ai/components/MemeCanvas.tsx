
import React, { useRef, useEffect } from 'react';
import { MemeState } from '../types';

interface MemeCanvasProps {
  state: MemeState;
  onDownload: () => void;
}

const MemeCanvas: React.FC<MemeCanvasProps> = ({ state, onDownload }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!state.image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = state.image;
    img.onload = () => {
      // Set canvas size based on image aspect ratio
      const maxWidth = 800;
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scale;

      // Draw background image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Setup text style
      const fontSize = (state.fontSize / 100) * canvas.width * 0.15;
      ctx.font = `bold ${fontSize}px Oswald, Impact, Arial`;
      ctx.fillStyle = state.textColor;
      ctx.strokeStyle = 'black';
      ctx.lineWidth = fontSize / 12;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const drawText = (text: string, y: number, baseline: 'top' | 'bottom') => {
        ctx.textBaseline = baseline;
        const words = text.toUpperCase().split(' ');
        const lines: string[] = [];
        let currentLine = '';

        words.forEach(word => {
          const testLine = currentLine + word + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > canvas.width * 0.9 && currentLine !== '') {
            lines.push(currentLine.trim());
            currentLine = word + ' ';
          } else {
            currentLine = testLine;
          }
        });
        lines.push(currentLine.trim());

        const lineHeight = fontSize * 1.1;
        lines.forEach((line, index) => {
          const posY = baseline === 'top' 
            ? y + (index * lineHeight)
            : y - ((lines.length - 1 - index) * lineHeight);
          
          ctx.strokeText(line, canvas.width / 2, posY);
          ctx.fillText(line, canvas.width / 2, posY);
        });
      };

      // Draw Top Text
      if (state.topText) {
        drawText(state.topText, 20, 'top');
      }

      // Draw Bottom Text
      if (state.bottomText) {
        drawText(state.bottomText, canvas.height - 20, 'bottom');
      }
    };
  }, [state]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'meme-genius.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative border-4 border-slate-700 rounded-lg overflow-hidden shadow-2xl bg-slate-800 min-h-[300px] flex items-center justify-center w-full max-w-[800px]">
        {!state.image ? (
          <div className="text-slate-500 flex flex-col items-center p-12 text-center">
            <i className="fa-solid fa-image text-6xl mb-4"></i>
            <p className="text-xl">Upload an image or select a template to start</p>
          </div>
        ) : (
          <canvas 
            ref={canvasRef} 
            className="max-w-full h-auto"
          />
        )}
      </div>
      
      {state.image && (
        <button
          onClick={handleDownload}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-full transition-all flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95"
        >
          <i className="fa-solid fa-download"></i>
          Download Meme
        </button>
      )}
    </div>
  );
};

export default MemeCanvas;
