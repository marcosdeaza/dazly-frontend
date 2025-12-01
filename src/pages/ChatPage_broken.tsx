// src/pages/ChatPage_renovado.tsx - Versión completamente renovada y limpia

import React, { useState, useRef, useEffect } from 'react';
import { Settings, User, CreditCard, History, FolderOpen, ChevronDown } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';
import { useProject } from '@/hooks/useProject';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/use-toast';
import { PLANS } from '@/types';
import { Sidebar } from '@/components/ChatSidebar';
import { AccountSettings } from '@/components/AccountSettings';
import { ProjectGallery } from '@/components/ProjectGallery';
import { useNavigate, Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { 
  SendIcon, 
  ImageIcon, 
  DownloadIcon, 
  SparkleIcon, 
  BoltIcon 
} from '@/components/icons/ChatIcon';
import { ChevronLeft, ChevronRight, Edit3, Check, X } from 'lucide-react';
import { 
  MarketingIcon, 
  InstagramIcon, 
  CreativeIcon, 
  UploadIcon, 
  EditIcon, 
  GalleryIcon 
} from '@/components/icons/StyleIcons';
import { ChatImageManager } from '@/components/ChatImageManager';
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

const ChatPage = () => {
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showProjectGallery, setShowProjectGallery] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [smartImages, setSmartImages] = useState<SmartImage[]>([]);
  const [showImageManager, setShowImageManager] = useState(false);
  const [clearImagesFlag, setClearImagesFlag] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [editingProjectName, setEditingProjectName] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { user, decrementImages } = useUserStore();
  const { logout, token } = useAuthStore();
  const { currentProject, addMessage, projects, setCurrentProject, createProject } = useProject();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentProject?.messages]);

  const handleSendMessage = async () => {
    const wordCount = message.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (!message.trim() || !user || !currentProject || wordCount > 2500) return;

    if (user.imagesRemaining <= 0) {
      toast({
        title: "Sin créditos disponibles",
        description: "Actualiza tu plan para generar más imágenes.",
        variant: "destructive"
      });
      return;
    }

    // Agregar mensaje del usuario con imágenes
    addMessage({
      role: 'user',
      content: message,
      images: smartImages.length > 0 ? smartImages : undefined
    });

    const currentMessage = message;
    setMessage('');
    setIsGenerating(true);
    
    // Limpiar imágenes después de enviar
    setClearImagesFlag(true);
    setTimeout(() => setClearImagesFlag(false), 100);
    setSmartImages([]);
    setShowImageManager(false);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          prompt: currentMessage,
          projectId: currentProject.id,
          imageUrl: selectedImage || undefined,
          uploadedImages: smartImages || []
        })
      });

      if (selectedImage) {
        setSelectedImage(null);
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al generar imagen');
      }

      const data = await response.json();
      
      if (data.success) {
        addMessage({
          role: 'assistant',
          content: data.aiMessage.content,
          imageUrl: data.imageUrl,
          imagePrompt: currentMessage
        });

        decrementImages();
        setIsGenerating(false);
      } else {
        throw new Error('Error en la respuesta del servidor');
      }

    } catch (error) {
      setIsGenerating(false);
      toast({
        title: "Error al generar imagen",
        description: "Inténtalo de nuevo en unos momentos.",
        variant: "destructive"
      });
    }
  };

  const currentPlan = PLANS.find(p => p.id === user?.plan) || PLANS[0];
  const projectImages = currentProject?.messages
    .filter(msg => msg.role === 'assistant' && msg.imageUrl)
    .map(msg => ({
      id: msg.id,
      url: msg.imageUrl!,
      prompt: msg.imagePrompt || msg.content,
      timestamp: msg.timestamp
    })) || [];

  const handleSmartImagesChange = (images: SmartImage[]) => {
    setSmartImages(images);
  };

  const handleEditImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setMessage(`Edita esta imagen para mejorar: `);
  };

  const handleUpdateProjectName = async () => {
    if (!newProjectName.trim() || !currentProject) return;
    
    try {
      // Actualizar proyecto en el hook
      const updatedProject = { ...currentProject, name: newProjectName.trim() };
      setCurrentProject(updatedProject);
      
      setEditingProjectName(false);
      setNewProjectName('');
      
      toast({
        title: "Proyecto actualizado",
        description: `Nombre cambiado a "${newProjectName.trim()}"`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el nombre del proyecto",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex overflow-hidden">
      {/* Sidebar siempre visible */}
      <div className="relative w-64 flex-shrink-0">
        <Sidebar />
        
        {/* Toggle elegante en el borde */}
        <div 
          onClick={() => setSidebarVisible(!sidebarVisible)}
          className="absolute top-1/2 -right-3 z-50 w-6 h-12 bg-gradient-to-r from-purple-600/20 to-transparent border-r border-purple-500/30 rounded-r-lg cursor-pointer group hover:from-purple-500/30 transition-all duration-300 flex items-center justify-center"
        >
          <div className={`w-1 h-6 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full transition-transform duration-300 ${sidebarVisible ? 'rotate-0' : 'rotate-180'}`} />
        </div>
        
        {/* Overlay cuando está oculto */}
        {!sidebarVisible && (
          <div className="absolute inset-0 bg-[#0a0a0a] transition-all duration-300" />
        )}
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Elegant Header */}
        <div className="h-20 border-b border-purple-500/20 flex items-center justify-between px-8 bg-gradient-to-r from-[#0a0a0a] to-[#1a0a1a] backdrop-blur-xl">
          <div className="flex items-center space-x-4">
            <img src={logo} alt="Dazly" className="h-8 w-auto" />
            <div className="h-6 w-px bg-purple-400/30" />
            <div>
              {editingProjectName ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="bg-purple-900/20 border border-purple-500/30 rounded px-2 py-1 text-sm text-purple-100 focus:border-purple-400/60 focus:outline-none"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateProjectName();
                      } else if (e.key === 'Escape') {
                        setEditingProjectName(false);
                        setNewProjectName('');
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleUpdateProjectName}
                    className="h-6 w-6 p-0 bg-green-600/20 hover:bg-green-500/30"
                  >
                    <Check className="h-3 w-3 text-green-400" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingProjectName(false);
                      setNewProjectName('');
                    }}
                    className="h-6 w-6 p-0 bg-red-600/20 hover:bg-red-500/30"
                  >
                    <X className="h-3 w-3 text-red-400" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 group">
                  <h1 className="text-lg font-light text-purple-100">
                    {currentProject?.name || 'Nuevo Proyecto'}
                  </h1>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingProjectName(true);
                      setNewProjectName(currentProject?.name || '');
                    }}
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-purple-600/20 hover:bg-purple-500/30"
                  >
                    <Edit3 className="h-3 w-3 text-purple-400" />
                  </Button>
                </div>
              )}
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                <span className="text-xs text-purple-300 font-light">{currentPlan.name}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Project Gallery Button */}
            {projectImages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProjectGallery(true)}
                className="flex items-center space-x-2 text-purple-300 hover:text-white hover:bg-purple-500/10 transition-all"
              >
                <GalleryIcon size={16} />
                <span className="text-sm font-light">{projectImages.length}</span>
              </Button>
            )}

            
            {/* Minimalist Account Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2 rounded-full hover:bg-purple-500/10 transition-all duration-300">
                  <Avatar className="h-8 w-8 ring-1 ring-purple-400/30 hover:ring-purple-400/60 transition-all duration-300">
                    <AvatarImage src="" alt={user?.email} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-light text-sm">
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-[#0a0a0a] border-purple-500/20 backdrop-blur-xl">
                <div className="space-y-6">
                  <div className="text-center pt-6">
                    <Avatar className="h-20 w-20 mx-auto mb-4 ring-2 ring-purple-400/30">
                      <AvatarImage src="" alt={user?.email} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xl font-light">
                        {user?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-light text-purple-100">{user?.email}</h3>
                    <Badge className="mt-2 bg-purple-500/20 text-purple-200 border-purple-400/30">
                      {currentPlan.name}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-purple-200 hover:text-white hover:bg-purple-500/10 transition-all" 
                      onClick={() => setShowAccountSettings(true)}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Configuración
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-purple-200 hover:text-white hover:bg-purple-500/10 transition-all" 
                      onClick={() => navigate('/plans')}
                    >
                      <CreditCard className="h-4 w-4 mr-3" />
                      Cambiar Plan
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-purple-200 hover:text-white hover:bg-purple-500/10 transition-all" 
                      onClick={() => navigate('/account')}
                    >
                      <History className="h-4 w-4 mr-3" />
                      Mi Cuenta
                    </Button>
                    <div className="border-t border-purple-500/20 pt-2 mt-4">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-all" 
                        onClick={logout}
                      >
                        <User className="h-4 w-4 mr-3" />
                        Cerrar Sesión
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Messages Area - Limpio y Espacioso */}
        <ScrollArea className="flex-1 px-6 py-6 relative">
          <div className="max-w-5xl mx-auto space-y-8">
            {!currentProject?.messages?.length ? (
              <div className="flex items-center justify-center min-h-[calc(100vh-180px)]">
                <div className="text-center max-w-3xl w-full">
                  <div className="mb-12 flex items-center justify-center">
                    <img src={logo} alt="Dazly" className="h-28 w-auto opacity-90" />
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      {
                        icon: MarketingIcon,
                        text: 'Banner publicitario moderno con CTA impactante para campaña digital',
                        category: 'Marketing'
                      },
                      {
                        icon: InstagramIcon,
                        text: 'Story de Instagram con diseño minimalista y tipografía elegante',
                        category: 'Social Media'
                      },
                      {
                        icon: CreativeIcon,
                        text: 'Ilustración artística profesional con paleta de colores vibrante',
                        category: 'Diseño'
                      }
                    ].map((prompt, idx) => (
                      <div 
                        key={idx}
                        className="group cursor-pointer p-6 rounded-2xl bg-gradient-to-br from-purple-900/5 to-pink-900/5 border border-purple-500/10 hover:border-purple-400/30 hover:from-purple-900/10 hover:to-pink-900/10 transition-all duration-300 hover:scale-[1.02]"
                        onClick={() => setMessage(prompt.text)}
                      >
                        <div className="flex flex-col items-center text-center space-y-4">
                          <div className="p-3 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                            <prompt.icon className="text-purple-400 group-hover:text-purple-300 transition-colors" size={24} />
                          </div>
                          <div>
                            <div className="text-xs text-purple-400/60 font-medium mb-2 uppercase tracking-wide">{prompt.category}</div>
                            <p className="text-sm text-purple-200 group-hover:text-white transition-colors leading-relaxed font-light">
                              {prompt.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {currentProject.messages.map((msg, index) => (
                  <div key={msg.id || index} className="w-full">
                    
                    {/* Mensaje del Usuario - Estilo ChatGPT */}
                    {msg.role === 'user' && (
                      <div className="w-full mb-8 flex justify-end">
                        <div className="max-w-[85%] bg-gradient-to-br from-blue-600/90 to-purple-600/90 rounded-3xl rounded-br-lg px-5 py-3 shadow-lg backdrop-blur-sm">
                          <p className="text-white font-medium leading-relaxed break-words whitespace-pre-wrap">
                            {msg.content}
                          </p>
                          
                          {/* Imágenes adjuntas del usuario */}
                          {msg.images && msg.images.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mt-3">
                              {msg.images.slice(0, 4).map((image, idx) => (
                                <div key={image.id} className="relative group">
                                  <img
                                    src={image.preview || image.url}
                                    alt={image.name}
                                    className="w-full h-20 rounded-xl object-cover"
                                  />
                                </div>
                              ))}
                              {msg.images.length > 4 && (
                                <div className="flex items-center justify-center bg-black/20 rounded-xl h-20">
                                  <span className="text-white/80 text-sm">+{msg.images.length - 4}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Respuesta de la IA - Estilo Gemini/ChatGPT */}
                    {msg.role === 'assistant' && (
                      <div className="w-full mb-8">
                        <div className="max-w-[95%] space-y-4">
                          {msg.content && (
                            <p className="text-white/90 font-light leading-relaxed break-words whitespace-pre-wrap">
                              {msg.content}
                            </p>
                          )}

                          {msg.imageUrl && (
                            <div className="relative group max-w-md">
                              <img 
                                src={msg.imageUrl} 
                                alt="Generated" 
                                className="w-full rounded-2xl shadow-xl"
                              />
                              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                  size="sm" 
                                  onClick={() => window.open(msg.imageUrl, '_blank')}
                                  className="h-8 w-8 p-0 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full"
                                >
                                  <DownloadIcon size={14} />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {isGenerating && (
              <div className="w-full mb-8">
                <div className="max-w-[95%] space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin h-4 w-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full" />
                    <p className="text-white/70 font-light">Creando tu imagen...</p>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area Limpio */}
        <div className="border-t border-purple-500/20 bg-[#0a0a0a]/95 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-6 py-4">
            {/* Credits Warning */}
            {(user?.imagesRemaining || 0) <= 0 && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
                <p className="text-sm text-red-300">
                  Sin créditos disponibles.
                  <Button 
                    variant="link" 
                    className="p-0 ml-2 h-auto text-red-200 underline"
                    onClick={() => navigate('/plans')}
                  >
                    Actualizar plan
                  </Button>
                </p>
              </div>
            )}

            <div className="flex items-end space-x-3">
              {/* Input Principal */}
              <div className="flex-1">
                {/* Preview de imágenes */}
                {smartImages.length > 0 && message.trim() && (
                  <div className="mb-3 p-3 bg-purple-900/10 rounded-xl border border-purple-500/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <ImageIcon className="h-3 w-3 text-purple-400" />
                      <span className="text-xs text-purple-300/80">
                        Se incluirán {smartImages.length} imagen{smartImages.length > 1 ? 'es' : ''}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {smartImages.slice(0, 4).map((image, idx) => (
                        <img
                          key={image.id}
                          src={image.preview || image.url}
                          alt={image.name}
                          className="w-8 h-8 rounded object-cover border border-purple-500/20"
                        />
                      ))}
                      {smartImages.length > 4 && (
                        <div className="w-8 h-8 rounded bg-purple-600/20 flex items-center justify-center border border-purple-500/20">
                          <span className="text-xs text-purple-300">+{smartImages.length - 4}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe lo que quieres crear..."
                    className="w-full bg-purple-900/10 border border-purple-500/30 text-white placeholder-purple-300/40 pr-16 py-3 px-4 rounded-2xl backdrop-blur-sm focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 resize-none min-h-[48px] max-h-32 break-words whitespace-pre-wrap"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={isGenerating || (user?.imagesRemaining || 0) <= 0}
                    style={{ 
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'pre-wrap'
                    }}
                  />
                  
                  {/* Gestor de imágenes */}
                  <div className="absolute right-3 top-3">
                    <ChatImageManager
                      onImagesChange={handleSmartImagesChange}
                      isVisible={showImageManager}
                      onToggle={() => setShowImageManager(!showImageManager)}
                      clearImages={clearImagesFlag}
                    />
                  </div>
                </div>
                
                {/* Contador discreto */}
                <div className="flex justify-between items-center mt-2 px-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-purple-400/40">
                      {message.trim().split(/\s+/).filter(word => word.length > 0).length}/2500 palabras
                    </span>
                    {smartImages.length > 0 && (
                      <span className="text-xs text-purple-400/40">
                        {smartImages.length} imagen{smartImages.length !== 1 ? 'es' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botón de envío */}
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || isGenerating || (user?.imagesRemaining || 0) <= 0 || message.trim().split(/\s+/).filter(word => word.length > 0).length > 2500}
                className="h-10 w-10 p-0 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/20 hover:scale-105 active:scale-95"
              >
                {isGenerating ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <SendIcon className="text-white" size={16} />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {showAccountSettings && (
        <AccountSettings onClose={() => setShowAccountSettings(false)} />
      )}

      {showProjectGallery && (
        <ProjectGallery
          isOpen={showProjectGallery}
          onClose={() => setShowProjectGallery(false)}
          images={projectImages}
          projectName={currentProject?.name || 'Proyecto'}
          onEditImage={handleEditImage}
        />
      )}
    </div>
  );
};

export default ChatPage;