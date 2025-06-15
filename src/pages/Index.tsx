import { useState } from "react";
import { ImageUploader } from "@/components/ImageUploader";
import { Canvas } from "@/components/Canvas";
import { TextEditor } from "@/components/TextEditor";
import { LayerManager } from "@/components/LayerManager";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PanelLeft, PanelRight, Text, Layers as LayersIcon, PlusCircle, Menu, Upload, Settings } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [leftSheetOpen, setLeftSheetOpen] = useState(false);
  const [rightSheetOpen, setRightSheetOpen] = useState(false);
  
  const isMobile = useIsMobile();

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
      color: "hsl(var(--foreground))", // Use foreground color for text
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

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="h-screen w-screen flex flex-col bg-background text-foreground">
        {/* Mobile Header */}
        <header className="flex h-14 items-center gap-2 border-b bg-muted/40 px-4 shrink-0">
          <Sheet open={leftSheetOpen} onOpenChange={setLeftSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Open Tools</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <div className="h-full">
                <Tabs defaultValue="upload" className="h-full flex flex-col">
                  <div className="p-4 border-b">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upload">Upload</TabsTrigger>
                      <TabsTrigger value="layers">Layers</TabsTrigger>
                    </TabsList>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <TabsContent value="upload" className="p-4 m-0 space-y-4">
                      <ImageUploader onImageUpload={handleImageUpload} isProcessing={isProcessing} />
                      <Button onClick={addTextLayer} className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Text Layer
                      </Button>
                    </TabsContent>
                    <TabsContent value="layers" className="p-4 m-0">
                      <LayerManager
                        textLayers={textLayers}
                        selectedLayer={selectedLayer}
                        onLayerSelect={setSelectedLayer}
                        onLayerDelete={deleteTextLayer}
                        onMoveUp={moveLayerUp}
                        onMoveDown={moveLayerDown}
                        onToggleBehindPerson={(id) => updateTextLayer(id, { isBehindPerson: !textLayers.find(l => l.id === id)?.isBehindPerson })}
                      />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </SheetContent>
          </Sheet>

          <a href="/" className="flex items-center gap-2 font-semibold flex-1">
            <span className="text-base">TextBehindImage</span>
          </a>

          <Sheet open={rightSheetOpen} onOpenChange={setRightSheetOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                disabled={!selectedLayerData}
              >
                <Settings className="h-4 w-4" />
                <span className="sr-only">Text Editor</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-4">
              <div className="h-full overflow-auto">
                {selectedLayerData ? (
                  <TextEditor
                    layer={selectedLayerData}
                    onUpdate={(updates) => updateTextLayer(selectedLayerData.id, updates)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Text className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-4" />
                    <p className="text-slate-600 dark:text-slate-400 font-medium">Select a text layer to edit</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">
                      Or add a new text layer from the tools panel.
                    </p>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <ThemeToggle />
        </header>

        {/* Mobile Canvas Area */}
        <div className="flex-1 bg-muted/40 dark:bg-muted/10 flex items-center justify-center p-4">
          <div className="w-full h-full flex items-center justify-center">
            <Canvas
              originalImage={originalImage}
              originalImageDimensions={originalImageDimensions}
              processedImage={processedImage}
              textLayers={textLayers}
              selectedLayer={selectedLayer}
              onLayerSelect={setSelectedLayer}
              onLayerUpdate={updateTextLayer}
            />
          </div>
        </div>

        {/* Mobile Bottom Bar - Quick Actions */}
        <div className="border-t bg-muted/40 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLeftSheetOpen(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Tools
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addTextLayer}
                disabled={!processedImage}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Text
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {textLayers.length} layers
              </span>
              {selectedLayerData && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setRightSheetOpen(true)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Layout (existing)
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
        <ResizablePanel defaultSize={25} minSize={20} className="flex flex-col">
          <div className="p-4 space-y-4 overflow-auto bg-card">
            <ImageUploader onImageUpload={handleImageUpload} isProcessing={isProcessing} />
            <LayerManager
              textLayers={textLayers}
              selectedLayer={selectedLayer}
              onLayerSelect={setSelectedLayer}
              onLayerDelete={deleteTextLayer}
              onMoveUp={moveLayerUp}
              onMoveDown={moveLayerDown}
              onToggleBehindPerson={(id) => updateTextLayer(id, { isBehindPerson: !textLayers.find(l => l.id === id)?.isBehindPerson })}
            />
            <Button onClick={addTextLayer} className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Text Layer
            </Button>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} minSize={30} className="bg-muted/40 dark:bg-muted/10 flex items-center justify-center">
          <Canvas
            originalImage={originalImage}
            originalImageDimensions={originalImageDimensions}
            processedImage={processedImage}
            textLayers={textLayers}
            selectedLayer={selectedLayer}
            onLayerSelect={setSelectedLayer}
            onLayerUpdate={updateTextLayer}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={25} minSize={20}>
          <div className="p-4 bg-card h-full overflow-auto">
            {selectedLayerData ? (
              <TextEditor
                layer={selectedLayerData}
                onUpdate={(updates) => updateTextLayer(selectedLayerData.id, updates)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Text className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-4" />
                <p className="text-slate-600 dark:text-slate-400 font-medium">Select a text layer to edit</p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  Or add a new text layer from the left panel.
                </p>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;
