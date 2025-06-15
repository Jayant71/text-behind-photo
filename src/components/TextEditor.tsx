import { TextLayer } from "@/pages/Index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Type, Palette, RotateCw, Move, Eye, EyeOff, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface TextEditorProps {
  layer: TextLayer;
  onUpdate: (updates: Partial<TextLayer>) => void;
}

export const TextEditor = ({ layer, onUpdate }: TextEditorProps) => {
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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
        <Type className="w-5 h-5 mr-2" />
        Text Properties
      </h3>

      <div className="space-y-4">
        {/* Text Content */}
        <div>
          <Label htmlFor="content">Text Content</Label>
          <Textarea
            id="content"
            value={layer.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="Enter text..."
            rows={3}
          />
        </div>

        {/* Font Family */}
        <div>
          <Label>Font Family</Label>
          <Select
            value={layer.fontFamily}
            onValueChange={(value) => onUpdate({ fontFamily: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontFamilies.map((font) => (
                <SelectItem key={font} value={font}>
                  <span style={{ fontFamily: font }}>{font}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Text alignment */}
        <div>
          <Label>Alignment</Label>
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant={layer.textAlign === 'left' ? 'default' : 'outline'}
              size="icon"
              onClick={() => onUpdate({ textAlign: 'left' })}
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={layer.textAlign === 'center' ? 'default' : 'outline'}
              size="icon"
              onClick={() => onUpdate({ textAlign: 'center' })}
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant={layer.textAlign === 'right' ? 'default' : 'outline'}
              size="icon"
              onClick={() => onUpdate({ textAlign: 'right' })}
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Font Size */}
        <div>
          <Label>Font Size: {layer.fontSize}px</Label>
          <Slider
            value={[layer.fontSize]}
            onValueChange={([value]) => onUpdate({ fontSize: value })}
            min={12}
            max={200}
            step={1}
            className="mt-2"
          />
        </div>

        {/* Color */}
        <div>
          <Label htmlFor="color">Color</Label>
          <div className="flex items-center space-x-2 mt-1">
            <Palette className="w-4 h-4 text-slate-500" />
            <Input
              id="color"
              type="color"
              value={layer.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="w-16 h-10 p-1 border rounded"
            />
            <Input
              value={layer.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {presetColors.map((color) => (
              <button
                key={color}
                title={color}
                className={`w-6 h-6 rounded-full border transition-all ${layer.color.toLowerCase() === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => onUpdate({ color })}
              />
            ))}
          </div>
        </div>

        {/* Opacity */}
        <div>
          <Label>Opacity: {Math.round(layer.opacity * 100)}%</Label>
          <Slider
            value={[layer.opacity]}
            onValueChange={([value]) => onUpdate({ opacity: value })}
            min={0}
            max={1}
            step={0.01}
            className="mt-2"
          />
        </div>

        {/* Rotation */}
        <div>
          <Label className="flex items-center">
            <RotateCw className="w-4 h-4 mr-1" />
            Rotation: {layer.rotation}°
          </Label>
          <Slider
            value={[layer.rotation]}
            onValueChange={([value]) => onUpdate({ rotation: value })}
            min={-180}
            max={180}
            step={1}
            className="mt-2"
          />
        </div>

        {/* Position */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>X Position</Label>
            <Input
              type="number"
              value={layer.x}
              onChange={(e) => onUpdate({ x: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label>Y Position</Label>
            <Input
              type="number"
              value={layer.y}
              onChange={(e) => onUpdate({ y: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        {/* Size */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Width</Label>
            <Input
              type="number"
              value={layer.width}
              onChange={(e) => onUpdate({ width: parseInt(e.target.value) || 100 })}
            />
          </div>
          <div>
            <Label>Height</Label>
            <Input
              type="number"
              value={layer.height}
              onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 50 })}
            />
          </div>
        </div>

        {/* Layer Position */}
        <div>
          <Label>Layer Position</Label>
          <Button
            variant={layer.isBehindPerson ? "default" : "outline"}
            onClick={() => onUpdate({ isBehindPerson: !layer.isBehindPerson })}
            className="w-full mt-2"
          >
            {layer.isBehindPerson ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Behind Person
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                In Front of Person
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
