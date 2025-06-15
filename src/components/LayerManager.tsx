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
      <div className="bg-card rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
          <Layers className="w-5 h-5 mr-2" />
          Layers
        </h3>
        <div className="text-center py-8">
          <Layers className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No text layers yet</p>
          <p className="text-sm text-slate-400 dark:text-slate-500">Add a text layer to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
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
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/50 dark:border-blue-700"
                : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
            )}
            onClick={() => onLayerSelect(layer.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm truncate max-w-[100px] text-slate-700 dark:text-slate-300">
                  {layer.content || "Empty Text"}
                </span>
                <Badge
                  variant={layer.isBehindPerson ? "secondary" : "default"}
                  className={cn(
                    "text-xs",
                    layer.isBehindPerson ? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300" 
                                       : "bg-blue-100 text-blue-700 dark:bg-blue-900/70 dark:text-blue-300"
                  )}
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
                    <EyeOff className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                  ) : (
                    <Eye className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                  )}
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerDelete(layer.id);
                  }}
                  className="p-1 h-6 w-6 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveUp(layer.id);
                  }}
                  disabled={index === 0} // Corrected: This is the topmost visible item
                  className="p-1 h-6 w-6 text-slate-500 hover:text-slate-700 disabled:opacity-30 dark:text-slate-400 dark:hover:text-slate-300"
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveDown(layer.id);
                  }}
                  disabled={index === textLayers.length - 1} // Corrected: This is the bottommost visible item
                  className="p-1 h-6 w-6 text-slate-500 hover:text-slate-700 disabled:opacity-30 dark:text-slate-400 dark:hover:text-slate-300"
                >
                  <ChevronDown className="w-4 h-4" />
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
