import { useState } from "react";
import { ImageUploader } from "@/components/ImageUploader";
import { Canvas } from "@/components/Canvas";
import { TextEditor } from "@/components/TextEditor";
import { LayerManager } from "@/components/LayerManager";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PanelLeft, PanelRight, Text, Layers as LayersIcon, PlusCircle } from "lucide-react";

export interface TextLayer {
  id: string;
  content: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  opacity: number;
  rotation: number;
  width: number;
  height: number;
  zIndex: number;
  isBehindPerson: boolean;
  textAlign: 'left' | 'center' | 'right';
}

export interface ProcessedImage {
  segmentedPerson: string;
  background: string;
  detectionDetails: any;
  originalWidth: number;
  originalHeight: number;
}

const Index = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalImageDimensions, setOriginalImageDimensions] = useState<{width: number, height: number} | null>(null);
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null);
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageUpload = async (imageUrl: string, file: File, dimensions: {width: number, height: number}) => {
    setOriginalImage(imageUrl);
    setOriginalImageDimensions(dimensions);
    setIsProcessing(true);
    setProcessedImage(null);
    setTextLayers([]);
    setSelectedLayer(null);
    
    try {
      console.log('Starting image processing...');
      const formData = new FormData();
      formData.append('file', file);

      const apiUrl = import.meta.env.VITE_SEGMENT_API_ENDPOINT;

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Processing result:', result);

      setProcessedImage({
        segmentedPerson: result.segmented_person_image_base64,
        background: result.background_image_base64,
        detectionDetails: result.detection_details,
        originalWidth: dimensions.width,
        originalHeight: dimensions.height,
      });
      toast.success("Image processed successfully!");
    } catch (error) {
      console.error('Processing error:', error);
      toast.error("Failed to process image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const addTextLayer = () => {
    const newLayer: TextLayer = {
      id: `text-${Date.now()}`,
      content: "New Text",
      x: 100,
      y: 100,
      fontSize: 48,
      fontFamily: "Arial",
      color: "#000000",
      opacity: 1,
      rotation: 0,
      width: 200,
      height: 60,
      zIndex: textLayers.length,
      isBehindPerson: false,
      textAlign: 'center',
    };
    
    setTextLayers([...textLayers, newLayer]);
    setSelectedLayer(newLayer.id);
  };

  const updateTextLayer = (id: string, updates: Partial<TextLayer>) => {
    setTextLayers(layers =>
      layers.map(layer => {
        if (layer.id !== id) {
          return layer;
        }

        const newLayer = { ...layer, ...updates };

        // Manual resize from canvas -> update font size
        if (updates.width !== undefined || updates.height !== undefined) {
            const oldArea = layer.width * layer.height;
            const newArea = newLayer.width * newLayer.height;
            if (oldArea > 1 && newArea > 1) {
                const ratio = Math.sqrt(newArea / oldArea);
                newLayer.fontSize = Math.max(8, Math.round(layer.fontSize * ratio));
            }
        }
        // If content, font size, or font family changes, dynamically resize the text box
        else if (
          (updates.content !== undefined ||
            updates.fontSize !== undefined ||
            updates.fontFamily !== undefined) &&
          updates.width === undefined // Avoid overriding manual canvas resize
        ) {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.font = `${newLayer.fontSize}px ${newLayer.fontFamily}`;
            const lines = newLayer.content.split("\n");
            const widths = lines.map((line) => ctx.measureText(line).width);
            const maxWidth = Math.max(0, ...widths);

            const lineHeight = newLayer.fontSize * 1.2;
            const textBlockHeight = (lines.length - 1) * lineHeight + newLayer.fontSize;
            
            const PADDING = 20;
            newLayer.width = maxWidth + PADDING;
            newLayer.height = textBlockHeight + PADDING;
          }
        }

        return newLayer;
      })
    );
  };

  const deleteTextLayer = (id: string) => {
    setTextLayers(layers => layers.filter(layer => layer.id !== id));
    if (selectedLayer === id) {
      setSelectedLayer(null);
    }
  };

  const moveLayerUp = (id: string) => {
    setTextLayers(layers => {
      const newLayers = [...layers];
      const layerIndex = newLayers.findIndex(l => l.id === id);
      if (layerIndex > 0) {
        [newLayers[layerIndex], newLayers[layerIndex - 1]] = [newLayers[layerIndex - 1], newLayers[layerIndex]];
        return newLayers.map((layer, index) => ({ ...layer, zIndex: index }));
      }
      return layers;
    });
  };

  const moveLayerDown = (id: string) => {
    setTextLayers(layers => {
      const newLayers = [...layers];
      const layerIndex = newLayers.findIndex(l => l.id === id);
      if (layerIndex < newLayers.length - 1) {
        [newLayers[layerIndex], newLayers[layerIndex + 1]] = [newLayers[layerIndex + 1], newLayers[layerIndex]];
        return newLayers.map((layer, index) => ({ ...layer, zIndex: index }));
      }
      return layers;
    });
  };

  const selectedLayerData = selectedLayer ? textLayers.find(l => l.id === selectedLayer) : null;

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground">
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 shrink-0">
        <a href="/" className="flex items-center gap-2 font-semibold">
          
          <span className="text-lg">TextBehindImage</span>
        </a>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <div className="flex flex-col h-full p-4 gap-4 overflow-y-auto bg-muted">
            <h2 className="text-lg font-semibold flex items-center"><PanelLeft className="mr-2 h-5 w-5"/>Controls</h2>
            <ImageUploader 
              onImageUpload={handleImageUpload}
              isProcessing={isProcessing}
            />
            
            <Button 
              onClick={addTextLayer}
              disabled={!processedImage}
              className="w-full"
            >
              <PlusCircle className="mr-2 h-4 w-4"/>
              Add Text
            </Button>

            <LayerManager
              textLayers={textLayers}
              selectedLayer={selectedLayer}
              onLayerSelect={setSelectedLayer}
              onLayerDelete={deleteTextLayer}
              onMoveUp={moveLayerUp}
              onMoveDown={moveLayerDown}
              onToggleBehindPerson={(id) => {
                const layer = textLayers.find(l => l.id === id);
                if (layer) {
                  updateTextLayer(id, { isBehindPerson: !layer.isBehindPerson });
                }
              }}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60} minSize={40}>
          <div className="flex items-center justify-center h-full bg-muted p-4 overflow-auto">
             <Canvas
                originalImage={originalImage}
                processedImage={processedImage}
                textLayers={textLayers}
                selectedLayer={selectedLayer}
                onLayerSelect={setSelectedLayer}
                onLayerUpdate={updateTextLayer}
                originalImageDimensions={originalImageDimensions}
              />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <div className="flex flex-col h-full p-4 gap-4 overflow-y-auto bg-muted">
            <h2 className="text-lg font-semibold flex items-center"><PanelRight className="mr-2 h-5 w-5"/>Properties</h2>
            {selectedLayerData ? (
              <TextEditor
                layer={selectedLayerData}
                onUpdate={(updates) => updateTextLayer(selectedLayerData.id, updates)}
              />
            ) : (
               <div className="text-center text-muted-foreground p-8">
                <LayersIcon className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
                <p>Select a layer to see its properties</p>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;
