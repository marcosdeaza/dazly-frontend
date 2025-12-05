// src/components/ChatSidebar.tsx

import React, { useState } from 'react';
import { Plus, MessageCircle, Settings, Trash2, Edit2, FolderOpen, Check, X, Eye, Bell } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project, PLANS } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
<<<<<<< HEAD
<<<<<<< HEAD
import { toast } from 'sonner';
=======
>>>>>>> db4ceb629c696e3718439846957596f2f57c766f
=======
import { toast } from 'sonner';
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368

interface SidebarProps {
  generatingInProjectId?: string | null;
  projectsWithNewMessages?: string[];
}

export const Sidebar = ({ generatingInProjectId, projectsWithNewMessages = [] }: SidebarProps) => {
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [localNewProjectName, setLocalNewProjectName] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editProjectName, setEditProjectName] = useState('');
<<<<<<< HEAD
<<<<<<< HEAD
  const [showLimitDenied, setShowLimitDenied] = useState(false); // ✨ Efecto visual de negación
=======
>>>>>>> db4ceb629c696e3718439846957596f2f57c766f
=======
  const [showLimitDenied, setShowLimitDenied] = useState(false); // ✨ Efecto visual de negación
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
  
  const { 
    user, 
    projects, 
    currentProject, 
    addProject, 
    setCurrentProject, 
    deleteProject,
    updateProject
  } = useUserStore();

  const createNewProject = async () => {
    if (!localNewProjectName.trim()) return;

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
    // ✅ Verificar límite de proyectos ANTES de intentar crear
    const userPlan = user?.plan || 'free';
    const currentPlanInfo = PLANS.find(p => p.id === userPlan);
    const maxProjects = currentPlanInfo?.maxProjects || 0;
    
    if (projects.length >= maxProjects) {
      // ❌ NO notificar - solo efecto visual de negación
      setShowLimitDenied(true);
      setTimeout(() => setShowLimitDenied(false), 600); // Duración de la animación
      setIsCreatingProject(false);
      return;
    }

<<<<<<< HEAD
=======
>>>>>>> db4ceb629c696e3718439846957596f2f57c766f
=======
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
    const project: Project = {
      id: crypto.randomUUID(),
      name: localNewProjectName.trim(),
      description: '',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      const savedProject = await addProject(project);
      setCurrentProject(savedProject || project);
      setLocalNewProjectName('');
      setIsCreatingProject(false); // ✅ Cerrar el formulario después de crear
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
    } catch (error: any) {
      console.error('Error creando proyecto:', error);
      
      // ✅ Error 403 = límite alcanzado, no mostrar nada (ya hay efecto visual)
      if (error?.response?.status === 403) {
        // Sin notificación - solo efecto visual
      }
      
<<<<<<< HEAD
=======
    } catch (error) {
      console.error('Error creando proyecto:', error);
>>>>>>> db4ceb629c696e3718439846957596f2f57c766f
=======
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
      setIsCreatingProject(false); // ✅ Cerrar incluso si hay error
    }
  };

  const handleEditProject = (projectId: string, currentName: string) => {
    setEditingProject(projectId);
    setEditProjectName(currentName);
  };

  const updateProjectName = async () => {
    if (!editProjectName.trim() || !editingProject) return;
    
    try {
      // Actualizar en el store usando la función updateProject
      await updateProject(editingProject, { 
        name: editProjectName.trim() 
      });
      
      setEditingProject(null);
      setEditProjectName('');
    } catch (error) {
      console.error('Error actualizando proyecto:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Error eliminando proyecto:', error);
      setProjectToDelete(null);
    }
  };

  const currentPlan = PLANS.find(p => p.id === user?.plan) || PLANS[0];

  return (
    <div className="w-80 h-full bg-[#0a0a0a] border-r border-purple-500/20 flex flex-col backdrop-blur-xl">
      {/* Header */}
      <div className="p-6 border-b border-purple-500/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-light text-purple-100">Proyectos</h2>
          <Button
            size="sm"
            onClick={() => setIsCreatingProject(true)}
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
            className={`h-8 w-8 p-0 rounded-full border transition-all duration-300 ${
              showLimitDenied
                ? 'bg-red-600/40 border-red-500/60 animate-shake'
                : 'bg-purple-600/20 hover:bg-purple-500/30 border-purple-500/30 hover:border-purple-400/50'
            }`}
          >
            <Plus className={`h-4 w-4 transition-colors ${showLimitDenied ? 'text-red-300' : 'text-purple-300'}`} />
<<<<<<< HEAD
=======
            className="h-8 w-8 p-0 rounded-full bg-purple-600/20 hover:bg-purple-500/30 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300"
          >
            <Plus className="h-4 w-4 text-purple-300" />
>>>>>>> db4ceb629c696e3718439846957596f2f57c766f
=======
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
          </Button>
        </div>

        {/* Usage Stats */}
<<<<<<< HEAD
<<<<<<< HEAD
        <div className="p-4 bg-purple-900/10 border border-purple-500/20 rounded-xl backdrop-blur-sm space-y-4">
=======
        <div className="p-4 bg-purple-900/10 border border-purple-500/20 rounded-xl backdrop-blur-sm">
>>>>>>> db4ceb629c696e3718439846957596f2f57c766f
=======
        <div className="p-4 bg-purple-900/10 border border-purple-500/20 rounded-xl backdrop-blur-sm space-y-4">
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-purple-300/80 font-light">Plan actual</span>
            <Badge className={`text-xs ${
              user?.plan === 'free' 
                ? 'bg-blue-500/20 text-blue-200 border-blue-400/30' 
                : 'bg-purple-500/20 text-purple-200 border-purple-400/30'
            }`}>
              {currentPlan.name}
            </Badge>
          </div>
          
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
          {/* Proyectos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-purple-300/80 font-light">Proyectos</span>
              <span className="text-xs text-purple-200 font-medium">
                {projects.length}/{currentPlan.maxProjects}
              </span>
            </div>
            <div className="w-full bg-purple-900/30 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  projects.length >= currentPlan.maxProjects
                    ? 'bg-gradient-to-r from-red-400 to-orange-400'
                    : 'bg-gradient-to-r from-purple-400 to-pink-400'
                }`}
                style={{ 
                  width: `${Math.max(5, (projects.length / currentPlan.maxProjects) * 100)}%` 
                }}
              />
            </div>
          </div>
          
          {/* Créditos */}
<<<<<<< HEAD
=======
>>>>>>> db4ceb629c696e3718439846957596f2f57c766f
=======
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
          {user?.plan === 'free' ? (
            <>
              <div className="flex items-center space-x-2 mb-2">
                <Eye className="text-blue-400" size={16} />
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
                <span className="text-sm font-light text-blue-200">Vista Previa</span>
              </div>
              <div className="text-xs text-blue-400/60 font-light">
                Sin créditos · Actualiza tu plan
<<<<<<< HEAD
=======
                <span className="text-lg font-light text-blue-200">Vista Previa</span>
              </div>
              <div className="text-xs text-blue-400/60 mb-3 font-light">
                Solo navegación y exploración
              </div>
              <div className="w-full bg-blue-900/30 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-blue-400 to-cyan-400 h-1.5 rounded-full w-full" />
>>>>>>> db4ceb629c696e3718439846957596f2f57c766f
=======
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
              </div>
            </>
          ) : (
            <>
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-purple-300/80 font-light">Créditos</span>
                <span className="text-xs text-purple-200 font-medium">
                  {user?.imagesRemaining || 0}/{currentPlan.images}
                </span>
<<<<<<< HEAD
=======
              <div className="text-2xl font-light text-purple-100 mb-1">
                {user?.imagesRemaining || 0}
              </div>
              <div className="text-xs text-purple-400/60 mb-3 font-light">
                de {currentPlan.images} imágenes restantes
>>>>>>> db4ceb629c696e3718439846957596f2f57c766f
=======
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
              </div>
              <div className="w-full bg-purple-900/30 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-purple-400 to-pink-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.max(5, ((user?.imagesRemaining || 0) / currentPlan.images) * 100)}%` 
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Project Form */}
      {isCreatingProject && (
        <div className="p-6 border-b border-purple-500/20 bg-purple-900/5">
          <div className="space-y-4">
            <Input
              value={localNewProjectName}
              onChange={(e) => setLocalNewProjectName(e.target.value)}
              placeholder="Nombre del proyecto..."
              className="bg-purple-900/10 border-purple-500/30 text-purple-100 placeholder:text-purple-400/50 rounded-xl focus:border-purple-400/60"
              onKeyPress={(e) => e.key === 'Enter' && createNewProject()}
              autoFocus
            />
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                onClick={createNewProject} 
                className="flex-1 bg-purple-600/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30"
              >
                Crear
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => {
                  setIsCreatingProject(false);
                  setLocalNewProjectName('');
                }}
                className="flex-1 text-purple-300 hover:text-white hover:bg-purple-500/10"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Projects List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 mx-auto text-gray-600 mb-3" />
              <p className="text-gray-500 text-sm">
                No tienes proyectos aún
              </p>
              <p className="text-gray-600 text-xs">
                Crea uno para empezar
              </p>
            </div>
          ) : (
            // ✨ CAMBIO 1: Ordenar proyectos por updatedAt (más reciente primero)
            [...projects]
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .map((project) => (
              <Card
                key={project.id}
                className={`p-3 cursor-pointer transition-all hover:bg-gray-800/50 group relative ${
                  currentProject?.id === project.id 
                    ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/50' 
                    : 'bg-gray-800/20 border-gray-700'
                }`}
                onClick={() => setCurrentProject(project)}
              >
                {/* ✨ NOTIFICACIÓN DE MENSAJE NUEVO (prioridad) - Con icono de campanita */}
                {projectsWithNewMessages.includes(project.id) && currentProject?.id !== project.id && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="relative">
                      <Bell className="h-4 w-4 text-green-400 animate-bounce" />
                      <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-400 rounded-full animate-ping"></div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {/* ✨ Icono cambia si está generando */}
                      {generatingInProjectId === project.id ? (
                        <div className="animate-spin h-4 w-4 border-2 border-purple-400/50 border-t-purple-400 rounded-full flex-shrink-0"></div>
                      ) : (
                        <MessageCircle className="h-4 w-4 text-purple-400 flex-shrink-0" />
                      )}
                      
                      {editingProject === project.id ? (
                        <div className="flex items-center space-x-2 flex-1">
                          <Input
                            value={editProjectName}
                            onChange={(e) => setEditProjectName(e.target.value)}
                            className="bg-purple-900/20 border-purple-500/30 text-purple-100 text-sm h-6 px-2"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') updateProjectName();
                              if (e.key === 'Escape') {
                                setEditingProject(null);
                                setEditProjectName('');
                              }
                            }}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <h3 className="font-medium truncate text-sm text-purple-100">
                          {project.name}
                        </h3>
                      )}
                    </div>
                    
                    {editingProject !== project.id && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-purple-400/60">
                          {project.messages.length} mensajes
                        </p>
                        <p className="text-xs text-purple-400/60">
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingProject === project.id ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-green-400 hover:text-green-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateProjectName();
                          }}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingProject(null);
                            setEditProjectName('');
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-purple-400 hover:text-purple-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProject(project.id, project.name);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectToDelete(project.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <AlertDialogContent className="bg-gray-900 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proyecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todas las conversaciones y imágenes generadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => projectToDelete && handleDeleteProject(projectToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};