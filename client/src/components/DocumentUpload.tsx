import { useState, useCallback } from "react";
import { Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentUploadProps {
  onUpload?: (file: File) => void;
  testId?: string;
}

export default function DocumentUpload({ onUpload, testId }: DocumentUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setUploadedFile(file);
      onUpload?.(file);
      console.log('File uploaded:', file.name);
    }
  }, [onUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      onUpload?.(file);
      console.log('File uploaded:', file.name);
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    console.log('File removed');
  };

  return (
    <div className="w-full" data-testid={testId}>
      {!uploadedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          className={`relative min-h-64 border-2 border-dashed rounded-lg transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}
          data-testid="dropzone-upload"
        >
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            data-testid="input-file"
          />
          <div className="flex flex-col items-center justify-center h-full py-12 px-6">
            <Upload className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Document</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Drag and drop your ID, passport, or driver's license here
            </p>
            <p className="text-xs text-muted-foreground">
              Supports: JPG, PNG, PDF (Max 10MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-6" data-testid="preview-uploaded">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleRemove} data-testid="button-remove-file">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
