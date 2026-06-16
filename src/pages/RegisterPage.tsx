// src/pages/RegisterPage.tsx

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

// (El 'formSchema' es el mismo de antes)
const formSchema = z.object({
  email: z.string().email({
    message: "Por favor, introduce un email válido.",
  }),
  password: z.string().min(6, {
    message: "La contraseña debe tener al menos 6 caracteres.",
  }),
});

// --- EL COMPONENTE ---
const RegisterPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { setToken } = useAuthStore();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  // (La función 'onSubmit' es la misma de antes para email/pass)
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    console.log("Enviando a la API (Email/Pass):", values);
    try {
      // --- ¡¡AQUÍ ESTÁ LA CORRECCIÓN!! ---
      // Antes apuntaba a 8080 (el frontend), ahora a 8081 (el backend)
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/api/auth/register`,
        values
      );
      // --- FIN DE LA CORRECCIÓN ---

      console.log("Respuesta de la API:", response.data);
      toast({
        title: "¡Cuenta Creada!",
        description: `Bienvenido, ${response.data.email}. Redirigiendo al chat...`,
      });
      // Si la respuesta incluye token, logueamos directamente
      if (response.data.token) {
        setToken(response.data.token);
        navigate("/chat");
      } else {
        navigate("/login");
      }
    } catch (error: any) {
      console.error("Error en el registro:", error);
      setIsLoading(false);
      let errorMessage = "No se pudo crear la cuenta. Inténtalo de nuevo.";
      // Ahora sí leerá el error real que viene del backend (ej: "Email ya en uso")
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      toast({
        title: "Error en el registro",
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
          <h1 className="text-3xl font-bold">Crear una cuenta</h1>
          <p className="text-gray-400">
            ¿Ya tienes una?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>

        {/* --- GOOGLE OAUTH ACTIVADO --- */}
        <div className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full bg-transparent text-white hover:bg-white/10"
            asChild
          >
            <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/api/auth/google`}>
              <span className="mr-2">G</span> Continuar con Google
            </a>
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


        {/* (Formulario de email/pass) */}
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
              {isLoading ? "Creando cuenta..." : "Empezar Gratis"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default RegisterPage;