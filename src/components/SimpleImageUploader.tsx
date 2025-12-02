// src/components/SimpleImageUploader.tsx - Sistema simple de carga de imágenes con Ctrl+V
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ImagePlus, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImageData {
  id: string;
  file: File;
  url: string;
  name: string;
}

interface SimpleImageUploaderProps {
  onImagesChange: (images: ImageData[]) => void;
  maxImages?: number;
  existingImages?: ImageData[];
}

export const SimpleImageUploader: React.FC<SimpleImageUploaderProps> = ({
  onImagesChange,
  maxImages = 5,
  existingImages = []
}) => {
  const [images, setImages] = useState<ImageData[]>(existingImages);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Actualizar imágenes cuando cambien las existentes
  useEffect(() => {
    setImages(existingImages);
  }, [existingImages]);

  // Notificar cambios
  useEffect(() => {
    onImagesChange(images);
  }, [images, onImagesChange]);

  // Validar y procesar archivo
  const processFile = useCallback((file: File): ImageData | null => {
    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return null;
    }

    // Validar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('La imagen no debe superar 10MB');
      return null;
    }

    return {
      id: `${Date.now()}-${Math.random()}`,
      file,
      url: URL.createObjectURL(file),
      name: file.name
    };
  }, []);

  // Agregar imágenes
  const addImages = useCallback((files: File[]) => {
    const remainingSlots = maxImages - images.length;
    
    if (remainingSlots <= 0) {
      toast.error(`Ya tienes ${maxImages} imágenes. Elimina alguna para añadir más.`);
      return;
    }

    if (files.length > remainingSlots) {
      toast.error(`Solo puedes añadir ${remainingSlots} imagen${remainingSlots > 1 ? 'es' : ''} más`);
      files = files.slice(0, remainingSlots);
    }

    const newImages: ImageData[] = [];
    for (const file of files) {
      const imageData = processFile(file);
      if (imageData) {
        newImages.push(imageData);
      }
    }

    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages]);
      toast.success(`${newImages.length} imagen${newImages.length > 1 ? 'es' : ''} añadida${newImages.length > 1 ? 's' : ''}`);
    }
  }, [images.length, maxImages, processFile]);

  // Manejar selección de archivos
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      addImages(files);
    }
    // Limpiar input para permitir seleccionar el mismo archivo de nuevo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addImages]);

  // ⚠️ Ctrl+V se maneja en ChatPage para funcionar globalmente

  // Eliminar imagen
  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      // Liberar URL del objeto
      const removed = prev.find(img => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.url);
      }
      return updated;
    });
  }, []);

  // Abrir selector de archivos
  const openFileSelector = () => {
    if (images.length >= maxImages) {
      toast.error(`Ya tienes ${maxImages} imágenes. Elimina alguna para añadir más.`);
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      {/* Botón simple para subir */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Button
          type="button"
          onClick={openFileSelector}
          disabled={images.length >= maxImages}
          className="w-full h-12 bg-purple-600/20 hover:bg-purple-600/30 border-2 border-dashed border-purple-500/40 hover:border-purple-500/60 text-purple-300 hover:text-purple-200 transition-all duration-200"
        >
          <ImagePlus className="h-5 w-5 mr-2" />
          {images.length >= maxImages 
            ? `Límite alcanzado (${maxImages} imágenes)`
            : `Seleccionar imágenes (${images.length}/${maxImages})`
          }
        </Button>
        
        <p className="text-xs text-purple-400/60 text-center mt-2">
          También puedes pegar imágenes con <kbd className="px-1.5 py-0.5 bg-purple-500/20 rounded text-purple-300">Ctrl+V</kbd>
        </p>
      </div>

      {/* Grid de imágenes */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group aspect-square rounded-lg overflow-hidden bg-purple-900/20 border border-purple-500/30"
            >
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay con botón eliminar */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => removeImage(image.id)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Nombre de archivo */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-2 py-1">
                <p className="text-xs text-white truncate">
                  {image.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info adicional */}
      {images.length > 0 && (
        <div className="flex items-center justify-between text-xs text-purple-400/60 pt-2 border-t border-purple-500/20">
          <span>{images.length} imagen{images.length !== 1 ? 'es' : ''} seleccionada{images.length !== 1 ? 's' : ''}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              images.forEach(img => URL.revokeObjectURL(img.url));
              setImages([]);
              toast.info('Todas las imágenes eliminadas');
            }}
            className="h-6 text-xs text-red-400 hover:text-red-300"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Eliminar todas
          </Button>
        </div>
      )}
    </div>
  );
};
