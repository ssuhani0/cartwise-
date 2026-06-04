import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, Image, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function UploadZone({ onUpload, preview }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) onUpload(file);
    },
    [onUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleRemove = (e) => {
    e.stopPropagation();
    onUpload(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      {...getRootProps()}
      className={cn(
        'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
        isDragActive
          ? 'border-primary bg-primary/5 scale-[1.02]'
          : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30',
        preview && 'p-2',
      )}
    >
      <input {...getInputProps()} />

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Upload preview"
            className="w-full h-64 object-contain rounded-xl"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            {isDragActive ? (
              <Image className="h-8 w-8 text-primary" />
            ) : (
              <Upload className="h-8 w-8 text-primary" />
            )}
          </div>
          <div>
            <p className="font-medium text-lg">
              {isDragActive ? 'Drop your image here' : 'Upload your grocery list'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Drag & drop or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Supports JPG, PNG, WebP (max 10MB)
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
