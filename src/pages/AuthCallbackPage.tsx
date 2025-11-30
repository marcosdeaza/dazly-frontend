import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore'; // <-- 1. Importamos el "cerebro"

// Este componente es "invisible". Solo hace su magia y desaparece.
const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 2. Traemos la función "setToken" de nuestro cerebro
  const setToken = useAuthStore((state) => state.setToken);

  useEffect(() => {
    // 1. Coge el "token" de la URL
    const token = searchParams.get('token');

    if (token) {
      console.log("Token atrapado, pasando al 'cerebro' (Zustand)...");
      
      // 3. ¡LE DAMOS EL TOKEN AL CEREBRO!
      // Esto hace 3 cosas:
      //   a) Guarda el token en el estado
      //   b) Decodifica el token y guarda los datos del usuario (email, ID)
      //   c) Persiste todo en localStorage
      setToken(token);

      // (Ya no necesitamos esta línea:)
      // localStorage.setItem('dazly_token', token);

      // 4. Redirigimos al usuario al Dashboard
      navigate('/', { replace: true });

    } else {
      // Si no hay token, algo salió mal. Lo mandamos al login.
      console.error("No se encontró token en el callback.");
      navigate('/login', { replace: true });
    }
    
    // 4. Añadimos 'setToken' a las dependencias del useEffect
  }, [searchParams, navigate, setToken]);

  // Mientras hace la magia, mostramos un "Cargando..."
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      Redirigiendo...
    </div>
  );
};

export default AuthCallbackPage;