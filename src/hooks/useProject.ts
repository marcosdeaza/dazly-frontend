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

  // ✅ SIEMPRE mantener un proyecto activo
  useEffect(() => {
    // Esperar a que termine de cargar proyectos del servidor
    if (isLoadingProjects) return;
    
    // ✅ CASO 1: No hay proyectos → Crear uno nuevo
    if (projects.length === 0) {
      console.log('📁 No hay proyectos, creando uno nuevo...');
      
      const defaultProject: Project = {
        id: crypto.randomUUID(),
        name: 'Proyecto ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        description: '',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      addProject(defaultProject).then((serverProject) => {
        if (serverProject) {
          console.log('✅ Proyecto creado en servidor:', serverProject.id);
          setCurrentProject(serverProject);
        }
      }).catch((error) => {
        console.error('Error creando proyecto:', error);
        setCurrentProject(defaultProject);
      });
    } 
    // ✅ CASO 2: Hay proyectos pero ninguno seleccionado → Seleccionar el más reciente
    else if (!currentProject) {
      console.log('📁 Seleccionando proyecto más reciente...');
      const mostRecent = [...projects].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      setCurrentProject(mostRecent);
      console.log('✅ Proyecto seleccionado:', mostRecent.name);
    }
    // ✅ CASO 3: El proyecto actual fue eliminado → Seleccionar otro
    else if (currentProject && !projects.find(p => p.id === currentProject.id)) {
      console.log('⚠️ Proyecto actual fue eliminado, seleccionando otro...');
      if (projects.length > 0) {
        const firstAvailable = projects[0];
        setCurrentProject(firstAvailable);
        console.log('✅ Nuevo proyecto seleccionado:', firstAvailable.name);
      }
    }
  }, [projects, projects.length, currentProject, isLoadingProjects, addProject, setCurrentProject]);

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