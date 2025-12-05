// src/pages/LoginPage.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore"; 

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

// (El esquema de Zod)
const formSchema = z.object({
  email: z.string().email({
    message: "Por favor, introduce un email válido.",
  }),
  password: z.string().min(1, {
    message: "La contraseña es requerida.",
  }),
});

// --- EL COMPONENTE ---
const LoginPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const setToken = useAuthStore((state) => state.setToken); 

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  // (La función onSubmit para Email/Pass sigue igual)
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/api/auth/login`,
        values
      );
      const token = response.data.token;
      setToken(token); // ¡Se lo damos al "cerebro"!
      toast({
        title: "¡Bienvenido de vuelta!",
      });
      navigate("/chat");
    } catch (error: any) {
      setIsLoading(false);
      let errorMessage = "Credenciales incorrectas.";
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      toast({
        title: "Error al iniciar sesión",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }

  // --- RENDERIZADO (HTML) ---
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900/50 backdrop-blur-sm rounded-lg border border-white/10">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Iniciar Sesión</h1>
          <p className="text-gray-400">
            ¿No tienes una cuenta?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>

<<<<<<< HEAD
<<<<<<< HEAD
        {/* --- GOOGLE OAUTH ACTIVADO --- */}
=======
        {/* --- GOOGLE OAUTH TEMPORALMENTE DESHABILITADO --- */}
        {/* PARA HABILITAR: Cambiar false por true y configurar Google OAuth */}
        {/* Código original comentado para tu colega:
        <Button variant="outline" className="w-full bg-transparent text-white hover:bg-white/10" asChild>
          <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/api/auth/google`}>
            <span className="mr-2">G</span> Continuar con Google
          </a>
        </Button>
        */}
>>>>>>> db4ceb629c696e3718439846957596f2f57c766f
=======
        {/* --- GOOGLE OAUTH ACTIVADO --- */}
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
        <div className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full bg-transparent text-white hover:bg-white/10"
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
            asChild
          >
            <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/api/auth/google`}>
              <span className="mr-2">G</span> Continuar con Google
            </a>
<<<<<<< HEAD
=======
            onClick={() => {
              toast({
                title: "Login con Google no disponible",
                description: "Esta función estará disponible próximamente.",
                duration: 3000
              });
            }}
          >
            <span className="mr-2">G</span> Continuar con Google
>>>>>>> db4ceb629c696e3718439846957596f2f57c766f
=======
>>>>>>> 513b4d9ebe9f924ced5664f8b444c51364846368
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-900/50 px-2 text-gray-400">
                O continúa con
              </span>
            </div>
          </div>
        </div>
        {/* --- FIN DEL BLOQUE DE GOOGLE --- */}


        {/* (Formulario de Email/Pass) */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="tu@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full bg-gradient-accent text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Iniciar Sesión"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;