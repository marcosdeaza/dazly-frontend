<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
// src/components/ChatImageManager.tsx - Gestor simple y directo de imágenes para el chat

import React, { useState, useCallback } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SimpleImageUploader } from './SimpleImageUploader';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store/userStore';

interface ImageData {
<<<<<<< HEAD
=======
// src/components/ChatImageManager.tsx - Gestor inteligente de imágenes para el chat

import React, { useState, useCallback, useEffect } from 'react';
import { Image as ImageIcon, Upload, Wand2, X, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SmartImageUploader } from './SmartImageUploader';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store/userStore';

interface SmartImage {
>>>>>>> db4ceb629c696e3718439846957596f2f57c766f
=======
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
  id: string;
  file: File;
  url: string;
  name: string;
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
}

interface ChatImageManagerProps {
  onImagesChange: (images: ImageData[]) => void;
  className?: string;
  isVisible: boolean;
  onToggle: () => void;
  onClear?: () => void;
  existingImages?: ImageData[]; // ✨ Recibir imágenes desde ChatPage (Ctrl+V)
<<<<<<< HEAD
=======
  size: number;
  type: string;
  preview?: string;
}

interface ChatImageManagerProps {
  onImagesChange: (images: SmartImage[]) => void;
  className?: string;
  isVisible: boolean;
  onToggle: () => void;
  onClear?: () => void; // ✅ Nueva prop para limpiar desde afuera
>>>>>>> db4ceb629c696e3718439846957596f2f57c766f
=======
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
}

export const ChatImageManager = ({ 
  onImagesChange, 
  className,
  isVisible,
  onToggle,
<<<<<<< HEAD
<<<<<<< HEAD
  onClear,
  existingImages = []
}: ChatImageManagerProps) => {
=======
  onClear
}: ChatImageManagerProps) => {
  const [images, setImages] = useState<SmartImage[]>([]);
>>>>>>> db4ceb629c696e3718439846957596f2f57c766f
=======
  onClear,
  existingImages = []
}: ChatImageManagerProps) => {
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
  const { user } = useUserStore();

  // Verificar si es Plan Free
  const isFreeUser = user?.plan === 'free';

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
  // ✅ NO mantener estado local - usar directamente existingImages
  // Esto evita desincronización entre el estado padre y el componente

  // Manejar cambios en las imágenes
  const handleImagesChange = useCallback((newImages: ImageData[]) => {
    console.log('🔄 ChatImageManager: handleImagesChange llamado con', newImages.length, 'imágenes');
    onImagesChange(newImages);
  }, [onImagesChange]);

  // ✅ Eliminado - la limpieza se maneja desde el padre

  // Botón flotante
<<<<<<< HEAD
=======
  // LÓGICA MEJORADA: Mantener imágenes hasta que se envíe mensaje
  const handleImagesReady = useCallback((newImages: SmartImage[]) => {
    console.log('📸 ChatImageManager: Imágenes actualizadas:', newImages.length);
    setImages(newImages);
    onImagesChange(newImages);
  }, [onImagesChange]);

  // Las imágenes SIEMPRE persisten cuando se cierra el panel
  React.useEffect(() => {
    if (!isVisible && images.length > 0) {
      console.log('👁️ Panel cerrado - Las imágenes SE MANTIENEN:', images.length);
      // NO hacer nada - las imágenes persisten hasta que se envíe el mensaje
    }
  }, [isVisible, images.length]);

  // Botón flotante apagado para Plan Free (sin efectos)
>>>>>>> db4ceb629c696e3718439846957596f2f57c766f
=======
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
  const FloatingToggleButton = () => (
    <Button
      size="sm"
      variant="ghost"
      className={cn(
        "h-10 w-10 p-0 rounded-xl relative overflow-hidden",
        isFreeUser 
<<<<<<< HEAD
<<<<<<< HEAD
          ? "text-gray-400 cursor-default"
=======
          ? "text-gray-400 cursor-default" // Solo apagado, sin background ni efectos
>>>>>>> db4ceb629c696e3718439846957596f2f57c766f
=======
          ? "text-gray-400 cursor-default"
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
          : cn(
              "transition-all duration-300 hover:bg-purple-500/20 hover:scale-110 active:scale-95",
              isVisible 
                ? "bg-purple-600/20 border border-purple-500/40 text-purple-300" 
                : "text-purple-400 hover:text-purple-300"
            )
      )}
      onClick={isFreeUser ? undefined : onToggle}
      title={isFreeUser ? "Plan Free - Actualiza para usar" : (isVisible ? "Cerrar gestor de imágenes" : "Abrir gestor de imágenes")}
    >
      <div className="relative">
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
        {existingImages.length > 0 && (
          <div className="absolute -top-2 -right-2 h-5 w-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">
              {existingImages.length}
<<<<<<< HEAD
=======
        {images.length > 0 && (
          <div className="absolute -top-2 -right-2 h-5 w-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">
              {images.length}
>>>>>>> db4ceb629c696e3718439846957596f2f57c766f
=======
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
            </span>
          </div>
        )}
        
        {isVisible ? (
          <X className="h-4 w-4 transition-transform duration-200" />
        ) : (
          <ImageIcon className="h-4 w-4 transition-transform duration-200" />
        )}
      </div>
      
      {/* Efecto de brillo cuando hay imágenes */}
<<<<<<< HEAD
<<<<<<< HEAD
      {existingImages.length > 0 && (
=======
      {images.length > 0 && (
>>>>>>> db4ceb629c696e3718439846957596f2f57c766f
=======
      {existingImages.length > 0 && (
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl" />
      )}
    </Button>
  );

  return (
    <>
      {/* Botón flotante para abrir/cerrar */}
      <FloatingToggleButton />
      
<<<<<<< HEAD
<<<<<<< HEAD
      {/* Panel desplegable simple */}
=======
      {/* Panel desplegable del uploader */}
>>>>>>> db4ceb629c696e3718439846957596f2f57c766f
=======
      {/* Panel desplegable simple */}
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
      {isVisible && (
        <div className={cn(
          "fixed bottom-24 right-8 z-50 w-96 max-w-[90vw] p-1",
          "animate-in slide-in-from-bottom-2 duration-300",
          className
        )}>
          <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-500/10 overflow-hidden">
            {/* Header del panel */}
            <div className="p-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-600/20 rounded-lg">
                    <ImageIcon className="h-4 w-4 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-purple-100">
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
                      Imágenes
                    </h3>
                    <p className="text-xs text-purple-400/60">
                      Hasta 5 imágenes · Usa Ctrl+V para pegar
<<<<<<< HEAD
=======
                      Gestor de Imágenes
                    </h3>
                    <p className="text-xs text-purple-400/60">
                      Sube hasta 5 imágenes para usar en el chat
>>>>>>> db4ceb629c696e3718439846957596f2f57c766f
=======
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="h-8 w-8 p-0 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
            {/* Contenido del uploader simple */}
            <div className="p-4">
              <SimpleImageUploader
                onImagesChange={handleImagesChange}
                maxImages={5}
                existingImages={existingImages}
              />
            </div>
<<<<<<< HEAD
=======
            {/* Contenido del uploader */}
            <div className="p-4">
              <SmartImageUploader
                onImagesReady={handleImagesReady}
                maxImages={5}
                persistentImages={images}
              />
            </div>
            
            {/* Footer minimalista */}
            {images.length > 0 && (
              <div className="px-4 pb-3">
                <div className="text-center">
                  <p className="text-xs text-purple-300/60">
                    {images.length} imagen{images.length > 1 ? 'es' : ''} lista{images.length > 1 ? 's' : ''} para usar
                  </p>
                </div>
              </div>
            )}
>>>>>>> db4ceb629c696e3718439846957596f2f57c766f
=======
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
          </div>
        </div>
      )}
    </>
  );
};