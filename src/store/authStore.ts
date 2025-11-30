// src/store/authStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import { useUserStore } from './userStore';
import axios from 'axios';

// 1. Definimos el "tipo" de datos que guardará nuestro cerebro
interface User {
  userId: string;
  email: string;
  plan?: string;
  imagesRemaining?: number;
  imagesUsedThisMonth?: number;
  subscriptionStatus?: string;
  iat?: number; // "Issued At" (cuándo se creó el token)
  exp?: number; // "Expires" (cuándo caduca)
}

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string) => void; // Función para guardar el token
  logout: () => void;                // Función para borrar todo
}

// 2. Creamos el "store" (el cerebro)
export const useAuthStore = create<AuthState>()(
  // Solo persistimos el TOKEN, no los datos del usuario
  persist(
    (set) => ({
      // --- Estado Inicial ---
      token: null,
      user: null,

      // --- Acciones (las "neuronas") ---
      
      // Cuando nos logueamos (o atrapamos el token), llamamos a esto
      setToken: async (token: string) => {
        try {
          // ✅ Guardar token inmediatamente
          set({ token: token });

          console.log('🔑 Token guardado, cargando datos del usuario...');

          // ✅ SIEMPRE cargar datos completos desde el servidor
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
          const response = await axios.get(`${apiUrl}/api/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data.user) {
            const serverUser = response.data.user;
            
            // Actualizar userStore con datos del servidor (fuente de verdad)
            const userStoreData = {
              id: serverUser.id,
              userId: serverUser.id,
              email: serverUser.email,
              plan: serverUser.plan || 'free',
              imagesRemaining: serverUser.imagesRemaining || 0,
              imagesUsedThisMonth: serverUser.imagesUsedThisMonth || 0,
              subscriptionStatus: serverUser.subscriptionStatus || 'inactive',
              subscriptionStartDate: serverUser.subscriptionStartDate,
              subscriptionEndDate: serverUser.subscriptionEndDate,
              createdAt: new Date(serverUser.createdAt)
            };
            
            // Actualizar userStore (esto también carga proyectos automáticamente)
            const { setUser } = useUserStore.getState();
            setUser(userStoreData);
            
            console.log('✅ Usuario cargado desde servidor:', serverUser.email);
            console.log('   Plan:', serverUser.plan);
            console.log('   Créditos:', serverUser.imagesRemaining);
            console.log('   Estado:', serverUser.subscriptionStatus);
          }

        } catch (error) {
          console.error("❌ Error cargando datos del usuario:", error);
          
          // Si falla, limpiar todo (NO usar datos del JWT obsoletos)
          set({ token: null, user: null });
          const { clearUserData } = useUserStore.getState();
          clearUserData();
          
          throw error; // Propagar el error para que se maneje arriba
        }
      },

      // Cuando el usuario le da a "Logout"
      logout: () => {
        // Limpiar userStore también
        const { clearUserData } = useUserStore.getState();
        clearUserData();
        
        set({ token: null, user: null });
      },
    }),
    {
      name: 'dazly-auth-storage', // Nombre del "bolsillo" en localStorage
      storage: createJSONStorage(() => localStorage), // Le decimos que use localStorage
    }
  )
);