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

  // ✅ Flag para evitar crear proyectos duplicados al recargar
  const hasInitialized = useRef(false);

  // Crear proyecto por defecto si no hay ninguno (después de cargar del servidor)
  useEffect(() => {
    // ✅ Solo ejecutar una vez cuando termine de cargar
    if (isLoadingProjects) return;
    
    if (projects.length === 0 && !hasInitialized.current) {
      console.log('📁 No hay proyectos, creando proyecto inicial...');
      hasInitialized.current = true; // ✅ Marcar como inicializado
      
      const defaultProject: Project = {
        id: crypto.randomUUID(), // Temporal, el servidor asignará el ID real
        name: 'Mi Primer Proyecto',
        description: 'Proyecto de bienvenida',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      addProject(defaultProject).then((serverProject) => {
        if (serverProject) {
          setCurrentProject(serverProject);
        }
      }).catch((error) => {
        console.error('Error creando proyecto por defecto:', error);
        // Fallback: usar el proyecto temporal
        setCurrentProject(defaultProject);
      });
    } else if (!currentProject && projects.length > 0) {
      // Si hay proyectos pero ninguno seleccionado, seleccionar el más reciente
      console.log('📁 Seleccionando proyecto más reciente...');
      const mostRecent = [...projects].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      setCurrentProject(mostRecent);
    }
  }, [projects.length, currentProject, isLoadingProjects]); // ✅ Solo cuando cambia la CANTIDAD

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
    } catch (error) {
      console.error('Error creando proyecto:', error);
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