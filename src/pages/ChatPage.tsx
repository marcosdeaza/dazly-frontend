// src/pages/ChatPage.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Settings, User, CreditCard, History, Eye, X, ArrowDown } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';
import { useProject } from '@/hooks/useProject';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/use-toast';
import { toast as sonnerToast } from 'sonner';
import { PLANS } from '@/types';
import { Sidebar } from '@/components/ChatSidebar';
import { AccountSettings } from '@/components/AccountSettings';
import { ProjectGallery } from '@/components/ProjectGallery';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { 
  SendIcon, 
  ImageIcon, 
  DownloadIcon, 
  SparkleIcon, 
  BoltIcon 
} from '@/components/icons/ChatIcon';
import { 
  MarketingIcon, 
  InstagramIcon, 
  CreativeIcon, 
  UploadIcon, 
  EditIcon, 
  GalleryIcon 
} from '@/components/icons/StyleIcons';
import { ChatImageManager } from '@/components/ChatImageManager';
import { MarkdownMessage } from '@/components/MarkdownMessage';

interface SmartImage {
  id: string;
  file: File;
  url: string;
  name: string;
}

const ChatPage = () => {
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null); // ✨ NUEVO: Control de cancelación
  const [generatingInProjectId, setGeneratingInProjectId] = useState<string | null>(null); // ✨ Nuevo: rastrear EN QUÉ proyecto se está generando
  const [projectsWithNewMessages, setProjectsWithNewMessages] = useState<string[]>([]); // ✨ Proyectos con mensajes nuevos
  const [showScrollButton, setShowScrollButton] = useState(false); // ✨ Mostrar botón de scroll
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showProjectGallery, setShowProjectGallery] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [smartImages, setSmartImages] = useState<SmartImage[]>([]);
  const [showImageManager, setShowImageManager] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  // Usar sonnerToast como 'toast' para consistencia (más bonito)
  const toastFn = sonnerToast;
  const navigate = useNavigate();
  
  const { user, updateCreditsFromServer, projects, updateProject } = useUserStore();
  const { logout, token } = useAuthStore();
  const { currentProject, addMessage, updateCurrentProject, setCurrentProject, createProject, isLoadingProjects } = useProject();
  
  // ✨ Limpiar notificación cuando entras a un proyecto
  useEffect(() => {
    if (currentProject?.id) {
      setProjectsWithNewMessages(prev => prev.filter(id => id !== currentProject.id));
    }
  }, [currentProject?.id]);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  // Auto-scroll cuando hay mensajes nuevos
  useEffect(() => {
    scrollToBottom(true);
  }, [currentProject?.messages]);

  // Auto-scroll al final al cargar/cambiar proyecto (sin animación)
  useEffect(() => {
    scrollToBottom(false);
  }, [currentProject?.id]);

  // Detectar scroll para mostrar/ocultar botón
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messagesContainerRef.current]);

  // ✨ NUEVO: Manejar Ctrl+V globalmente para pegar imágenes
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      console.log('📋 Evento paste detectado');
      
      // Solo procesar si no es un input/textarea (excepto nuestro textarea de mensaje)
      const target = e.target as HTMLElement;
      const isOurTextarea = target === textareaRef.current;
      const isInputOrTextarea = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      
      // Si es otro input/textarea (no el nuestro), no procesar
      if (isInputOrTextarea && !isOurTextarea) {
        console.log('📋 Ignorando paste en otro input/textarea');
        return;
      }
      
      const items = e.clipboardData?.items;
      
      if (!items) {
        console.log('📋 No hay items en clipboard');
        return;
      }

      const imageFiles: File[] = [];
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            console.log(`📋 Imagen encontrada: ${file.name}, size=${file.size}`);
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        console.log(`📋 Total imágenes encontradas: ${imageFiles.length}`);
        e.preventDefault();
        
        // ✅ NO abrir el panel automáticamente - solo agregar las imágenes
        // El usuario puede abrir el panel manualmente si quiere ver las imágenes
        
        // Usar callback para obtener el valor más reciente de smartImages
        setSmartImages(currentImages => {
          console.log(`📋 smartImages actuales: ${currentImages.length}`);
          
          const remainingSlots = 5 - currentImages.length;
          console.log(`📋 Slots disponibles: ${remainingSlots}`);
          
          if (remainingSlots <= 0) {
            sonnerToast.error('Ya tienes 5 imágenes', {
              description: 'Elimina alguna para añadir más',
              duration: 3000
            });
            return currentImages; // No cambiar
          }

          // Procesar archivos
          const filesToAdd = imageFiles.slice(0, remainingSlots);
          const newImages: SmartImage[] = [];
          
          for (const file of filesToAdd) {
            // Validar tipo
            if (!file.type.startsWith('image/')) continue;
            
            // Validar tamaño (10MB)
            if (file.size > 10 * 1024 * 1024) {
              sonnerToast.error('Imagen muy grande', {
                description: 'Las imágenes no deben superar 10MB',
                duration: 3000
              });
              continue;
            }

            newImages.push({
              id: `${Date.now()}-${Math.random()}`,
              file,
              url: URL.createObjectURL(file),
              name: file.name
            });
          }

          if (newImages.length > 0) {
            console.log(`📋 Agregando ${newImages.length} imágenes`);
            const updated = [...currentImages, ...newImages];
            console.log('📸 smartImages actualizadas:', updated.length);
            
            // ✅ SIN NOTIFICACIÓN - Pegado silencioso
            
            return updated;
          } else {
            console.log('📋 No se procesaron imágenes');
            return currentImages; // No cambiar
          }
        });
      } else {
        console.log('📋 No se encontraron imágenes en el portapapeles');
      }
    };

    console.log('📋 Registrando listener de paste');
    document.addEventListener('paste', handlePaste);
    return () => {
      console.log('📋 Removiendo listener de paste');
      document.removeEventListener('paste', handlePaste);
    };
  }, []); // ✅ Sin dependencias - se registra solo una vez

  const handleSendMessage = async () => {
    console.log('🔍 Current Project:', currentProject);
    console.log('🔍 Current Project ID:', currentProject?.id);
    
    if (!message.trim() || !user) {
      console.log('⚠️ Falta mensaje o usuario');
      return;
    }
    
    // ✅ Ocultar gestor de imágenes al enviar
    setShowImageManager(false);
    
    // ✅ Si no hay proyecto, crear uno automáticamente SOLO al intentar enviar mensaje
    if (!currentProject) {
      console.log('📁 No hay proyecto - Creando "Mi Primer Proyecto" automáticamente al enviar mensaje');
      try {
        await createProject('Mi Primer Proyecto', 'Proyecto creado al enviar tu primer mensaje');
        console.log('✅ Proyecto "Mi Primer Proyecto" creado automáticamente');
        // createProject ya selecciona el proyecto automáticamente
        // Esperar un momento para que se actualice el estado
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        console.error('❌ Error creando proyecto automático:', error);
        
        // ✅ Mostrar mensaje específico si es límite de proyectos
        if (error?.response?.status === 403) {
          const errorData = error.response?.data;
          sonnerToast.error('Límite de proyectos alcanzado', {
            description: errorData?.message || "No puedes crear más proyectos con tu plan actual",
            duration: 4000
          });
        } else {
          sonnerToast.error('Error al crear proyecto', {
            description: "No se pudo crear el proyecto. Intenta de nuevo.",
            duration: 3000
          });
        }
        return;
      }
    }

    // Permitir chatear siempre - solo advertir si intenta generar sin créditos
    // NO bloquear aquí

    // ✨ CAMBIO 2: Capturar el proyecto actual al inicio para evitar cambios durante generación
    const targetProjectId = currentProject.id;
    const targetProjectName = currentProject.name;
    
    console.log('🎯 Mensaje se guardará en proyecto:', targetProjectId, targetProjectName);

    // NUEVA LÓGICA SIMPLE Y LIMPIA
    const messageContent = message.trim();
    const attachedImages = [...smartImages]; // Copia inmutable
    
    // ✅ Limpiar el input inmediatamente Y resetear altura del textarea
    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsGenerating(true);
    setGeneratingInProjectId(targetProjectId); // ✨ Marcar que se está generando en este proyecto

    // ✨ NUEVO: Crear controlador de cancelación
    const controller = new AbortController();
    setAbortController(controller);

    try {
      // Agregar mensaje del usuario (este DEBE quedarse visible)
      addMessage({
        role: 'user',
        content: messageContent,
        images: attachedImages.length > 0 ? attachedImages : undefined
      });

      // Convertir imágenes a base64 si hay
      const imagesBase64 = [];
      if (attachedImages.length > 0) {
        console.log(`📸 Convirtiendo ${attachedImages.length} imágenes a base64...`);
        for (const img of attachedImages) {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result as string;
              // Quitar el prefijo data:image/...;base64,
              const base64Data = result.split(',')[1];
              resolve(base64Data);
            };
            reader.readAsDataURL(img.file);
          });
          
          imagesBase64.push({
            mimeType: img.file.type,
            base64Data: base64
          });
        }
        console.log(`✅ ${imagesBase64.length} imágenes convertidas a base64`);
      }

      // Llamada a la API
      console.log('📤 Enviando mensaje a la IA:', messageContent);
      console.log(`🖼️ Con ${imagesBase64.length} imágenes`);
      console.log(`🎯 Target Project ID para generación:`, targetProjectId);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          prompt: messageContent,
          projectId: targetProjectId, // ✨ Usar el proyecto capturado, no el actual
          images: imagesBase64.length > 0 ? imagesBase64 : undefined
        }),
        signal: controller.signal // ✨ NUEVO: Agregar señal de cancelación
      });
      
      console.log('📥 Respuesta recibida:', response.status, response.statusText);

      if (selectedImage) {
        setSelectedImage(null);
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al generar imagen');
      }

      const data = await response.json();
      console.log('📦 Datos recibidos:', data);
      console.log('🔍 DEBUG - data.imageUrl:', data.imageUrl);
      console.log('🔍 DEBUG - data.aiMessage.imageUrl:', data.aiMessage?.imageUrl);
      
      if (data.success) {
        console.log('✅ IA respondió exitosamente');
        console.log('💬 Respuesta de IA:', data.aiMessage?.content);
        console.log('🖼️ Imagen generada:', data.imageUrl);
        console.log('🎯 Respuesta fue para proyecto:', targetProjectId);
        console.log('🔍 Proyecto actual ahora es:', currentProject?.id);
        
        // ✅ SIEMPRE guardar en el proyecto objetivo (donde se solicitó la imagen)
        const projectChangedDuringGeneration = currentProject?.id !== targetProjectId;
        
        if (projectChangedDuringGeneration) {
          console.log('⚠️ Usuario cambió de proyecto durante generación');
          console.log('   - Proyecto objetivo:', targetProjectId, targetProjectName);
          console.log('   - Proyecto actual:', currentProject?.id, currentProject?.name);
        }
        
        // Agregar respuesta de la IA AL PROYECTO OBJETIVO
        const newMessage = {
          role: 'assistant' as const,
          content: data.aiMessage.content,
          imageUrl: data.imageUrl || undefined,
          imagePrompt: messageContent
        };
        
        console.log('📝 Mensaje a guardar en proyecto:', targetProjectId);
        console.log('🖼️ ImageUrl:', newMessage.imageUrl);
        
        // ✅ CORRECCIÓN: Usar addMessage en lugar de updateProject completo
        await addMessage({
          role: 'assistant',
          content: data.aiMessage.content,
          imageUrl: data.imageUrl || undefined,
          imagePrompt: messageContent
        });
        
        console.log('✅ Respuesta de IA agregada al proyecto:', targetProjectId);
        
        // Si el usuario cambió de proyecto, agregar notificación
        if (projectChangedDuringGeneration) {
          console.log('📢 Agregando notificación (usuario en otro proyecto)');
          setProjectsWithNewMessages(prev => [...new Set([...prev, targetProjectId])]);
        }

        // ✅ Actualizar créditos desde la respuesta del servidor (fuente de verdad)
        if (typeof data.imagesRemaining === 'number') {
          updateCreditsFromServer(data.imagesRemaining);
          console.log('💳 Créditos actualizados desde servidor:', data.imagesRemaining);
        }
        
        // ✅ LIMPIAR IMÁGENES SOLO DESPUÉS DEL ÉXITO
        console.log('✅ Mensaje enviado con éxito - Limpiando gestor de imágenes');
        resetImageManager();
      } else {
        console.error('❌ Error en respuesta:', data);
        throw new Error('Error en la respuesta del servidor');
      }

    } catch (error) {
      console.error('❌ Error completo al generar imagen:', error);
      
      // ✨ MEJORADO: Detectar si fue cancelación
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🛑 Generación cancelada por el usuario');
        
        // ✨ Agregar mensaje solo si fue cancelación real
        addMessage({
          role: 'assistant',
          content: '_Generación detenida por el usuario_'
        });
        
      } else {
        // ✨ Solo mostrar error si es crítico
        console.error('Error:', error);
        
        // ✅ Restaurar el mensaje en el input si hay error (para que pueda reintentar)
        setMessage(messageContent);
      }
      
      // ✅ En caso de error también limpiar imágenes para evitar estado inconsistente
      console.log('❌ Error al generar - Limpiando gestor de imágenes');
      resetImageManager();
    } finally {
      setIsGenerating(false);
      setGeneratingInProjectId(null); // ✨ Limpiar el proyecto de generación
      setAbortController(null); // ✨ NUEVO: Limpiar controlador
    }
  };

  // ✨ NUEVO: Función para cancelar generación
  const handleCancelGeneration = () => {
    if (abortController) {
      console.log('🛑 Cancelando generación...');
      abortController.abort();
      setAbortController(null);
    }
  };

  // Nueva función simple para resetear el gestor de imágenes
  const resetImageManager = () => {
    console.log('🧹 Reseteando gestor de imágenes - LIMPIEZA TOTAL');
    // ✅ Limpiar el estado de imágenes
    setSmartImages([]);
  };

  const currentPlan = PLANS.find(p => p.id === user?.plan) || PLANS[0];
  const usagePercentage = user ? ((currentPlan.images - user.imagesRemaining) / currentPlan.images) * 100 : 0;

  // Obtener imágenes generadas del proyecto actual
  const projectImages = currentProject?.messages
    .filter(msg => msg.role === 'assistant' && msg.imageUrl)
    .map(msg => ({
      id: msg.id,
      url: msg.imageUrl!,
      prompt: msg.imagePrompt || msg.content,
      timestamp: msg.timestamp
    })) || [];

  // Nueva lógica simple para manejar cambios de imágenes
  const handleSmartImagesChange = (images: SmartImage[]) => {
    setSmartImages(images);
  };

  // Función simplificada - solo texto, las imágenes van automáticamente
  const parseMessageText = (text: string) => {
    return [{ type: 'text', content: text }];
  };

  const handleEditImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setMessage(`Edita esta imagen para mejorar: `);
  };

  // Mostrar pantalla de carga mientras se cargan los proyectos
  if (isLoadingProjects) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-black to-[#1a0a1a]">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-light text-purple-100 mb-2">Cargando tus Proyectos</h2>
            <p className="text-purple-400/60">Preparando tu espacio creativo...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex overflow-hidden flex-col">

      {/* Contenedor principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar con ancho fijo */}
        <div className="w-80 flex-shrink-0">
          <Sidebar 
            generatingInProjectId={generatingInProjectId}
            projectsWithNewMessages={projectsWithNewMessages}
          />
        </div>
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col relative">
        
        {/* Plan Free Banner - Always visible for free users */}
        {user?.plan === 'free' && (
          <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 border-b border-red-500/30 p-3">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="flex items-center space-x-3">
                <CreditCard className="text-red-400" size={18} />
                <span className="text-sm text-red-200">
                  <strong>Sin créditos disponibles</strong> - Actualiza tu plan para usar
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => navigate('/plans')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs px-4 py-1"
              >
                Ver Planes
              </Button>
            </div>
          </div>
        )}

        {/* Elegant Header - Responsive */}
        <div className="h-16 md:h-20 border-b border-purple-500/20 flex items-center justify-between px-4 md:px-8 bg-gradient-to-r from-[#0a0a0a] to-[#1a0a1a] backdrop-blur-xl">
          <div className="flex items-center space-x-2 md:space-x-4">
            <img src={logo} alt="Dazly" className="h-6 md:h-8 w-auto" />
            <div className="hidden md:block h-6 w-px bg-purple-400/30" />
            <div>
              <h1 
                className="text-sm md:text-lg font-light text-purple-100 cursor-pointer hover:text-purple-50 transition-colors truncate max-w-[150px] md:max-w-none"
                onClick={() => {
                  const newName = prompt('Nuevo nombre del proyecto:', currentProject?.name || 'Nuevo Proyecto');
                  if (newName && newName.trim() && newName.trim() !== currentProject?.name) {
                    updateCurrentProject({ name: newName.trim() });
                    console.log('✅ Proyecto renombrado a:', newName.trim());
                  }
                }}
                title="Haz clic para editar el nombre del proyecto"
              >
                {currentProject?.name || 'Nuevo Proyecto'}
              </h1>
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

            {/* Elegant Usage Indicator */}
            <div className="hidden md:flex items-center space-x-3">
              {user?.plan === 'free' ? (
                <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <Eye className="text-blue-400" size={16} />
                  <span className="text-sm font-light text-blue-300">
                    Vista Previa
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <BoltIcon className="text-purple-400" size={16} />
                    <span className="text-sm font-light text-purple-200">
                      {Math.max(0, user?.imagesRemaining || 0)}
                    </span>
                    <span className="text-xs text-purple-400/60">
                      /{currentPlan.images}
                    </span>
                  </div>
                  <div className="w-20 h-1.5 bg-purple-900/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(100, Math.max(2, ((user?.imagesRemaining || 0) / currentPlan.images) * 100))}%` 
                      }}
                    />
                  </div>
                </>
              )}
            </div>
            
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
        <ScrollArea className="flex-1 px-6 relative">
          {/* Botón para bajar al final */}
          {showScrollButton && (
            <button
              onClick={() => scrollToBottom(true)}
              className="fixed bottom-32 right-8 z-50 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 animate-bounce"
              aria-label="Ir al final"
            >
              <ArrowDown size={24} />
            </button>
          )}
          <div ref={messagesContainerRef} className="max-w-4xl mx-auto space-y-8 py-8">
            {!currentProject?.messages?.length ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center max-w-4xl w-full">
                  <div className="mb-8 flex items-center justify-center">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-8">
                        <img src={logo} alt="Dazly" className="h-24 w-auto opacity-90" />
                      </div>
                      <h2 className="text-3xl font-light text-purple-100 mb-3">
                        Dazly Professional Sandbox
                      </h2>
                      <p className="text-purple-300/60 leading-relaxed max-w-md">
                        Crea, edita y desarrolla imágenes profesionales con IA. Desde marketing hasta arte, todo en un solo lugar.
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
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
                        className="group cursor-pointer p-3 rounded-xl bg-gradient-to-br from-purple-900/5 to-pink-900/5 border border-purple-500/10 hover:border-purple-400/30 hover:from-purple-900/10 hover:to-pink-900/10 transition-all duration-300 hover:scale-[1.02]"
                        onClick={() => setMessage(prompt.text)}
                      >
                        <div className="flex flex-col items-center text-center space-y-2">
                          <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                            <prompt.icon className="text-purple-400 group-hover:text-purple-300 transition-colors" size={18} />
                          </div>
                          <div>
                            <div className="text-xs text-purple-400/60 font-medium mb-1 uppercase tracking-wide">{prompt.category}</div>
                            <p className="text-xs text-purple-200 group-hover:text-white transition-colors leading-tight font-light">
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
              currentProject.messages.map((msg, index) => (
                <div key={msg.id} className="space-y-4">
                  {msg.role === 'system' ? (
                    /* ✨ NUEVO: Mensajes del sistema (sin bocadillo) */
                    <div className="flex justify-center">
                      <div className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
                        <p className="text-xs text-purple-300/70 italic">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  ) : msg.role === 'user' ? (
                    <div className="flex justify-end">
                      <div className="max-w-2xl w-full md:w-auto">
                        <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 backdrop-blur-sm rounded-2xl px-4 md:px-6 py-3 md:py-4 shadow-xl border border-slate-600/30">
                          <div className="space-y-3">
                            {/* Texto del mensaje */}
                            <p className="text-gray-100 font-normal leading-relaxed break-words whitespace-pre-wrap">
                              {msg.content}
                            </p>
                            
                            {/* ✅ IMÁGENES COMPLETAS: Se ven enteras, no cortadas */}
                            {msg.images && msg.images.length > 0 && (
                              <div className="grid grid-cols-2 gap-2 mt-4">
                                {msg.images.slice(0, 4).map((image, idx) => (
                                  <div key={image.id} className="relative group">
                                    <img
                                      src={image.url}
                                      alt={image.name}
                                      className="w-full h-auto rounded-lg border border-slate-500/30"
                                      style={{
                                        objectFit: 'contain',
                                        maxHeight: '300px',
                                        backgroundColor: 'rgba(0,0,0,0.2)'
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                                  </div>
                                ))}
                                {msg.images.length > 4 && (
                                  <div className="relative flex items-center justify-center bg-slate-600/30 rounded-lg border border-slate-500/30 h-32">
                                    <span className="text-gray-300 text-sm font-medium">+{msg.images.length - 4} más</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-start">
                      <div className="max-w-3xl w-full md:w-auto space-y-4">
                        {msg.content && (
                          <div>
                            <MarkdownMessage content={msg.content} />
                            
                            {/* ✨ MEJORADO: Detectar múltiples preguntas para Auto-Answer */}
                            {(() => {
                              // Solo procesar si es un mensaje de la IA
                              if (msg.role !== 'assistant') return false;
                              
                              // Verificar que es el ÚLTIMO mensaje de la IA
                              const messages = currentProject?.messages || [];
                              const lastMessage = messages[messages.length - 1];
                              const isLastMessage = lastMessage?.id === msg.id;
                              
                              if (!isLastMessage) return false;
                              
                              // Contar interrogantes de cierre
                              const questionCount = (msg.content.match(/\?/g) || []).length;
                              const hasEnoughQuestions = questionCount >= 5;
                              
                              // Debug
                              if (isLastMessage && questionCount > 0) {
                                console.log('🔍 Último mensaje de IA');
                                console.log('🔍 Preguntas encontradas:', questionCount);
                                console.log('🔍 Mínimo requerido: 5');
                                console.log('🔍 Mostrar botón:', hasEnoughQuestions);
                              }
                              
                              return hasEnoughQuestions;
                            })() && (
                              <div className="mt-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={async () => {
                                    // Envío automático invisible
                                    console.log('🎯 Auto-Answer activado');
                                    
                                    const targetProjectId = currentProject?.id;
                                    if (!targetProjectId) return;
                                    
                                    setIsGenerating(true);
                                    setGeneratingInProjectId(targetProjectId);
                                    
                                    const controller = new AbortController();
                                    setAbortController(controller);
                                    
                                    // ✨ NO agregar mensaje aquí, se agregará después de la respuesta
                                    
                                    try {
                                      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/generate`, {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          'Authorization': `Bearer ${token}`
                                        },
                                        body: JSON.stringify({ 
                                          prompt: '⟨AUTO_ANSWER⟩',
                                          projectId: targetProjectId
                                        }),
                                        signal: controller.signal
                                      });
                                      
                                      if (response.ok) {
                                        const data = await response.json();
                                        
                                        // ✨ PRIMERO: Agregar mensaje del sistema (sustituye al de carga)
                                        await addMessage({
                                          role: 'system',
                                          content: 'Respuesta automática generada'
                                        });
                                        
                                        // ✨ SEGUNDO: Agregar respuesta de la IA (sin badge, ya está el mensaje del sistema)
                                        await addMessage({
                                          role: 'assistant',
                                          content: data.aiMessage.content,
                                          imageUrl: data.imageUrl || undefined,
                                          imagePrompt: 'Respuesta automática'
                                        });
                                        
                                        // ✅ Actualizar créditos desde respuesta del servidor
                                        if (typeof data.imagesRemaining === 'number') {
                                          updateCreditsFromServer(data.imagesRemaining);
                                        }
                                      }
                                    } catch (error) {
                                      console.error('Error en auto-answer:', error);
                                    } finally {
                                      setIsGenerating(false);
                                      setGeneratingInProjectId(null);
                                      setAbortController(null);
                                    }
                                  }}
                                  className="text-xs bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200 transition-all"
                                  disabled={isGenerating}
                                >
                                  <SparkleIcon size={12} className="mr-2" />
                                  Respuesta automática
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {msg.imageUrl && (
                          <div className="relative group mt-4">
                            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/5 to-pink-900/5">
                              {/* ✅ IMAGEN COMPLETA: Se ve entera, no cortada */}
                              <img 
                                src={msg.imageUrl} 
                                alt={msg.imagePrompt || "Imagen generada"}
                                className="w-full h-auto rounded-2xl group-hover:scale-[1.01] transition-transform duration-500"
                                style={{ 
                                  objectFit: 'contain',
                                  maxWidth: '100%',
                                  height: 'auto',
                                  display: 'block'
                                }}
                                onLoad={() => console.log('✅ Imagen cargada en el DOM')}
                                onError={(e) => console.error('❌ Error cargando imagen:', e)}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                              
                              {/* Elegant Action Buttons */}
                              <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                <Button 
                                  size="sm" 
                                  className="h-9 w-9 p-0 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 rounded-full"
                                  onClick={() => {
                                    // ✅ Descargar imagen directamente (sin abrir pestaña)
                                    const link = document.createElement('a');
                                    link.href = msg.imageUrl!;
                                    link.download = `dazly-image-${Date.now()}.png`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                >
                                  <DownloadIcon className="text-white" size={16} />
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="h-9 w-9 p-0 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 rounded-full"
                                  onClick={() => handleEditImage(msg.imageUrl!)}
                                >
                                  <EditIcon className="text-white" size={16} />
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="h-9 w-9 p-0 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 rounded-full"
                                  onClick={() => setShowProjectGallery(true)}
                                >
                                  <GalleryIcon className="text-white" size={16} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                        
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            
            {/* ✨ MEJORADO: Animación minimalista de generación */}
            {isGenerating && generatingInProjectId === currentProject?.id && (
              <div className="flex justify-start animate-fade-in-down">
                <div className="max-w-2xl w-full">
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-purple-500/30 shadow-lg shadow-purple-500/10">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="animate-spin h-6 w-6 border-2 border-purple-400/30 border-t-purple-400 rounded-full"></div>
                        <div className="absolute inset-0 animate-ping h-6 w-6 border border-purple-400/20 rounded-full"></div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-purple-100 font-medium text-sm">Dazly está creando magia...</span>
                        <span className="text-purple-300/60 text-xs">Click en el botón rojo para cancelar</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Elegant Input Area */}
        <div className="border-t border-purple-500/20 bg-gradient-to-t from-[#0a0a0a] to-[#0a0a0a]/95 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto px-8 py-6">
            {/* Credits Warning */}
            {(user?.imagesRemaining || 0) <= 0 && (
              <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 backdrop-blur-sm">
                <div className="flex items-center justify-center space-x-2">
                  <BoltIcon className="text-red-400" size={16} />
                  <p className="text-sm text-red-300 font-light">
                    Sin créditos disponibles.
                    <Button 
                      variant="link" 
                      className="p-0 ml-2 h-auto text-red-200 underline hover:text-white transition-colors"
                      onClick={() => navigate('/plans')}
                    >
                      Actualizar plan
                    </Button>
                  </p>
                </div>
              </div>
            )}

            {/* Input Container */}

            <div className="relative">
              <div className="flex items-center space-x-4">
                {/* Main Input */}
                <div className="flex-1 space-y-3">
                  {/* Preview automático de imágenes que se enviarán */}
                  {smartImages.length > 0 && message.trim() && (
                    <div className="p-3 bg-gradient-to-r from-purple-900/10 to-pink-900/10 rounded-xl border border-purple-500/20 backdrop-blur-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <ImageIcon className="h-3 w-3 text-purple-400" />
                        <span className="text-xs text-purple-300/80">Se incluirán {smartImages.length} imagen{smartImages.length > 1 ? 'es' : ''}</span>
                      </div>
                      <div className="flex gap-2">
                        {smartImages.slice(0, 3).map((image, idx) => (
                          <img
                            key={image.id}
                            src={image.url}
                            alt={image.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                        ))}
                        {smartImages.length > 3 && (
                          <div className="w-8 h-8 rounded bg-purple-600/20 flex items-center justify-center">
                            <span className="text-xs text-purple-300">+{smartImages.length - 3}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={message}
                      onChange={(e) => {
                        if (user?.plan === 'free' || user?.imagesRemaining <= 0) {
                          return; // No permitir escribir si es Plan Free o sin créditos
                        }
                        setMessage(e.target.value);
                        
                        // Auto-resize hasta 7 líneas antes de scroll
                        const textarea = e.target;
                        textarea.style.height = 'auto';
                        const lineHeight = 28; // px por línea (más espacio)
                        const maxLines = 7;
                        const newHeight = Math.min(textarea.scrollHeight, lineHeight * maxLines);
                        textarea.style.height = `${newHeight}px`;
                      }}
                      placeholder={(user?.plan === 'free' || user?.imagesRemaining <= 0) ? "Sin créditos - Actualiza tu plan para crear..." : "Describe lo que quieres crear..."}
                      className={`w-full pr-16 py-3 px-4 rounded-2xl backdrop-blur-sm transition-all duration-300 resize-none min-h-[48px] overflow-y-auto scrollbar-hide ${
                        (user?.plan === 'free' || user?.imagesRemaining <= 0)
                          ? 'bg-gray-800/50 border border-gray-600 text-gray-400 placeholder:text-gray-500 cursor-not-allowed'
                          : 'bg-purple-900/10 border border-purple-500/30 text-purple-100 placeholder:text-purple-400/50 focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/20'
                      }`}
                      style={{ maxHeight: '196px', lineHeight: '28px' }} // 7 líneas * 28px
                      onKeyPress={(e) => {
                        if (user?.plan === 'free' || user?.imagesRemaining <= 0) {
                          e.preventDefault();
                          return;
                        }
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={isGenerating}
                      rows={1}
                    />
                    
                    {/* Gestor de imágenes simplificado - Posición fija mejorada */}
                    <div className="absolute right-2 bottom-2 z-20" style={{ pointerEvents: isGenerating ? 'none' : 'auto' }}>
                      <div className={`transition-opacity duration-200 ${isGenerating ? 'opacity-30' : 'opacity-100'}`}>
                        <ChatImageManager
                          onImagesChange={handleSmartImagesChange}
                          existingImages={smartImages}
                          isVisible={showImageManager && !isGenerating}
                          onToggle={() => {
                            if (!isGenerating) {
                              setShowImageManager(!showImageManager);
                            }
                          }}
                          onClear={() => {
                            if (!isGenerating) {
                              console.log('🧹 onClear llamado - Limpiando smartImages');
                              setSmartImages([]);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* ✨ NUEVO: Smart Tips, Mejorar Prompt y Count */}
                  <div className="flex justify-between items-center px-1">
                    <div className="flex items-center space-x-4">
                      <span className={`text-xs font-light transition-colors ${
                        message.trim().split(/\s+/).filter(word => word.length > 0).length > 500 
                          ? 'text-red-400' 
                          : 'text-purple-400/40'
                      }`}>
                        {message.trim().split(/\s+/).filter(word => word.length > 0).length}/500 palabras
                      </span>
                      {smartImages.length > 0 && (
                        <span className="text-xs text-purple-400/40 font-light">
                          {smartImages.length} imagen{smartImages.length !== 1 ? 'es' : ''} adjunta{smartImages.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    
                    {/* ✨ NUEVO: Botón "Mejorar Prompt" con animación */}
                    {message.trim() && message.trim().length > 10 && !isGenerating && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          const originalMessage = message;
                          setMessage('✨ Mejorando tu prompt...');
                          
                          try {
                            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/enhance-prompt`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({ prompt: originalMessage })
                            });
                            
                            const data = await response.json();
                            
                            if (response.ok && data.success) {
                              setMessage(data.enhancedPrompt || originalMessage);
                              
                              // ✨ Notificación eliminada - funcionamiento silencioso
                              // toast({
                              //   title: "✨ Prompt mejorado",
                              //   description: "Tu prompt ahora es más profesional y detallado",
                              //   duration: 3000,
                              // });
                            } else {
                              setMessage(originalMessage);
                              // toast({
                              //   title: "⚠️ No se pudo mejorar",
                              //   description: "Intenta de nuevo en unos segundos",
                              //   variant: "destructive",
                              //   duration: 3000,
                              // });
                            }
                          } catch (error) {
                            console.error('Error mejorando prompt:', error);
                            setMessage(originalMessage);
                            // toast({
                            //   title: "❌ Error",
                            //   description: "Problema al conectar con el servidor",
                            //   variant: "destructive",
                            //   duration: 3000,
                            // });
                          }
                        }}
                        className="h-6 px-3 text-xs bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-500/30 hover:border-purple-400/50 text-purple-300 hover:text-purple-200 rounded-lg transition-all duration-300"
                        disabled={isGenerating}
                      >
                        <SparkleIcon size={12} className="mr-1.5 animate-pulse" />
                        Mejorar
                      </Button>
                    )}
                  </div>
                </div>

                {/* ✨ MEJORADO: Send/Cancel Button unificado con colores high-tech */}
                <div className="flex items-end">
                  <Button
                    onClick={isGenerating ? handleCancelGeneration : handleSendMessage}
                    disabled={!isGenerating && (!message.trim() || message.trim().split(/\s+/).filter(word => word.length > 0).length > 500)}
                    className={`h-12 w-12 p-0 rounded-xl transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 flex-shrink-0 backdrop-blur-sm ${
                      isGenerating 
                        ? 'bg-red-950/40 hover:bg-red-900/50 border-2 border-red-500/30 hover:border-red-400/40 hover:shadow-red-500/10'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 hover:shadow-purple-500/20'
                    }`}
                  >
                    {isGenerating ? (
                      <X className="text-red-300 hover:text-red-200 transition-colors" size={18} />
                    ) : (
                      <SendIcon className="text-white" size={18} />
                    )}
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Account Settings Modal */}
      {showAccountSettings && (
        <AccountSettings onClose={() => setShowAccountSettings(false)} />
      )}

        {/* Project Gallery Modal */}
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
    </div>
  );
};

export default ChatPage;
