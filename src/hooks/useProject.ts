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
    
    // ✅ CASO 1: Hay proyectos pero ninguno seleccionado → Seleccionar el más reciente
    if (projects.length > 0 && !currentProject) {
      console.log('📁 Seleccionando proyecto más reciente...');
      const mostRecent = [...projects].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      setCurrentProject(mostRecent);
      console.log('✅ Proyecto seleccionado:', mostRecent.name);
    // ✅ CASO 2: El proyecto actual fue eliminado → Seleccionar otro
    else if (projects.length > 0 && currentProject && !projects.find(p => p.id === currentProject.id)) {
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