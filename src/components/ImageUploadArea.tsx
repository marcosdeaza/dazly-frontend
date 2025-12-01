// src/components/ImageUploadArea.tsx

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface UploadedImage {
  id: string;
  file: File;
  url: string;
  name: string;
}

interface ImageUploadAreaProps {
  uploadedImages: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  onImageInsert: (imageNumber: number) => void;
}

export const ImageUploadArea = ({ 
  uploadedImages, 
  onImagesChange, 
  onImageInsert 
}: ImageUploadAreaProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: UploadedImage[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          const newImage: UploadedImage = {
            id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            file,
            url: imageUrl,
            name: file.name.split('.')[0]
          };
          
          newImages.push(newImage);
          
          if (newImages.length === files.length) {
            onImagesChange([...uploadedImages, ...newImages]);
            toast({
              title: "Imágenes cargadas",
              description: `${newImages.length} imagen(es) lista(s) para usar`
            });
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (imageId: string) => {
    const updatedImages = uploadedImages.filter(img => img.id !== imageId);
    onImagesChange(updatedImages);
  };

  const insertImageReference = (image: UploadedImage, index: number) => {
    onImageInsert(index + 1); // Usar números empezando en 1
  };

  return (
    <div className="space-y-4">
      {/* Smart Upload Button - Solo si no hay imágenes */}
      {uploadedImages.length === 0 && (
        <div className="text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="bg-purple-900/20 border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
          >
            <Upload className="h-4 w-4 mr-2" />
            Subir Imágenes
          </Button>
        </div>
      )}

      {/* Add More Button - Solo si ya hay imágenes */}
      {uploadedImages.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-purple-300 font-light">
            {uploadedImages.length} imagen{uploadedImages.length !== 1 ? 'es' : ''} cargada{uploadedImages.length !== 1 ? 's' : ''}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
          >
            <Plus className="h-4 w-4 mr-1" />
            Añadir más
          </Button>
        </div>
      )}

      {/* Uploaded Images Grid */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {uploadedImages.map((image, index) => (
            <div
              key={image.id}
              className="relative group bg-purple-900/10 rounded-xl border border-purple-500/20 overflow-hidden hover:border-purple-400/40 transition-all duration-300"
            >
              {/* Image Number Badge */}
              <div className="absolute top-2 left-2 z-10">
                <div className="bg-purple-600/90 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {index + 1}
                </div>
              </div>

              {/* Image Preview */}
              <div className="aspect-square relative">
                <img
                  src={image.url}
                  alt={`imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => insertImageReference(image, index)}
                      className="h-8 w-8 p-0 bg-purple-600/80 hover:bg-purple-500/90 rounded-full"
                      title={`Mencionar imagen ${index + 1}`}
                    >
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => removeImage(image.id)}
                      className="h-8 w-8 p-0 bg-red-600/80 hover:bg-red-500/90 rounded-full"
                      title="Eliminar imagen"
                    >
                      <X className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Image Info */}
              <div className="p-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-purple-200 font-medium">
                    Imagen {index + 1}
                  </span>
                  <span className="text-xs text-purple-400/60">
                    {(image.file.size / 1024).toFixed(1)}KB
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {uploadedImages.length === 0 && (
        <div 
          className="border-2 border-dashed border-purple-500/30 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-12 w-12 mx-auto text-purple-400/40 mb-3" />
          <p className="text-sm text-purple-300/60 mb-2">
            Arrastra imágenes aquí o haz clic para subir
          </p>
          <p className="text-xs text-purple-400/40">
            Formatos: JPG, PNG, WebP • Máx: 10MB
          </p>
        </div>
      )}
    </div>
  );
};