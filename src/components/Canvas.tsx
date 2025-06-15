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
  originalImageDimensions: { width: number; height: number } | null;
}

interface InteractionState {
  type: 'move' | 'resize' | 'rotate' | null;
  layerId: string | null;
  handle: string | null;
  startPos: { x: number; y: number };
  startLayer: TextLayer | null;
}

export const Canvas = ({
  originalImage,
  processedImage,
  textLayers,
  selectedLayer,
  onLayerSelect,
  onLayerUpdate,
  originalImageDimensions,
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [interactionState, setInteractionState] = useState<InteractionState>({
    type: null,
    layerId: null,
    handle: null,
    startPos: { x: 0, y: 0 },
    startLayer: null,
  });
  const [loadedImages, setLoadedImages] = useState<{
    bgImg: HTMLImageElement | null;
    personImg: HTMLImageElement | null;
  }>({ bgImg: null, personImg: null });

  // Effect to set initial canvas size or when originalImageDimensions changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      if (originalImageDimensions) {
        canvas.width = originalImageDimensions.width;
        canvas.height = originalImageDimensions.height;
      } else {
        // Default placeholder size if no image is loaded
        canvas.width = 500; // Or any other placeholder width
        canvas.height = 300; // Or any other placeholder height
      }
      drawCanvas(); // Redraw with new dimensions
    }
  }, [originalImageDimensions]);

  useEffect(() => {
    if (processedImage && originalImageDimensions) {
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      const personImg = new Image();
      personImg.crossOrigin = "anonymous";

      let bgLoaded = false;
      let personLoaded = false;

      const checkAllLoaded = () => {
        if (bgLoaded && personLoaded) {
          setLoadedImages({ bgImg, personImg });
          // Set canvas dimensions here based on the original image
          const canvas = canvasRef.current;
          if (canvas) {
            canvas.width = originalImageDimensions.width;
            canvas.height = originalImageDimensions.height;
          }
          toast.success("Canvas images loaded.");
        }
      };

      bgImg.onload = () => { bgLoaded = true; checkAllLoaded(); };
      personImg.onload = () => { personLoaded = true; checkAllLoaded(); };
      
      const onError = (e: any) => {
        console.error("Error loading image for canvas", e);
        toast.error("Failed to load images for canvas.");
        setLoadedImages({ bgImg: null, personImg: null });
      }
      bgImg.onerror = onError;
      personImg.onerror = onError;
      
      bgImg.src = processedImage.background;
      personImg.src = processedImage.segmentedPerson;

    } else {
      setLoadedImages({ bgImg: null, personImg: null });
      // If processedImage is null (e.g. on initial load or after clearing an image)
      // ensure the canvas is drawn with placeholder content or cleared.
      drawCanvas(); 
    }
  }, [processedImage, originalImageDimensions]);

  useEffect(() => {
    drawCanvas();
  }, [textLayers, selectedLayer, loadedImages]); // Removed originalImageDimensions from here as it's handled above

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Use a theme-aware background color for the canvas itself
    const isDarkMode = document.documentElement.classList.contains('dark');
    ctx.fillStyle = isDarkMode ? "hsl(var(--muted))" : "#ffffff"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // If no image is processed yet, or images are loading, show placeholder text
    if (!processedImage || !loadedImages.bgImg || !loadedImages.personImg) {
      ctx.fillStyle = isDarkMode ? 'hsl(var(--foreground))' : '#64748b';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (!originalImage) { // Changed condition to check for originalImage to show placeholder before any upload
        ctx.fillText('Upload an image to get started', canvas.width / 2, canvas.height / 2);
      } else if (!processedImage) {
        ctx.fillText('Processing image...', canvas.width / 2, canvas.height / 2);
      } else {
        ctx.fillText('Loading images...', canvas.width / 2, canvas.height / 2);
      }
      return;
    }

    const sortedLayers = [...textLayers].sort((a, b) => a.zIndex - b.zIndex);
    
    // Draw background, ensuring it scales to canvas dimensions if different
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
    ctx.textAlign = layer.textAlign || 'center';
    ctx.textBaseline = 'middle';
    
    // Draw text (multiline support)
    const lines = layer.content.split('\n');
    const lineHeight = layer.fontSize * 1.2;
    const totalTextHeight = (lines.length - 1) * lineHeight;
    const startY = -totalTextHeight / 2;
    
    let startX = 0;
    if (ctx.textAlign === 'left') {
      startX = -layer.width / 2;
    } else if (ctx.textAlign === 'right') {
      startX = layer.width / 2;
    }

    lines.forEach((line, index) => {
      ctx.fillText(line, startX, startY + (index * lineHeight));
    });
    
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
    const sortedLayers = [...textLayers].sort((a, b) => a.zIndex - b.zIndex).reverse();
    for (const layer of sortedLayers) {
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
    let clickedLayerId: string | null = null;
    let handle: string | null = null;

    if (selectedLayer) {
      const layer = textLayers.find((l) => l.id === selectedLayer);
      if (layer) {
        handle = getHandleAtPos(pos, layer);
        if (handle) {
          clickedLayerId = selectedLayer;
        }
      }
    }
    
    if (!handle) {
      clickedLayerId = getClickedLayer(pos);
    }

    onLayerSelect(clickedLayerId);

    if (clickedLayerId) {
      const layer = textLayers.find((l) => l.id === clickedLayerId);
      if (layer) {
        const interactionType = handle ? (handle === 'rotate' ? 'rotate' : 'resize') : 'move';
        setInteractionState({
          type: interactionType,
          layerId: clickedLayerId,
          handle: handle,
          startPos: pos,
          startLayer: layer,
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { type, layerId, handle, startPos, startLayer } = interactionState;
    if (!type || !layerId || !startLayer) return;

    const pos = getMousePos(e);

    if (type === 'move') {
      const dx = pos.x - startPos.x;
      const dy = pos.y - startPos.y;
      onLayerUpdate(layerId, { x: startLayer.x + dx, y: startLayer.y + dy });
    } else if (type === 'rotate') {
      const centerX = startLayer.x + startLayer.width / 2;
      const centerY = startLayer.y + startLayer.height / 2;
      const startAngle = Math.atan2(startPos.y - centerY, startPos.x - centerX);
      const currentAngle = Math.atan2(pos.y - centerY, pos.x - centerX);
      const angleDiff = currentAngle - startAngle;
      onLayerUpdate(layerId, { rotation: startLayer.rotation + angleDiff * (180 / Math.PI) });
    } else if (type === 'resize' && handle) {
        const oppositeHandleMap: Record<string, string> = {
            "top-left": "bottom-right", "top-right": "bottom-left",
            "bottom-left": "top-right", "bottom-right": "top-left",
        };
        const anchorHandleName = oppositeHandleMap[handle];
        if (!anchorHandleName) return;

        const anchorPos = getHandleCoords(anchorHandleName, startLayer);
        if (!anchorPos) return;

        const angle = startLayer.rotation * Math.PI / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const negAngle = -angle;
        const cosN = Math.cos(negAngle);
        const sinN = Math.sin(negAngle);

        const vecX = pos.x - anchorPos.x;
        const vecY = pos.y - anchorPos.y;

        const newWidth = Math.max(10, Math.abs(vecX * cosN - vecY * sinN));
        const newHeight = Math.max(10, Math.abs(vecX * sinN + vecY * cosN));

        const newCenterX = anchorPos.x + vecX / 2;
        const newCenterY = anchorPos.y + vecY / 2;
        
        const toTopLeftX = (-newWidth / 2) * cos - (-newHeight / 2) * sin;
        const toTopLeftY = (-newWidth / 2) * sin + (-newHeight / 2) * cos;
        const newX = newCenterX + toTopLeftX;
        const newY = newCenterY + toTopLeftY;
        
        const newFontSize = Math.max(10, Math.round(newHeight / (startLayer.content.split('\n').length || 1) * 0.8));

        onLayerUpdate(layerId, { width: newWidth, height: newHeight, x: newX, y: newY, fontSize: newFontSize });
    }
  };

  const handleMouseUp = () => {
    setInteractionState({ type: null, layerId: null, handle: null, startPos: { x: 0, y: 0 }, startLayer: null });
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas || !originalImageDimensions) return;
    
    // Deselect layer before downloading
    const currentSelected = selectedLayer;
    onLayerSelect(null);

    // Redraw canvas without selection handles
    setTimeout(() => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = originalImageDimensions.width;
      tempCanvas.height = originalImageDimensions.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      // Draw current canvas content to temp canvas
      // This ensures we are downloading what is currently rendered at original dimensions
      tempCtx.drawImage(canvas, 0, 0, originalImageDimensions.width, originalImageDimensions.height);

      const link = document.createElement('a');
      link.download = 'text-behind-image.png';
      link.href = tempCanvas.toDataURL();
      link.click();
      
      toast.success("Image downloaded successfully!");
      
      // Reselect layer
      onLayerSelect(currentSelected);
    }, 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {originalImage ? "Click and drag text layers to position them" : "Upload an image to start editing"} 
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
      
      <div className="border border-border rounded-lg overflow-hidden shadow-md bg-card">
        <canvas
          ref={canvasRef}
          // width and height are now set dynamically in useEffect
          className="max-w-full max-h-full h-auto cursor-pointer display-block" // Added display-block to prevent extra space below canvas
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
    </div>
  );
};
