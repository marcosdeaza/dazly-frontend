// src/components/ImageUploadArea_fixed.tsx - Versión corregida con upload al backend

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/store/authStore';

interface UploadedImage {
  id: string;
  file?: File;
  url: string;
  name: string;
  serverUrl?: string;
  uploaded?: boolean;
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
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { token } = useAuthStore();

  const uploadToServer = async (files: File[]): Promise<UploadedImage[]> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al subir imágenes al servidor');
      }

      const result = await response.json();
      
      if (result.success) {
        return result.images.map((img: any, index: number) => ({
          id: img.id,
          file: files[index],
          url: URL.createObjectURL(files[index]), // URL local para preview
          serverUrl: `${import.meta.env.VITE_API_URL}${img.url}`, // URL del servidor
          name: img.originalName.split('.')[0],
          uploaded: true
        }));
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error('Error uploading to server:', error);
      // Fallback: usar solo URLs locales
      return files.map((file, index) => ({
        id: `local_${Date.now()}_${index}`,
        file,
        url: URL.createObjectURL(file),
        name: file.name.split('.')[0],
        uploaded: false
      }));
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    
    try {
      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      
      if (imageFiles.length === 0) {
        toast({
          title: "Error",
          description: "Solo se permiten archivos de imagen",
          variant: "destructive"
        });
        return;
      }

      // Validar tamaño
      const oversizedFiles = imageFiles.filter(file => file.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        toast({
          title: "Error",
          description: "Algunas imágenes son demasiado grandes (máx 10MB)",
          variant: "destructive"
        });
        return;
      }

      console.log(`📤 Uploading ${imageFiles.length} image(s) to server...`);
      
      // Subir al servidor
      const newImages = await uploadToServer(imageFiles);
      
      // Actualizar estado
      onImagesChange([...uploadedImages, ...newImages]);
      
      const uploadedCount = newImages.filter(img => img.uploaded).length;
      const localCount = newImages.length - uploadedCount;
      
      toast({
        title: "Imágenes cargadas",
        description: uploadedCount > 0 
          ? `${uploadedCount} imagen(es) subida(s) al servidor${localCount > 0 ? ` y ${localCount} local(es)` : ''}`
          : `${localCount} imagen(es) cargada(s) localmente`
      });

    } catch (error) {
      console.error('Error en upload:', error);
      toast({
        title: "Error",
        description: "Error al procesar las imágenes",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (imageId: string) => {
    const imageToRemove = uploadedImages.find(img => img.id === imageId);
    
    // Limpiar URL del objeto si es local
    if (imageToRemove?.url.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.url);
    }

    const updatedImages = uploadedImages.filter(img => img.id !== imageId);
    onImagesChange(updatedImages);

    // TODO: Si la imagen está en el servidor, también eliminarla allí
    if (imageToRemove?.serverUrl) {
      // Llamar al endpoint DELETE (opcional)
      console.log('TODO: Delete from server:', imageToRemove.serverUrl);
    }
  };

  const insertImageReference = (image: UploadedImage, index: number) => {
    onImageInsert(index + 1);
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      {uploadedImages.length === 0 && !isUploading && (
        <div className="text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-purple-900/20 border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
          >
            <Upload className="h-4 w-4 mr-2" />
            Subir Imágenes
          </Button>
        </div>
      )}

      {/* Add More Button */}
      {uploadedImages.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-purple-300 font-light">
            {uploadedImages.length} imagen{uploadedImages.length !== 1 ? 'es' : ''} cargada{uploadedImages.length !== 1 ? 's' : ''}
            {uploadedImages.some(img => img.uploaded) && (
              <span className="text-green-400 ml-2">
                ({uploadedImages.filter(img => img.uploaded).length} en servidor)
              </span>
            )}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-1" />
            )}
            {isUploading ? 'Subiendo...' : 'Añadir más'}
          </Button>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="p-4 bg-purple-900/10 border border-purple-500/20 rounded-xl">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />
            <span className="text-purple-200 text-sm">Procesando imágenes...</span>
          </div>
        </div>
      )}

      {/* Images Grid */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {uploadedImages.map((image, index) => (
            <div
              key={image.id}
              className="relative group bg-purple-900/10 rounded-xl border border-purple-500/20 overflow-hidden hover:border-purple-400/40 transition-all duration-300"
            >
              {/* Status Badge */}
              <div className="absolute top-2 left-2 z-10 flex space-x-1">
                <div className="bg-purple-600/90 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {index + 1}
                </div>
                {image.uploaded && (
                  <div className="bg-green-600/90 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center" title="Subida al servidor">
                    ✓
                  </div>
                )}
              </div>

              {/* Image Preview */}
              <div className="aspect-square relative">
                <img
                  src={image.url}
                  alt={`imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* Hover Actions */}
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
                  <span className="text-xs text-purple-200 font-medium truncate">
                    {image.name}
                  </span>
                  <div className="flex items-center space-x-1">
                    {image.file && (
                      <span className="text-xs text-purple-400/60">
                        {(image.file.size / 1024).toFixed(1)}KB
                      </span>
                    )}
                    {image.uploaded && (
                      <span className="text-xs text-green-400">📤</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {uploadedImages.length === 0 && !isUploading && (
        <div 
          className="border-2 border-dashed border-purple-500/30 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-12 w-12 mx-auto text-purple-400/40 mb-3" />
          <p className="text-sm text-purple-300/60 mb-2">
            Arrastra imágenes aquí o haz clic para subir
          </p>
          <p className="text-xs text-purple-400/40">
            Formatos: JPG, PNG, WebP • Máx: 10MB • Se suben al servidor automáticamente
          </p>
        </div>
      )}
    </div>
  );
};