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
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<{
    bgImg: HTMLImageElement | null;
    personImg: HTMLImageElement | null;
  }>({ bgImg: null, personImg: null });

  useEffect(() => {
    if (processedImage) {
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      const personImg = new Image();
      personImg.crossOrigin = "anonymous";

      const bgPromise = new Promise((resolve, reject) => {
        bgImg.onload = resolve;
        bgImg.onerror = reject;
      });
      const personPromise = new Promise((resolve, reject) => {
        personImg.onload = resolve;
        personImg.onerror = reject;
      });

      bgImg.src = processedImage.background;
      personImg.src = processedImage.segmentedPerson;

      Promise.all([bgPromise, personPromise])
        .then(() => setLoadedImages({ bgImg, personImg }))
        .catch((error) => {
          console.error("Error loading one or more images for canvas", error);
          toast.error("Failed to load images for canvas.");
          setLoadedImages({ bgImg: null, personImg: null });
        });
    } else {
      setLoadedImages({ bgImg: null, personImg: null });
    }
  }, [processedImage]);

  useEffect(() => {
    drawCanvas();
  }, [textLayers, selectedLayer, loadedImages]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!loadedImages.bgImg || !loadedImages.personImg) {
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100);
      ctx.fillStyle = '#64748b';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      if (!processedImage) {
        ctx.fillText('Upload an image to get started', canvas.width / 2, canvas.height / 2);
      } else {
        ctx.fillText('Loading images...', canvas.width / 2, canvas.height / 2);
      }
      return;
    }

    const sortedLayers = [...textLayers].sort((a, b) => a.zIndex - b.zIndex);
    
    // Draw background
    ctx.drawImage(loadedImages.bgImg, 0, 0, canvas.width, canvas.height);

    // Draw text layers that are behind person
    sortedLayers
      .filter((layer) => layer.isBehindPerson)
      .forEach((layer) => drawTextLayer(ctx, layer));

    // Draw segmented person
    ctx.drawImage(loadedImages.personImg, 0, 0, canvas.width, canvas.height);

    // Draw text layers that are in front of person
    sortedLayers
      .filter((layer) => !layer.isBehindPerson)
      .forEach((layer) => drawTextLayer(ctx, layer));
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

  const getHandleCoords = (handleName: string, layer: TextLayer): { x: number; y: number } | null => {
    const { x, y, width, height, rotation } = layer;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    const angle = (rotation * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const handles: { [key: string]: { x: number; y: number } } = {
      "top-left": { x: -width / 2, y: -height / 2 },
      "top-right": { x: width / 2, y: -height / 2 },
      "bottom-left": { x: -width / 2, y: height / 2 },
      "bottom-right": { x: width / 2, y: height / 2 },
      "rotate": { x: 0, y: -height / 2 - 20 },
    };

    const handle = handles[handleName];
    if (!handle) return null;

    const rotatedX = centerX + handle.x * cos - handle.y * sin;
    const rotatedY = centerY + handle.x * sin + handle.y * cos;

    return { x: rotatedX, y: rotatedY };
  }

  const getHandleAtPos = (pos: { x: number; y: number }, layer: TextLayer) => {
    const handleSize = 12;
    const handleNames = ["top-left", "top-right", "bottom-left", "bottom-right", "rotate"];

    for (const name of handleNames) {
      const handlePos = getHandleCoords(name, layer);
      if (handlePos) {
        const dist = Math.sqrt(Math.pow(pos.x - handlePos.x, 2) + Math.pow(pos.y - handlePos.y, 2));
        if (dist <= handleSize / 2) {
          return name;
        }
      }
    }
    return null;
  };

  const getClickedLayer = (pos: { x: number; y: number }) => {
    // Iterate backwards to select top-most layer
    for (let i = textLayers.length - 1; i >= 0; i--) {
      const layer = textLayers[i];
      const { x, y, width, height, rotation } = layer;
      const centerX = x + width / 2;
      const centerY = y + height / 2;

      const angle = (-rotation * Math.PI) / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      // Translate point to be relative to center, then rotate
      const px = pos.x - centerX;
      const py = pos.y - centerY;
      const rotatedX = px * cos - py * sin;
      const rotatedY = px * sin + py * cos;

      // Check if rotated point is inside the un-rotated bounding box
      if (
        rotatedX >= -width / 2 &&
        rotatedX <= width / 2 &&
        rotatedY >= -height / 2 &&
        rotatedY <= height / 2
      ) {
        return layer.id;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e);

    if (selectedLayer) {
      const layer = textLayers.find((l) => l.id === selectedLayer);
      if (layer) {
        const handle = getHandleAtPos(pos, layer);
        if (handle) {
          setActiveHandle(handle);
          setIsDragging(false);
          if (handle === "rotate") {
            setIsRotating(true);
          } else {
            setIsResizing(true);
          }
          setDragStart(pos);
          return;
        }
      }
    }

    const clickedLayerId = getClickedLayer(pos);
    onLayerSelect(clickedLayerId);

    if (clickedLayerId) {
      setIsDragging(true);
      setDragStart(pos);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selectedLayer) return;
    const pos = getMousePos(e);
    const layer = textLayers.find((l) => l.id === selectedLayer);
    if (!layer) return;

    const dx = pos.x - dragStart.x;
    const dy = pos.y - dragStart.y;

    if (isResizing && activeHandle) {
      const oppositeHandleMap: Record<string, string> = {
        "top-left": "bottom-right", "top-right": "bottom-left",
        "bottom-left": "top-right", "bottom-right": "top-left",
      };
      const anchorHandleName = oppositeHandleMap[activeHandle];
      if (!anchorHandleName) return;

      const anchorPos = getHandleCoords(anchorHandleName, layer);
      if (!anchorPos) return;

      const angle = (layer.rotation * Math.PI) / 180;
      const negAngle = -angle;
      const cosN = Math.cos(negAngle);
      const sinN = Math.sin(negAngle);

      const vecX = pos.x - anchorPos.x;
      const vecY = pos.y - anchorPos.y;

      const newWidth = Math.abs(vecX * cosN - vecY * sinN);
      const newHeight = Math.abs(vecX * sinN + vecY * cosN);
      
      const newCenterX = anchorPos.x + vecX / 2;
      const newCenterY = anchorPos.y + vecY / 2;
      
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      
      const toTopLeftX = (-newWidth / 2) * cos - (-newHeight / 2) * sin;
      const toTopLeftY = (-newWidth / 2) * sin + (-newHeight / 2) * cos;
      const newX = newCenterX + toTopLeftX;
      const newY = newCenterY + toTopLeftY;

      onLayerUpdate(selectedLayer, { width: newWidth, height: newHeight, x: newX, y: newY });

    } else if (isRotating) {
      const centerX = layer.x + layer.width / 2;
      const centerY = layer.y + layer.height / 2;
      const angle = Math.atan2(pos.y - centerY, pos.x - centerX) * (180 / Math.PI);
      onLayerUpdate(selectedLayer, { rotation: angle + 90 });
    } else if (isDragging) {
      onLayerUpdate(selectedLayer, { x: layer.x + dx, y: layer.y + dy });
      setDragStart(pos);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    setActiveHandle(null);
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
