// src/components/SmartImageUploader.tsx - Nueva implementación inteligente y estética

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Plus, Wand2, Eye, Trash2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface SmartImage {
  id: string;
  file: File;
  url: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

interface SmartImageUploaderProps {
  onImagesReady: (images: SmartImage[]) => void;
  maxImages?: number;
  className?: string;
  persistentImages?: SmartImage[];
}

export const SmartImageUploader = ({ 
  onImagesReady, 
  maxImages = 5,
  className,
  persistentImages = []
}: SmartImageUploaderProps) => {
  const [images, setImages] = useState<SmartImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // ✅ SINCRONIZAR: Cuando persistentImages se vacía desde afuera, limpiar completamente
  React.useEffect(() => {
    if (persistentImages.length === 0 && images.length > 0) {
      console.log('🧹 persistentImages vacío - Limpiando images local completamente');
      setImages([]);
      setIsProcessing(false);
      // Resetear estado interno completamente
    } else if (persistentImages.length > 0 && images.length === 0) {
      console.log('🔄 Sincronizando con persistentImages:', persistentImages.length);
      setImages(persistentImages);
    }
  }, [persistentImages.length]); // Solo dependencia de length para evitar loops

  // NOTIFICAR CAMBIOS AL PADRE
  React.useEffect(() => {
    onImagesReady(images);
  }, [images, onImagesReady]);

  const processFiles = useCallback(async (files: FileList) => {
    // Filtrar solo archivos de imagen válidos primero
    const validFiles = Array.from(files).filter(file => {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      return allowedTypes.includes(file.type.toLowerCase()) && file.size <= 10 * 1024 * 1024;
    });

    if (validFiles.length + images.length > maxImages) {
      return; // Ignorar silenciosamente si excede límite
    }

    setIsProcessing(true);
    const newImages: SmartImage[] = [];

    for (const file of validFiles) {

      try {
        const imageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const smartImage: SmartImage = {
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          file,
          url: imageUrl,
          name: file.name.split('.')[0],
          size: file.size,
          type: file.type,
          preview: imageUrl
        };

        newImages.push(smartImage);
      } catch (error) {
        console.error('Error processing file:', error);
        // Silencioso - no mostrar toast por errores de procesamiento
      }
    }

    if (newImages.length > 0) {
      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onImagesReady(updatedImages);
      // Sin toast - funcionamiento silencioso
    }

    setIsProcessing(false);
  }, [images, maxImages, onImagesReady, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      processFiles(files);
    }
  }, [processFiles]);

  const removeImage = useCallback((imageId: string) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    setImages(updatedImages);
    onImagesReady(updatedImages);
    // Sin toast - eliminación silenciosa
  }, [images, onImagesReady]);

  const clearAll = useCallback(() => {
    console.log('🧹 FORZANDO LIMPIEZA TOTAL DEL UPLOADER');
    setImages([]);
    onImagesReady([]);
    console.log('✅ Uploader completamente limpio');
  }, [onImagesReady]);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Estado vacío - Zona de drop elegante
  if (images.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <div
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300",
            "hover:border-purple-400/60 hover:bg-purple-500/5",
            isDragging 
              ? "border-purple-400 bg-purple-500/10 scale-[1.02]" 
              : "border-purple-500/30 bg-purple-900/10"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
          
          {isProcessing ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative flex items-center justify-center">
                {/* Spinner limpio y minimalista */}
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-500/20 border-t-purple-400"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse">
                    <ImageIcon className="h-6 w-6 text-purple-300" />
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-purple-200 font-light text-sm">Procesando imágenes</p>
                <div className="flex items-center justify-center space-x-1 mt-1">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          ) : isDragging ? (
            <div className="flex flex-col items-center space-y-4">
              <Upload className="h-12 w-12 text-purple-300 animate-bounce" />
              <p className="text-purple-100 font-medium">¡Suelta las imágenes aquí!</p>
              <p className="text-sm text-purple-300/80">Máximo {maxImages} imágenes</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <ImageIcon className="h-12 w-12 text-purple-400/60" />
                <div className="absolute -top-1 -right-1">
                  <Plus className="h-5 w-5 text-purple-300 bg-purple-900/50 rounded-full p-1" />
                </div>
              </div>
              <div>
                <p className="text-purple-100 font-light mb-2">
                  Arrastra imágenes aquí o haz clic para subir
                </p>
                <p className="text-xs text-purple-400/60 leading-relaxed">
                  Formatos: JPG, PNG, WebP • Máx: 10MB por imagen • Hasta {maxImages} imágenes
                </p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="mt-4 bg-purple-600/20 border-purple-500/40 text-purple-200 hover:bg-purple-500/30 hover:border-purple-400/60 transition-all"
              >
                <Upload className="h-4 w-4 mr-2" />
                Seleccionar archivos
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Estado con imágenes - Grid inteligente
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <ImageIcon className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-purple-200 font-medium">
              {images.length} imagen{images.length !== 1 ? 'es' : ''}
            </span>
          </div>
          
          {images.length < maxImages && (
            <Button
              variant="ghost"
              size="sm"
              onClick={openFileDialog}
              className="h-7 px-3 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 transition-all"
              disabled={isProcessing}
            >
              <Plus className="h-3 w-3 mr-1" />
              Añadir más
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-7 px-3 text-red-400/80 hover:text-red-300 hover:bg-red-500/20 transition-all"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Limpiar
          </Button>
        </div>
      </div>

      {/* Grid de imágenes inteligente */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="relative group bg-purple-900/20 rounded-xl border border-purple-500/30 overflow-hidden hover:border-purple-400/50 transition-all duration-300"
          >

            {/* Vista previa de imagen */}
            <div className="aspect-square relative overflow-hidden">
              <img
                src={image.preview || image.url}
                alt={image.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              
              {/* Overlay con acciones */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                <div className="flex space-x-3">
                  <Button
                    size="sm"
                    onClick={() => window.open(image.url, '_blank')}
                    className="h-9 w-9 p-0 bg-purple-600/80 hover:bg-purple-500/90 rounded-full backdrop-blur-sm"
                    title="Ver imagen completa"
                  >
                    <Eye className="h-4 w-4 text-white" />
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => removeImage(image.id)}
                    className="h-9 w-9 p-0 bg-red-600/80 hover:bg-red-500/90 rounded-full backdrop-blur-sm"
                    title="Eliminar imagen"
                  >
                    <X className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Info de la imagen */}
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-purple-200 font-medium truncate">
                  {image.name}
                </span>
                <span className="text-xs text-purple-400/60">
                  {(image.size / 1024).toFixed(1)}KB
                </span>
              </div>
              
            </div>
          </div>
        ))}

        {/* Botón para añadir más (si hay espacio) */}
        {images.length < maxImages && (
          <div
            className="aspect-square border-2 border-dashed border-purple-500/30 rounded-xl flex items-center justify-center cursor-pointer hover:border-purple-400/50 hover:bg-purple-500/5 transition-all duration-300 group"
            onClick={openFileDialog}
          >
            <div className="flex flex-col items-center space-y-2">
              <Plus className="h-8 w-8 text-purple-400/60 group-hover:text-purple-300 transition-colors" />
              <span className="text-xs text-purple-400/60 group-hover:text-purple-300 transition-colors">
                Añadir más
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInput}
        className="hidden"
      />

    </div>
  );
};