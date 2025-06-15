import { TextLayer } from "@/pages/Index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Type, Palette, RotateCw, Move, Eye, EyeOff, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface TextEditorProps {
  layer: TextLayer;
  onUpdate: (updates: Partial<TextLayer>) => void;
}

export const TextEditor = ({ layer, onUpdate }: TextEditorProps) => {
  const isMobile = useIsMobile();
  
  const fontFamilies = [
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Georgia",
    "Verdana",
    "Comic Sans MS",
    "Impact",
    "Trebuchet MS",
    "Arial Black",
    "Courier New",
  ];

  const presetColors = [
    "#000000",
    "#ffffff",
    "#ef4444", // red-500
    "#22c55e", // green-500
    "#3b82f6", // blue-500
    "#eab308", // yellow-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
  ];

  return (
    <div className={cn(
      "bg-card rounded-xl shadow-lg text-foreground",
      isMobile ? "p-4" : "p-6"
    )}>
      <h3 className={cn(
        "font-semibold text-card-foreground mb-4 flex items-center",
        isMobile ? "text-base" : "text-lg"
      )}>
        <Type className="w-5 h-5 mr-2" />
        Text Properties
      </h3>

      <div className={cn("space-y-4", isMobile && "space-y-3")}>
        {/* Text Content */}
        <div>
          <Label htmlFor="content" className="text-muted-foreground">Text Content</Label>
          <Textarea
            id="content"
            value={layer.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="Enter text..."
            rows={isMobile ? 2 : 3}
            className={cn(
              "bg-background text-foreground border-border placeholder:text-muted-foreground",
              isMobile && "text-sm"
            )}
          />
        </div>

        {/* Font Family */}
        <div>
          <Label className={cn("text-muted-foreground", isMobile && "text-sm")}>Font Family</Label>
          <Select
            value={layer.fontFamily}
            onValueChange={(value) => onUpdate({ fontFamily: value })}
          >
            <SelectTrigger className={cn(
              "bg-background text-foreground border-border",
              isMobile && "h-9 text-sm"
            )}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover text-popover-foreground">
              {fontFamilies.map((font) => (
                <SelectItem key={font} value={font} className="hover:bg-accent focus:bg-accent">
                  <span style={{ fontFamily: font }}>{font}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Text alignment */}
        <div>
          <Label className={cn("text-muted-foreground", isMobile && "text-sm")}>Alignment</Label>
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant={layer.textAlign === 'left' ? 'default' : 'outline'}
              size={isMobile ? "sm" : "icon"}
              onClick={() => onUpdate({ textAlign: 'left' })}
              title="Align Left"
              className={`${layer.textAlign === 'left' ? 'bg-primary text-primary-foreground' : 'bg-transparent border-border hover:bg-accent'}`}
            >
              <AlignLeft className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
            </Button>
            <Button
              variant={layer.textAlign === 'center' ? 'default' : 'outline'}
              size={isMobile ? "sm" : "icon"}
              onClick={() => onUpdate({ textAlign: 'center' })}
              title="Align Center"
              className={`${layer.textAlign === 'center' ? 'bg-primary text-primary-foreground' : 'bg-transparent border-border hover:bg-accent'}`}
            >
              <AlignCenter className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
            </Button>
            <Button
              variant={layer.textAlign === 'right' ? 'default' : 'outline'}
              size={isMobile ? "sm" : "icon"}
              onClick={() => onUpdate({ textAlign: 'right' })}
              title="Align Right"
              className={`${layer.textAlign === 'right' ? 'bg-primary text-primary-foreground' : 'bg-transparent border-border hover:bg-accent'}`}
            >
              <AlignRight className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
            </Button>
          </div>
        </div>

        {/* Font Size */}
        <div>
          <Label className={cn("text-muted-foreground", isMobile && "text-sm")}>
            Font Size: {layer.fontSize}px
          </Label>
          <Slider
            value={[layer.fontSize]}
            onValueChange={([value]) => onUpdate({ fontSize: value })}
            min={12}
            max={200}
            step={1}
            className={cn("mt-2 [&>span:first-child]:bg-primary", isMobile && "h-4")}
          />
        </div>

        {/* Color */}
        <div>
          <Label htmlFor="color" className={cn("text-muted-foreground", isMobile && "text-sm")}>Color</Label>
          <div className="flex items-center space-x-2 mt-1">
            <Palette className={cn("text-muted-foreground", isMobile ? "w-3 h-3" : "w-4 h-4")} />
            <Input
              id="color"
              type="color"
              value={layer.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className={cn(
                "p-1 border rounded bg-background border-border",
                isMobile ? "w-12 h-8" : "w-16 h-10"
              )}
            />
            <Input
              value={layer.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              placeholder="#000000"
              className={cn(
                "flex-1 bg-background text-foreground border-border placeholder:text-muted-foreground",
                isMobile && "text-sm h-8"
              )}
            />
          </div>
          <div className={cn("flex flex-wrap gap-2 mt-2", isMobile && "gap-1")}>
            {presetColors.map((color) => (
              <button
                key={color}
                title={color}
                className={cn(
                  "rounded-full border border-border transition-all",
                  isMobile ? "w-5 h-5" : "w-6 h-6",
                  layer.color.toLowerCase() === color ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-background' : ''
                )}
                style={{ backgroundColor: color }}
                onClick={() => onUpdate({ color })}
              />
            ))}
          </div>
        </div>

        {/* Opacity */}
        <div>
          <Label className={cn("text-muted-foreground", isMobile && "text-sm")}>
            Opacity: {Math.round(layer.opacity * 100)}%
          </Label>
          <Slider
            value={[layer.opacity]}
            onValueChange={([value]) => onUpdate({ opacity: value })}
            min={0}
            max={1}
            step={0.01}
            className={cn("mt-2 [&>span:first-child]:bg-primary", isMobile && "h-4")}
          />
        </div>

        {!isMobile && (
          <>
            {/* Rotation - Only on desktop */}
            <div>
              <Label className="flex items-center text-muted-foreground">
                <RotateCw className="w-4 h-4 mr-1" />
                Rotation: {layer.rotation}°
              </Label>
              <Slider
                value={[layer.rotation]}
                onValueChange={([value]) => onUpdate({ rotation: value })}
                min={-180}
                max={180}
                step={1}
                className="mt-2 [&>span:first-child]:bg-primary"
              />
            </div>

            {/* Position - Only on desktop */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">X Position</Label>
                <Input
                  type="number"
                  value={layer.x}
                  onChange={(e) => onUpdate({ x: parseInt(e.target.value) || 0 })}
                  className="bg-background text-foreground border-border"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Y Position</Label>
                <Input
                  type="number"
                  value={layer.y}
                  onChange={(e) => onUpdate({ y: parseInt(e.target.value) || 0 })}
                  className="bg-background text-foreground border-border"
                />
              </div>
            </div>

            {/* Dimensions - Only on desktop */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Width</Label>
                <Input
                  type="number"
                  value={layer.width}
                  onChange={(e) => onUpdate({ width: parseInt(e.target.value) || 0 })}
                  className="bg-background text-foreground border-border"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Height</Label>
                <Input
                  type="number"
                  value={layer.height}
                  onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 0 })}
                  className="bg-background text-foreground border-border"
                />
              </div>
            </div>
          </>
        )}

        {/* Layer Position */}
        <div>
          <Label className={cn("text-muted-foreground", isMobile && "text-sm")}>Layer Position</Label>
          <Button
            variant="outline"
            onClick={() => onUpdate({ isBehindPerson: !layer.isBehindPerson })}
            className={cn(
              "w-full mt-1 bg-transparent border-border hover:bg-accent",
              isMobile && "h-9 text-sm"
            )}
          >
            {layer.isBehindPerson ? (
              <EyeOff className={cn("mr-2", isMobile ? "w-3 h-3" : "w-4 h-4")} />
            ) : (
              <Eye className={cn("mr-2", isMobile ? "w-3 h-3" : "w-4 h-4")} />
            )}
            {layer.isBehindPerson ? "Behind Person" : "In Front of Person"}
          </Button>
        </div>

        {isMobile && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Drag text on canvas to reposition • Pinch to resize
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
