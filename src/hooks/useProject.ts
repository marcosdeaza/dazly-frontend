// src/hooks/useProject.ts

import { useEffect, useRef } from 'react';
import { useUserStore } from '@/store/userStore';
import { Project, ChatMessage } from '@/types';

export const useProject = () => {
  const { 
    projects, 
    currentProject, 
    setCurrentProject, 
    addProject, 
    updateProject,
    addMessageToCurrentProject,
    isLoadingProjects
  } = useUserStore();

  // ✅ SIMPLEMENTE NO CREAR PROYECTOS AUTOMÁTICAMENTE
  useEffect(() => {
    // Esperar a que termine de cargar proyectos del servidor
    if (isLoadingProjects) return;
    
    // ❌ NO CREAR PROYECTOS AUTOMÁTICAMENTE
    // El usuario debe crear proyectos manualmente desde el botón "Nuevo Proyecto"
    
    // ✅ SOLO SELECCIONAR PROYECTO EXISTENTE, NUNCA CREAR UNO NUEVO
    if (projects.length > 0 && !currentProject) {
      console.log('📁 Seleccionando proyecto más reciente (SIN crear nada)');
      const mostRecent = [...projects].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      setCurrentProject(mostRecent);
      console.log('✅ Proyecto seleccionado:', mostRecent.name);
    }
    // ✅ Si el proyecto actual fue eliminado, seleccionar otro
    else if (projects.length > 0 && currentProject && !projects.find(p => p.id === currentProject.id)) {
      console.log('⚠️ Proyecto actual eliminado, seleccionando otro');
      const firstAvailable = projects[0];
      setCurrentProject(firstAvailable);
      console.log('✅ Nuevo proyecto seleccionado:', firstAvailable.name);
    }
    // ✅ Si NO hay proyectos, dejar currentProject en null (NO CREAR)
    else if (projects.length === 0 && currentProject) {
      console.log('📭 No hay proyectos - Limpiando currentProject');
      setCurrentProject(null);
    }
  }, [projects, projects.length, currentProject, isLoadingProjects, setCurrentProject]);

  const createProject = async (name: string, description?: string) => {
    const newProject: Project = {
      id: crypto.randomUUID(), // Temporal
      name,
      description: description || '',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    try {
      const serverProject = await addProject(newProject);
      setCurrentProject(serverProject || newProject);
      return serverProject || newProject;
<<<<<<< HEAD
    } catch (error: any) {
      console.error('Error creando proyecto:', error);
      
      // ✅ Si es límite de proyectos, propagar el error para que el componente lo maneje
      if (error?.response?.status === 403) {
        throw error;
      }
      
      // Para otros errores, crear proyecto local
=======
    } catch (error) {
      console.error('Error creando proyecto:', error);
>>>>>>> db4ceb629c696e3718439846957596f2f57c766f
      setCurrentProject(newProject);
      return newProject;
    }
  };

  const addMessage = async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const fullMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };
    
    await addMessageToCurrentProject(fullMessage);
    return fullMessage;
  };

  const updateCurrentProject = async (updates: Partial<Project>) => {
    if (currentProject) {
      await updateProject(currentProject.id, updates);
    }
  };

  return {
    projects,
    currentProject,
    setCurrentProject,
    createProject,
    addMessage,
    updateCurrentProject,
    isLoadingProjects
  };
};