// src/components/ProjectGallery.tsx

import React, { useState } from 'react';
import { X, Download, Edit, Copy, Trash2, ZoomIn, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProjectImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
}

interface ProjectGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  images: ProjectImage[];
  projectName: string;
  onEditImage: (imageUrl: string) => void;
}

export const ProjectGallery = ({ 
  isOpen, 
  onClose, 
  images, 
  projectName, 
  onEditImage 
}: ProjectGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<ProjectImage | null>(null);
  const { toast } = useToast();

  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dazly-${prompt.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Descarga iniciada",
        description: "La imagen se está descargando..."
      });
    } catch (error) {
      toast({
        title: "Error al descargar",
        description: "No se pudo descargar la imagen",
        variant: "destructive"
      });
    }
  };

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Prompt copiado",
      description: "El prompt se ha copiado al portapapeles"
    });
  };

  const handleEdit = (imageUrl: string) => {
    onEditImage(imageUrl);
    onClose();
  };

  return (
    <>
      {/* Main Gallery Modal */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-[#0a0a0a] border-purple-500/20 max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-lg font-light text-purple-100">Galería</span>
                <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30">
                  {projectName}
                </Badge>
                <Badge variant="outline" className="text-purple-300 border-purple-500/30">
                  {images.length} imagen{images.length !== 1 ? 'es' : ''}
                </Badge>
              </div>
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh]">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group relative bg-purple-900/10 rounded-xl border border-purple-500/20 overflow-hidden hover:border-purple-400/40 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.prompt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => setSelectedImage(image)}
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedImage(image)}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                      >
                        <ZoomIn className="h-4 w-4 text-white" />
                      </Button>
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownload(image.url, image.prompt)}
                        className="h-7 w-7 p-0 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full"
                      >
                        <Download className="h-3 w-3 text-white" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(image.url)}
                        className="h-7 w-7 p-0 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full"
                      >
                        <Edit className="h-3 w-3 text-white" />
                      </Button>
                    </div>
                  </div>

                  {/* Image Info */}
                  <div className="p-3">
                    <p className="text-xs text-purple-200 line-clamp-2 mb-2 leading-relaxed">
                      {image.prompt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-purple-400/60">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">
                          {new Date(image.timestamp).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit'
                          })}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyPrompt(image.prompt)}
                        className="h-6 w-6 p-0 hover:bg-purple-500/20"
                      >
                        <Copy className="h-3 w-3 text-purple-400" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {images.length === 0 && (
            <div className="text-center py-12">
              <div className="text-purple-400/40 mb-2">🎨</div>
              <p className="text-purple-300/60">No hay imágenes en este proyecto aún</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Detail Modal */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="bg-[#0a0a0a] border-purple-500/20 max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span className="text-lg font-light text-purple-100">Vista Detallada</span>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(selectedImage.url, selectedImage.prompt)}
                    className="border-purple-500/30 text-purple-200 hover:bg-purple-500/10"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleEdit(selectedImage.url)}
                    className="bg-purple-600/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Large Image */}
              <div className="relative rounded-xl overflow-hidden border border-purple-500/20">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.prompt}
                  className="w-full h-auto max-h-[60vh] object-contain bg-gray-900"
                />
              </div>

              {/* Image Details */}
              <div className="bg-purple-900/10 rounded-xl p-4 border border-purple-500/20">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-sm font-medium text-purple-200">Prompt Original</h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyPrompt(selectedImage.prompt)}
                    className="h-6 w-6 p-0 hover:bg-purple-500/20"
                  >
                    <Copy className="h-3 w-3 text-purple-400" />
                  </Button>
                </div>
                <p className="text-purple-100/80 leading-relaxed mb-3">
                  {selectedImage.prompt}
                </p>
                <div className="flex items-center space-x-4 text-xs text-purple-400/60">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(selectedImage.timestamp).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};