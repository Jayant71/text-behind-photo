import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string, file: File, dimensions: { width: number; height: number }) => void;
  isProcessing: boolean;
}

export const ImageUploader = ({ onImageUpload, isProcessing }: ImageUploaderProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        onImageUpload(url, file, { width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(url); // Clean up object URL
      };
      img.src = url;
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div className="bg-card rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Upload Image</h2>
      
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragOver ? "border-blue-500 bg-blue-50 dark:bg-blue-900/50" : "border-slate-300 dark:border-slate-700",
          "hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
        />
        
        <div className="space-y-4">
          {isProcessing ? (
            <>
              <Loader2 className="w-12 h-12 text-blue-500 mx-auto animate-spin" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">Processing image...</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Segmenting person from background
              </p>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                  <ImageIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div>
                <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">
                  Drop your image here or click to browse
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Supports JPG, PNG, WebP up to 10MB
                </p>
              </div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
