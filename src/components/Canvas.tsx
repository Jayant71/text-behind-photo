
import { useRef, useEffect, useState } from "react";
import { ProcessedImage, TextLayer } from "@/pages/Index";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CanvasProps {
  originalImage: string | null;
  processedImage: ProcessedImage | null;
  textLayers: TextLayer[];
  selectedLayer: string | null;
  onLayerSelect: (id: string | null) => void;
  onLayerUpdate: (id: string, updates: Partial<TextLayer>) => void;
}

export const Canvas = ({
  originalImage,
  processedImage,
  textLayers,
  selectedLayer,
  onLayerSelect,
  onLayerUpdate,
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    drawCanvas();
  }, [processedImage, textLayers, selectedLayer]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!processedImage) {
      // Draw placeholder
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100);
      ctx.fillStyle = '#64748b';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Upload an image to get started', canvas.width / 2, canvas.height / 2);
      return;
    }

    // Sort layers by z-index and whether they're behind person
    const sortedLayers = [...textLayers].sort((a, b) => {
      if (a.isBehindPerson !== b.isBehindPerson) {
        return a.isBehindPerson ? -1 : 1;
      }
      return a.zIndex - b.zIndex;
    });

    // Draw background
    const bgImg = new Image();
    bgImg.onload = () => {
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      
      // Draw text layers that are behind person
      sortedLayers.filter(layer => layer.isBehindPerson).forEach(layer => {
        drawTextLayer(ctx, layer);
      });

      // Draw segmented person
      const personImg = new Image();
      personImg.onload = () => {
        ctx.drawImage(personImg, 0, 0, canvas.width, canvas.height);
        
        // Draw text layers that are in front of person
        sortedLayers.filter(layer => !layer.isBehindPerson).forEach(layer => {
          drawTextLayer(ctx, layer);
        });
      };
      personImg.src = processedImage.segmentedPerson;
    };
    bgImg.src = processedImage.background;
  };

  const drawTextLayer = (ctx: CanvasRenderingContext2D, layer: TextLayer) => {
    ctx.save();
    
    // Apply transformations
    ctx.translate(layer.x + layer.width / 2, layer.y + layer.height / 2);
    ctx.rotate((layer.rotation * Math.PI) / 180);
    ctx.globalAlpha = layer.opacity;
    
    // Set text properties
    ctx.font = `${layer.fontSize}px ${layer.fontFamily}`;
    ctx.fillStyle = layer.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw text
    ctx.fillText(layer.content, 0, 0);
    
    // Draw selection handles if selected
    if (selectedLayer === layer.id) {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(-layer.width / 2, -layer.height / 2, layer.width, layer.height);
      
      // Draw resize handles
      const handleSize = 8;
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(-layer.width / 2 - handleSize / 2, -layer.height / 2 - handleSize / 2, handleSize, handleSize);
      ctx.fillRect(layer.width / 2 - handleSize / 2, -layer.height / 2 - handleSize / 2, handleSize, handleSize);
      ctx.fillRect(-layer.width / 2 - handleSize / 2, layer.height / 2 - handleSize / 2, handleSize, handleSize);
      ctx.fillRect(layer.width / 2 - handleSize / 2, layer.height / 2 - handleSize / 2, handleSize, handleSize);
      
      // Draw rotation handle
      ctx.beginPath();
      ctx.arc(0, -layer.height / 2 - 20, 6, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    ctx.restore();
  };

  const getMousePos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const getClickedLayer = (pos: { x: number; y: number }) => {
    for (let i = textLayers.length - 1; i >= 0; i--) {
      const layer = textLayers[i];
      if (
        pos.x >= layer.x &&
        pos.x <= layer.x + layer.width &&
        pos.y >= layer.y &&
        pos.y <= layer.y + layer.height
      ) {
        return layer.id;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    const clickedLayerId = getClickedLayer(pos);
    
    if (clickedLayerId) {
      onLayerSelect(clickedLayerId);
      setIsDragging(true);
      setDragStart(pos);
    } else {
      onLayerSelect(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedLayer) return;
    
    const pos = getMousePos(e);
    const deltaX = pos.x - dragStart.x;
    const deltaY = pos.y - dragStart.y;
    
    onLayerUpdate(selectedLayer, {
      x: Math.max(0, Math.min(canvasSize.width - 200, pos.x - deltaX + deltaX)),
      y: Math.max(0, Math.min(canvasSize.height - 60, pos.y - deltaY + deltaY)),
    });
    
    setDragStart(pos);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'text-behind-image.png';
    link.href = canvas.toDataURL();
    link.click();
    
    toast.success("Image downloaded successfully!");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-slate-600">
          {processedImage ? "Click and drag text layers to position them" : "Upload an image to start editing"}
        </div>
        <Button
          onClick={downloadImage}
          disabled={!processedImage}
          className="bg-green-600 hover:bg-green-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>
      
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="max-w-full cursor-pointer"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
    </div>
  );
};
