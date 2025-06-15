import { useState } from "react";
import { ImageUploader } from "@/components/ImageUploader";
import { Canvas } from "@/components/Canvas";
import { TextEditor } from "@/components/TextEditor";
import { LayerManager } from "@/components/LayerManager";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
}

export interface ProcessedImage {
  segmentedPerson: string;
  background: string;
  detectionDetails: any;
}

const Index = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null);
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageUpload = async (imageUrl: string, file: File) => {
    setOriginalImage(imageUrl);
    setIsProcessing(true);
    
    try {
      console.log('Starting image processing...');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://jayant17-textbehindphoto-backend.hf.space/api/image/detect', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Processing result:', result);

      setProcessedImage({
        segmentedPerson: `data:image/png;base64,${result.segmented_person_image_base64}`,
        background: `data:image/png;base64,${result.background_image_base64}`,
        detectionDetails: result.detection_details,
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
    };
    
    setTextLayers([...textLayers, newLayer]);
    setSelectedLayer(newLayer.id);
  };

  const updateTextLayer = (id: string, updates: Partial<TextLayer>) => {
    setTextLayers(layers => 
      layers.map(layer => 
        layer.id === id ? { ...layer, ...updates } : layer
      )
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
      const layerIndex = layers.findIndex(l => l.id === id);
      if (layerIndex < layers.length - 1) {
        const newLayers = [...layers];
        [newLayers[layerIndex], newLayers[layerIndex + 1]] = [newLayers[layerIndex + 1], newLayers[layerIndex]];
        return newLayers.map((layer, index) => ({ ...layer, zIndex: index }));
      }
      return layers;
    });
  };

  const moveLayerDown = (id: string) => {
    setTextLayers(layers => {
      const layerIndex = layers.findIndex(l => l.id === id);
      if (layerIndex > 0) {
        const newLayers = [...layers];
        [newLayers[layerIndex], newLayers[layerIndex - 1]] = [newLayers[layerIndex - 1], newLayers[layerIndex]];
        return newLayers.map((layer, index) => ({ ...layer, zIndex: index }));
      }
      return layers;
    });
  };

  const selectedLayerData = selectedLayer ? textLayers.find(l => l.id === selectedLayer) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Text Behind Image Editor
          </h1>
          <p className="text-slate-600 text-lg">
            Create stunning compositions with text layers behind your subject
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <ImageUploader 
              onImageUpload={handleImageUpload}
              isProcessing={isProcessing}
            />
          </div>

          {/* Canvas Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800">Canvas</h2>
                <Button 
                  onClick={addTextLayer}
                  disabled={!processedImage}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add Text Layer
                </Button>
              </div>
              
              <Canvas
                originalImage={originalImage}
                processedImage={processedImage}
                textLayers={textLayers}
                selectedLayer={selectedLayer}
                onLayerSelect={setSelectedLayer}
                onLayerUpdate={updateTextLayer}
              />
            </div>
          </div>

          {/* Controls Section */}
          <div className="lg:col-span-1 space-y-6">
            {/* Text Editor */}
            {selectedLayerData && (
              <TextEditor
                layer={selectedLayerData}
                onUpdate={(updates) => updateTextLayer(selectedLayerData.id, updates)}
              />
            )}

            {/* Layer Manager */}
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
        </div>
      </div>
    </div>
  );
};

export default Index;
