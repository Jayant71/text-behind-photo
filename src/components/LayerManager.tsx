import { TextLayer } from "@/pages/Index";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  if (textLayers.length === 0) {
    return (
      <div className={cn(
        "bg-card rounded-xl shadow-lg",
        isMobile ? "p-4" : "p-6"
      )}>
        <h3 className={cn(
          "font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center",
          isMobile ? "text-base" : "text-lg"
        )}>
          <Layers className="w-5 h-5 mr-2" />
          Layers
        </h3>
        <div className={cn(
          "text-center",
          isMobile ? "py-6" : "py-8"
        )}>
          <Layers className={cn(
            "text-slate-300 dark:text-slate-700 mx-auto mb-3",
            isMobile ? "w-8 h-8" : "w-12 h-12"
          )} />
          <p className={cn(
            "text-slate-500 dark:text-slate-400",
            isMobile && "text-sm"
          )}>No text layers yet</p>
          <p className={cn(
            "text-slate-400 dark:text-slate-500",
            isMobile ? "text-xs" : "text-sm"
          )}>Add a text layer to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-card rounded-xl shadow-lg",
      isMobile ? "p-4" : "p-6"
    )}>
      <h3 className={cn(
        "font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center",
        isMobile ? "text-base" : "text-lg"
      )}>
        <Layers className="w-5 h-5 mr-2" />
        Layers ({textLayers.length})
      </h3>

      <div className={cn("space-y-2", isMobile && "space-y-1")}>
        {[...textLayers].reverse().map((layer, index) => (
          <div
            key={layer.id}
            className={cn(
              "border rounded-lg cursor-pointer transition-colors",
              isMobile ? "p-2" : "p-3",
              selectedLayer === layer.id
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/50 dark:border-blue-700"
                : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
            )}
            onClick={() => onLayerSelect(layer.id)}
          >
            <div className={cn(
              "flex items-center justify-between",
              isMobile ? "mb-1" : "mb-2"
            )}>
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <span className={cn(
                  "font-medium truncate text-slate-700 dark:text-slate-300",
                  isMobile ? "text-xs max-w-[80px]" : "text-sm max-w-[100px]"
                )}>
                  {layer.content || "Empty Text"}
                </span>
                <Badge
                  variant={layer.isBehindPerson ? "secondary" : "default"}
                  className={cn(
                    layer.isBehindPerson ? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300" 
                                       : "bg-blue-100 text-blue-700 dark:bg-blue-900/70 dark:text-blue-300",
                    isMobile ? "text-[10px] px-1 py-0" : "text-xs"
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
                  className={cn(
                    isMobile ? "p-0.5 h-5 w-5" : "p-1 h-6 w-6"
                  )}
                >
                  {layer.isBehindPerson ? (
                    <EyeOff className={cn(
                      "text-slate-500 dark:text-slate-400",
                      isMobile ? "w-2.5 h-2.5" : "w-3 h-3"
                    )} />
                  ) : (
                    <Eye className={cn(
                      "text-slate-500 dark:text-slate-400",
                      isMobile ? "w-2.5 h-2.5" : "w-3 h-3"
                    )} />
                  )}
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerDelete(layer.id);
                  }}
                  className={cn(
                    "text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300",
                    isMobile ? "p-0.5 h-5 w-5" : "p-1 h-6 w-6"
                  )}
                >
                  <Trash2 className={cn(
                    isMobile ? "w-2.5 h-2.5" : "w-3 h-3"
                  )} />
                </Button>

                {!isMobile && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveUp(layer.id);
                      }}
                      disabled={index === 0}
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
                      disabled={index === textLayers.length - 1}
                      className="p-1 h-6 w-6 text-slate-500 hover:text-slate-700 disabled:opacity-30 dark:text-slate-400 dark:hover:text-slate-300"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {isMobile && (
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {Math.round(layer.fontSize)}px
                </span>
                <div className="flex space-x-0.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveUp(layer.id);
                    }}
                    disabled={index === 0}
                    className="p-0.5 h-4 w-4"
                  >
                    <ChevronUp className="w-2 h-2" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveDown(layer.id);
                    }}
                    disabled={index === textLayers.length - 1}
                    className="p-0.5 h-4 w-4"
                  >
                    <ChevronDown className="w-2 h-2" />
                  </Button>
                </div>
              </div>
            )}

            {!isMobile && (
              <>
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
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
