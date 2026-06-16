// src/store/userStore.ts - CORRECCIÓN

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Project, ChatMessage } from '@/types';
import axios from 'axios';

interface UserState {
  user: User | null;
  projects: Project[];
  currentProject: Project | null;
  isLoadingProjects: boolean;
  setUser: (user: User) => void;
  updateUserPlan: (plan: string, imagesRemaining: number) => void;
  cancelSubscription: () => void;
  getRemainingDays: () => number;
  decrementImages: () => void;
  addProject: (project: Project) => Promise<void>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  addMessageToCurrentProject: (message: ChatMessage) => Promise<void>;
  loadUserProjects: () => Promise<void>;
  clearUserData: () => void;
}

// Helper para obtener el token
const getAuthToken = (): string | null => {
  try {
    const authData = localStorage.getItem('dazly-auth-storage');
    if (authData) {
      const { state } = JSON.parse(authData);
      return state?.token || null;
    }
  } catch (error) {
    console.error('Error obteniendo token:', error);
  }
  return null;
};

// Helper para crear headers de autenticación
const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: Bearer  } : {};
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      projects: [],
      currentProject: null,
      isLoadingProjects: false,

  setUser: (user: User) => {
    set({ user });
    // Cargar proyectos del servidor cuando se establece el usuario
    get().loadUserProjects();
  },

  updateUserPlan: (plan: string, imagesRemaining: number) => {
    const currentUser = get().user;
    if (currentUser) {
      const now = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      
      set({
        user: {
          ...currentUser,
          plan,
          imagesRemaining,
          subscriptionStatus: 'active',
          subscriptionStartDate: now,
          subscriptionEndDate: endDate
        }
      });
    }
  },

  cancelSubscription: () => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: {
          ...currentUser,
          plan: 'free',
          imagesRemaining: 0,
          subscriptionStatus: 'cancelled',
          subscriptionEndDate: new Date()
        }
      });
    }
  },

  getRemainingDays: () => {
    const currentUser = get().user;
    if (!currentUser || !currentUser.subscriptionEndDate || currentUser.plan === 'free') {
      return 0;
    }
    
    const now = new Date();
    const endDate = new Date(currentUser.subscriptionEndDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  },

  decrementImages: () => {
    const currentUser = get().user;
    if (currentUser && currentUser.imagesRemaining > 0) {
      set({
        user: {
          ...currentUser,
          imagesRemaining: currentUser.imagesRemaining - 1,
          imagesUsedThisMonth: currentUser.imagesUsedThisMonth + 1
        }
      });
    }
  },

  // GUARDAR PROYECTO EN EL SERVIDOR
  addProject: async (project: Project) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
      const response = await axios.post(
        ${apiUrl}/api/projects,
        {
          name: project.name,
          description: project.description
        },
        { headers: getAuthHeaders() }
      );

      const serverProject = response.data.project;
      
      // Actualizar con el proyecto del servidor (que tiene el ID correcto)
      const projectWithMessages = {
        ...serverProject,
        messages: project.messages || [],
        createdAt: new Date(serverProject.createdAt),
        updatedAt: new Date(serverProject.updatedAt)
      };

      set(state => ({
        projects: [...state.projects, projectWithMessages]
      }));

      console.log('✅ Proyecto guardado en servidor:', serverProject.id);
      return projectWithMessages;
    } catch (error) {
      console.error('❌ Error guardando proyecto en servidor:', error);
      // Fallback: guardar solo localmente si falla
      set(state => ({
        projects: [...state.projects, project]
      }));
      throw error;
    }
  },

  // ACTUALIZAR PROYECTO EN EL SERVIDOR
  updateProject: async (projectId: string, updates: Partial<Project>) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
      await axios.put(
        ${apiUrl}/api/projects/,
        {
          name: updates.name,
          description: updates.description
        },
        { headers: getAuthHeaders() }
      );

      set(state => ({
        projects: state.projects.map(p => 
          p.id === projectId ? { ...p, ...updates, updatedAt: new Date() } : p
        ),
        currentProject: state.currentProject?.id === projectId 
          ? { ...state.currentProject, ...updates, updatedAt: new Date() }
          : state.currentProject
      }));

      console.log('✅ Proyecto actualizado en servidor:', projectId);
    } catch (error) {
      console.error('❌ Error actualizando proyecto en servidor:', error);
      // Actualizar localmente aunque falle el servidor
      set(state => ({
        projects: state.projects.map(p => 
          p.id === projectId ? { ...p, ...updates, updatedAt: new Date() } : p
        ),
        currentProject: state.currentProject?.id === projectId 
          ? { ...state.currentProject, ...updates, updatedAt: new Date() }
          : state.currentProject
      }));
    }
  },

  // ELIMINAR PROYECTO DEL SERVIDOR
  deleteProject: async (projectId: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
      await axios.delete(
        ${apiUrl}/api/projects/,
        { headers: getAuthHeaders() }
      );

      set(state => ({
        projects: state.projects.filter(p => p.id !== projectId),
        currentProject: state.currentProject?.id === projectId ? null : state.currentProject
      }));

      console.log('✅ Proyecto eliminado del servidor:', projectId);
    } catch (error) {
      console.error('❌ Error eliminando proyecto del servidor:', error);
      // Eliminar localmente aunque falle el servidor
      set(state => ({
        projects: state.projects.filter(p => p.id !== projectId),
        currentProject: state.currentProject?.id === projectId ? null : state.currentProject
      }));
    }
  },

  setCurrentProject: (project: Project | null) => {
    set({ currentProject: project });
  },

  // GUARDAR MENSAJE EN EL SERVIDOR - SIN GUARDAR IMÁGENES BASE64
  addMessageToCurrentProject: async (message: ChatMessage) => {
    const { currentProject } = get();
    if (!currentProject) {
      console.warn('⚠️ No hay proyecto actual para agregar mensaje');
      return;
    }

    console.log('📥 userStore recibiendo mensaje:', message);
    console.log('🖼️ userStore - imageUrl:', message.imageUrl);

    // ✅ CORRECCIÓN: Crear mensaje SIN las imágenes base64 pesadas
    const lightMessage = {
      ...message,
      // Si hay imágenes adjuntas, solo guardar metadata ligera
      images: message.images?.map(img => ({
        id: img.id,
        name: img.name,
        size: img.size,
        type: img.type,
        // NO guardar url ni preview (son base64 pesados)
      }))
    };

    // Actualizar UI inmediatamente (optimistic update)
    const updatedProject = {
      ...currentProject,
      messages: [...currentProject.messages, lightMessage],
      updatedAt: new Date()
    };
    
    set(state => ({
      currentProject: updatedProject,
      projects: state.projects.map(p => 
        p.id === currentProject.id ? updatedProject : p
      )
    }));

    console.log('✅ Mensaje agregado localmente (se guardará con la respuesta de IA)');
  },

  // CARGAR PROYECTOS DEL SERVIDOR
  loadUserProjects: async () => {
    try {
      set({ isLoadingProjects: true });
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
      const response = await axios.get(
        ${apiUrl}/api/projects,
        { headers: getAuthHeaders() }
      );

      const serverProjects = response.data.projects.map((p: any) => ({
        ...p,
        messages: (p.messages || []).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.createdAt || msg.timestamp),
          imageUrl: msg.imageUrl || undefined,
          imagePrompt: msg.imagePrompt || undefined,
          // NO cargar imágenes adjuntas pesadas
          images: undefined
        })),
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt)
      }));
      
      console.log('✅ Proyectos cargados del servidor:', serverProjects.length);

      set({ 
        projects: serverProjects,
        isLoadingProjects: false 
      });

    } catch (error) {
      console.error('❌ Error cargando proyectos del servidor:', error);
      set({ isLoadingProjects: false });
    }
  },

  clearUserData: () => {
    set({
      user: null,
      projects: [],
      currentProject: null,
      isLoadingProjects: false
    });
  }
    }),
    {
      name: 'dazly-user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        // ✅ CORRECCIÓN: NO guardar proyectos en localStorage
        // Los proyectos se cargan desde el servidor
        projects: [],
        currentProject: null
      })
    }
  )
);
