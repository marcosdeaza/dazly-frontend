// src/store/userStore.ts

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
  decrementImages: () => void; // Deprecado
  updateCreditsFromServer: (imagesRemaining: number) => void; // ✅ NUEVO
  syncCredits: () => Promise<void>; // ✨ NUEVO: Sincronizar créditos con servidor
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

// Helper para crear headers de autenticaciÃ³n
const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
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
    // ✨ NUEVO: Sincronizar créditos al iniciar sesión
    get().syncCredits();
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

  // ⚠️ DEPRECADO - No usar en frontend, el backend controla los créditos
  decrementImages: () => {
    console.warn('⚠️ decrementImages() está deprecado - Los créditos se actualizan desde el backend');
    // Función mantenida solo por compatibilidad
  },

  // ✅ NUEVO: Actualizar créditos desde respuesta del servidor
  updateCreditsFromServer: (imagesRemaining: number) => {
    const currentUser = get().user;
    if (currentUser) {
      console.log('💳 Actualizando créditos desde servidor:', imagesRemaining);
      set({
        user: {
          ...currentUser,
          imagesRemaining: imagesRemaining
        }
      });
    }
  },

  // ✨ NUEVO: Sincronizar créditos con el servidor (persistencia multi-dispositivo)
  syncCredits: async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
      const response = await axios.get(
        `${apiUrl}/api/user/sync-credits`,
        { headers: getAuthHeaders() }
      );

      const { credits } = response.data;
      const currentUser = get().user;

      if (currentUser) {
        console.log('🔄 Créditos sincronizados del servidor:', credits);
        
        set({
          user: {
            ...currentUser,
            imagesRemaining: credits.imagesRemaining,
            plan: credits.plan,
            subscriptionStatus: credits.subscriptionStatus,
            subscriptionEndDate: credits.subscriptionEnd ? new Date(credits.subscriptionEnd) : undefined
          }
        });

        // Si el plan cambió a free, mostrar notificación
        if (currentUser.plan !== 'free' && credits.plan === 'free') {
          console.log('⚠️ Plan expirado - Bajado a Free');
        }
      }
    } catch (error) {
      console.error('❌ Error sincronizando créditos:', error);
    }
  },

  // GUARDAR PROYECTO EN EL SERVIDOR
  addProject: async (project: Project) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
      const response = await axios.post(
        `${apiUrl}/api/projects`,
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

      console.log('âœ… Proyecto guardado en servidor:', serverProject.id);
      return projectWithMessages;
    } catch (error) {
      console.error('âŒ Error guardando proyecto en servidor:', error);
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
        `${apiUrl}/api/projects/${projectId}`,
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

      console.log('âœ… Proyecto actualizado en servidor:', projectId);
    } catch (error) {
      console.error('âŒ Error actualizando proyecto en servidor:', error);
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
        `${apiUrl}/api/projects/${projectId}`,
        { headers: getAuthHeaders() }
      );

      set(state => ({
        projects: state.projects.filter(p => p.id !== projectId),
        currentProject: state.currentProject?.id === projectId ? null : state.currentProject
      }));

      console.log('âœ… Proyecto eliminado del servidor:', projectId);
    } catch (error) {
      console.error('âŒ Error eliminando proyecto del servidor:', error);
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

  // GUARDAR MENSAJE EN EL SERVIDOR
  addMessageToCurrentProject: async (message: ChatMessage) => {
    const { currentProject } = get();
    if (!currentProject) {
      console.warn('âš ï¸ No hay proyecto actual para agregar mensaje');
      return;
    }

    console.log('ðŸ“¥ userStore recibiendo mensaje:', message);
    console.log('ðŸ–¼ï¸ userStore - imageUrl:', message.imageUrl);


    // Actualizar UI inmediatamente (optimistic update)
    const updatedProject = {
      ...currentProject,
      messages: [...currentProject.messages, message],
      updatedAt: new Date()
    };
    
    console.log('ðŸ“¦ Proyecto actualizado - Ãºltimo mensaje:', updatedProject.messages[updatedProject.messages.length - 1]);
    console.log('ðŸ–¼ï¸ Ãšltimo mensaje imageUrl:', updatedProject.messages[updatedProject.messages.length - 1].imageUrl);
    
    set(state => ({
      currentProject: updatedProject,
      projects: state.projects.map(p => 
        p.id === currentProject.id ? updatedProject : p
      )
    }));

    // NO guardar mensajes del usuario manualmente
    // Solo los guarda el backend cuando procesa la peticiÃ³n de AI
    console.log('âœ… Mensaje agregado localmente (se guardarÃ¡ con la respuesta de IA)');
  },

  // CARGAR PROYECTOS DEL SERVIDOR
  loadUserProjects: async () => {
    try {
      set({ isLoadingProjects: true });
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
      const response = await axios.get(
        `${apiUrl}/api/projects`,
        { headers: getAuthHeaders() }
      );

      const serverProjects = response.data.projects.map((p: any) => ({
        ...p,
        messages: (p.messages || []).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.createdAt || msg.timestamp),
          imageUrl: msg.imageUrl || undefined,
          imagePrompt: msg.imagePrompt || undefined,
          images: undefined
          })),
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt)
      }));
      
      console.log('âœ… Proyectos cargados del servidor:', serverProjects.length);
      console.log('ðŸ“Š Mensajes con imÃ¡genes encontrados:', 
        serverProjects.reduce((acc: number, p: any) => 
          acc + p.messages.filter((m: any) => m.imageUrl).length, 0
        )
      );

      set({ 
        projects: serverProjects,
        isLoadingProjects: false 
      });

      console.log('âœ… Proyectos cargados del servidor:', serverProjects.length);
    } catch (error) {
      console.error('âŒ Error cargando proyectos del servidor:', error);
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
        // ✅ NO persistir user, proyectos ni mensajes en localStorage
        // TODO viene del servidor (base de datos)
        // Solo guardar preferencias de UI si fuera necesario en el futuro
      })
    }
  )
);
