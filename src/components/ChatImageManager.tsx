// src/components/ChatImageManager.tsx - Gestor simple y directo de imágenes para el chat

import React, { useState, useCallback } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SimpleImageUploader } from './SimpleImageUploader';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store/userStore';

interface ImageData {
  id: string;
  file: File;
  url: string;
  name: string;
}

interface ChatImageManagerProps {
  onImagesChange: (images: ImageData[]) => void;
  className?: string;
  isVisible: boolean;
  onToggle: () => void;
  onClear?: () => void;
  existingImages?: ImageData[]; // ✨ Recibir imágenes desde ChatPage (Ctrl+V)
}

export const ChatImageManager = ({ 
  onImagesChange, 
  className,
  isVisible,
  onToggle,
  onClear,
  existingImages = []
}: ChatImageManagerProps) => {
  const { user } = useUserStore();

  // Verificar si es Plan Free
  const isFreeUser = user?.plan === 'free';

  // ✅ NO mantener estado local - usar directamente existingImages
  // Esto evita desincronización entre el estado padre y el componente

  // Manejar cambios en las imágenes
  const handleImagesChange = useCallback((newImages: ImageData[]) => {
    console.log('🔄 ChatImageManager: handleImagesChange llamado con', newImages.length, 'imágenes');
    onImagesChange(newImages);
  }, [onImagesChange]);

  // ✅ Eliminado - la limpieza se maneja desde el padre

  // Botón flotante
  const FloatingToggleButton = () => (
    <Button
      size="sm"
      variant="ghost"
      className={cn(
        "h-10 w-10 p-0 rounded-xl relative overflow-hidden",
        isFreeUser 
          ? "text-gray-400 cursor-default"
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
        {existingImages.length > 0 && (
          <div className="absolute -top-2 -right-2 h-5 w-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">
              {existingImages.length}
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
      {existingImages.length > 0 && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl" />
      )}
    </Button>
  );

  return (
    <>
      {/* Botón flotante para abrir/cerrar */}
      <FloatingToggleButton />
      
      {/* Panel desplegable simple */}
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
                      Imágenes
                    </h3>
                    <p className="text-xs text-purple-400/60">
                      Hasta 5 imágenes · Usa Ctrl+V para pegar
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
            
            {/* Contenido del uploader simple */}
            <div className="p-4">
              <SimpleImageUploader
                onImagesChange={handleImagesChange}
                maxImages={5}
                existingImages={existingImages}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};