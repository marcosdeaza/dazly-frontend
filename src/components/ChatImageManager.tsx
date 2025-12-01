// src/components/ChatImageManager.tsx - Gestor inteligente de imágenes para el chat

import React, { useState, useCallback, useEffect } from 'react';
import { Image as ImageIcon, Upload, Wand2, X, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SmartImageUploader } from './SmartImageUploader';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store/userStore';

interface SmartImage {
  id: string;
  file: File;
  url: string;
  name: string;
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
}

export const ChatImageManager = ({ 
  onImagesChange, 
  className,
  isVisible,
  onToggle,
  onClear
}: ChatImageManagerProps) => {
  const [images, setImages] = useState<SmartImage[]>([]);
  const { user } = useUserStore();

  // Verificar si es Plan Free
  const isFreeUser = user?.plan === 'free';

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
  const FloatingToggleButton = () => (
    <Button
      size="sm"
      variant="ghost"
      className={cn(
        "h-10 w-10 p-0 rounded-xl relative overflow-hidden",
        isFreeUser 
          ? "text-gray-400 cursor-default" // Solo apagado, sin background ni efectos
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
        {images.length > 0 && (
          <div className="absolute -top-2 -right-2 h-5 w-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">
              {images.length}
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
      {images.length > 0 && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl" />
      )}
    </Button>
  );

  return (
    <>
      {/* Botón flotante para abrir/cerrar */}
      <FloatingToggleButton />
      
      {/* Panel desplegable del uploader */}
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
                      Gestor de Imágenes
                    </h3>
                    <p className="text-xs text-purple-400/60">
                      Sube hasta 5 imágenes para usar en el chat
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
          </div>
        </div>
      )}
    </>
  );
};