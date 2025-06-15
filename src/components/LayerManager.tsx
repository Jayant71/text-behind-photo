
import { TextLayer } from "@/pages/Index";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayerManagerProps {
  textLayers: TextLayer[];
  selectedLayer: string | null;
  onLayerSelect: (id: string) => void;
  onLayerDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onToggleBehindPerson: (id: string) => void;
}

export const LayerManager = ({
  textLayers,
  selectedLayer,
  onLayerSelect,
  onLayerDelete,
  onMoveUp,
  onMoveDown,
  onToggleBehindPerson,
}: LayerManagerProps) => {
  if (textLayers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <Layers className="w-5 h-5 mr-2" />
          Layers
        </h3>
        <div className="text-center py-8">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No text layers yet</p>
          <p className="text-sm text-slate-400">Add a text layer to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
        <Layers className="w-5 h-5 mr-2" />
        Layers ({textLayers.length})
      </h3>

      <div className="space-y-2">
        {[...textLayers].reverse().map((layer, index) => (
          <div
            key={layer.id}
            className={cn(
              "border rounded-lg p-3 cursor-pointer transition-colors",
              selectedLayer === layer.id
                ? "border-blue-500 bg-blue-50"
                : "border-slate-200 hover:border-slate-300"
            )}
            onClick={() => onLayerSelect(layer.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm truncate max-w-[100px]">
                  {layer.content || "Empty Text"}
                </span>
                <Badge
                  variant={layer.isBehindPerson ? "secondary" : "default"}
                  className="text-xs"
                >
                  {layer.isBehindPerson ? "Behind" : "Front"}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBehindPerson(layer.id);
                  }}
                  className="p-1 h-6 w-6"
                >
                  {layer.isBehindPerson ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerDelete(layer.id);
                  }}
                  className="p-1 h-6 w-6 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                {layer.fontSize}px {layer.fontFamily}
              </span>
              
              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveUp(layer.id);
                  }}
                  disabled={index === 0}
                  className="p-1 h-5 w-5"
                >
                  <ChevronUp className="w-3 h-3" />
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveDown(layer.id);
                  }}
                  disabled={index === textLayers.length - 1}
                  className="p-1 h-5 w-5"
                >
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="mt-2 text-xs text-slate-400">
              Position: ({layer.x}, {layer.y}) • Rotation: {layer.rotation}°
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
