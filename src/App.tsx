// src/App.tsx

import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// --- Nuestras páginas ---
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AuthCallbackPage from './pages/AuthCallbackPage';
import ChatPage from './pages/ChatPage';
import PlansPage from './pages/PlansPage';
import AccountPage from './pages/AccountPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useUserStore } from './store/userStore';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient();

const App = () => {
  const { user, syncCredits } = useUserStore();
  const { token, setToken } = useAuthStore();

  // 🔥 CRÍTICO: Restaurar usuario desde token al cargar la app
  useEffect(() => {
    const restoreUserFromToken = async () => {
      if (token) {
        console.log('🔄 Restaurando sesión desde token...');
        console.log('   Token existe:', !!token);
        console.log('   Usuario actual:', user?.email || 'ninguno');
        
        try {
          // SIEMPRE restaurar desde servidor para tener datos frescos
          await setToken(token);
          console.log('✅ Sesión restaurada exitosamente');
        } catch (error) {
          console.error('❌ Error restaurando sesión:', error);
          // Si falla, intentar sincronizar créditos con el user existente
          if (user) {
            console.log('🔄 Intentando sincronizar con usuario existente...');
            await syncCredits();
          }
        }
      } else if (!token && !user) {
        console.log('ℹ️ Sin sesión activa');
      }
    };

    restoreUserFromToken();
  }, []); // Solo al montar el componente

  // 🔄 Sincronizar créditos al cargar la app (memoria multi-dispositivo)
  useEffect(() => {
    if (user) {
      console.log('🔄 Sincronizando créditos al iniciar app...');
      syncCredits();

      // 🔄 Sincronización periódica cada 5 minutos
      const intervalId = setInterval(() => {
        console.log('🔄 Sincronización automática de créditos...');
        syncCredits();
      }, 5 * 60 * 1000); // 5 minutos

      // Limpiar el intervalo cuando el componente se desmonte
      return () => clearInterval(intervalId);
    }
  }, [user?.id]); // Se ejecuta cuando cambia el usuario

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* --- RUTAS PÚBLICAS --- */}
            <Route path="/" element={<Index />} /> 
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login/callback" element={<AuthCallbackPage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            
            {/* --- RUTAS PROTEGIDAS --- */}
            <Route path="/chat" element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } />
            <Route path="/account" element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            } />
            
            {/* Esta es la ruta "catch-all" para errores 404 */}
            <Route path="*" element={<NotFound />} /> 
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;