// src/pages/PlansPage.tsx

import React, { useState, useEffect } from 'react';
import { Check, Crown, Zap, Rocket, Star, Building2, ArrowLeft, Eye, Sparkles } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { useUserStore } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { PLANS } from '@/types';
import { useNavigate, useSearchParams } from 'react-router-dom';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const PlanIcon = ({ planId }: { planId: string }) => {
  switch (planId) {
    case 'free': return <Eye className="h-6 w-6" />;
    case 'pulse': return <Sparkles className="h-6 w-6" />;
    case 'flow': return <Crown className="h-6 w-6" />;
    case 'summit': return <Rocket className="h-6 w-6" />;
    case 'peak': return <Star className="h-6 w-6" />;
    case 'infinity': return <Building2 className="h-6 w-6" />;
    default: return <Eye className="h-6 w-6" />;
  }
};

const PlansPage = () => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const { user, updateUserPlan, syncCredits } = useUserStore();
  const { token } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  // ✅ DETECTAR PAGO EXITOSO Y ACTUALIZAR PLAN AUTOMÁTICAMENTE
  useEffect(() => {
    const verifyPayment = async () => {
      const success = searchParams.get('success');
      const sessionId = searchParams.get('session_id');

      if (success === 'true' && sessionId && token) {
        console.log('💳 Pago exitoso detectado! Session ID:', sessionId);
        
        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
          
          // Llamar al endpoint de verificación
          const response = await fetch(`${apiUrl}/api/stripe/verify-session`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ sessionId })
          });

          const data = await response.json();

          if (response.ok && data.success) {
            console.log('✅ Plan actualizado exitosamente:', data.user);
            
            // Recargar datos del usuario (sincronizar créditos)
            await syncCredits();
            
            // Mostrar mensaje de bienvenida profesional
            const planNames: Record<string, string> = {
              pulse: 'Pulse',
              flow: 'Flow',
              summit: 'Summit',
              peak: 'Peak',
              infinity: 'Infinity'
            };
            
            const planName = planNames[data.user.plan] || data.user.plan.toUpperCase();
            
            toast({
              title: `¡Bienvenido a Plan ${planName}! 🎉`,
              description: `Tienes ${data.user.imagesRemaining} créditos listos para crear.`,
              duration: 6000
            });

            // Limpiar URL (quitar parámetros de Stripe)
            window.history.replaceState({}, '', '/plans');
          } else {
            // Solo mostrar error en consola, no molestar al usuario
            console.error('❌ Error verificando pago:', data.error);
          }

        } catch (error) {
          // Solo log, sin notificación molesta
          console.error('❌ Error verificando pago:', error);
        }
      }

      // Detectar cancelación - solo limpiar URL, sin notificación molesta
      const canceled = searchParams.get('canceled');
      if (canceled === 'true') {
        window.history.replaceState({}, '', '/plans');
      }
    };

    verifyPayment();
  }, [searchParams, token, toast, syncCredits]);

  const handleSubscribe = async (planId: string, price: number) => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (planId === 'free') {
      toast({
        title: "Ya estás en el plan Free",
        description: "Elige un plan premium para obtener más características."
      });
      return;
    }

    setLoadingPlan(planId);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
      const plan = PLANS.find(p => p.id === planId);
      
      if (!plan) {
        throw new Error('Plan no encontrado');
      }

      console.log(`💳 Iniciando pago con Stripe: ${plan.name} (${plan.images} créditos)`);

      // ✅ Crear sesión de Stripe Checkout
      const response = await fetch(`${apiUrl}/api/stripe/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planId })
      });

      const data = await response.json();

      if (response.ok && data.success && data.url) {
        console.log('✅ Sesión de Stripe creada, redirigiendo...');
        
        // ✅ Redirigir a Stripe Checkout (página de pago)
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Error creando sesión de pago');
      }

    } catch (error) {
      console.error('❌ Error iniciando pago:', error);
      setLoadingPlan(null);
      toast({
        title: "Error al procesar el pago",
        description: error instanceof Error ? error.message : "Inténtalo de nuevo en unos momentos.",
        variant: "destructive"
      });
    }
  };

  const currentPlan = PLANS.find(p => p.id === user?.plan) || PLANS[0];

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200 hover:bg-purple-500/10 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver</span>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Elige tu plan perfecto
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Desbloquea todo el potencial de la IA generativa. Desde creadores individuales hasta equipos empresariales.
          </p>
        </div>

        {/* Current Plan Info */}
        {user && (
          <div className="text-center mb-8">
            <Badge className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600">
              Plan actual: {currentPlan.name} • {user.imagesRemaining} imágenes restantes
            </Badge>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PLANS.map((plan, index) => (
            <Card 
              key={plan.id}
              className={`relative p-6 bg-gray-900/50 backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${
                plan.popular 
                  ? 'border-purple-500 ring-2 ring-purple-500/20' 
                  : plan.recommended
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : plan.enterprise
                  ? 'border-yellow-500 ring-2 ring-yellow-500/20'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Plan Badges */}
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1">
                  Más Vendido
                </Badge>
              )}
              {plan.recommended && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-cyan-600 px-3 py-1">
                  Más Rentable
                </Badge>
              )}
              {plan.enterprise && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-600 to-orange-600 px-3 py-1">
                  Profesional
                </Badge>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                  plan.popular ? 'bg-gradient-to-r from-purple-600 to-pink-600' :
                  plan.recommended ? 'bg-gradient-to-r from-blue-600 to-cyan-600' :
                  plan.enterprise ? 'bg-gradient-to-r from-yellow-600 to-orange-600' :
                  'bg-gray-700'
                }`}>
                  <PlanIcon planId={plan.id} />
                </div>
                
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                
                <div className="mb-4">
                  {plan.price === 0 ? (
                    <span className="text-4xl font-bold">Gratis</span>
                  ) : (
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold">€{plan.price}</span>
                      <span className="text-gray-400 ml-2">/mes</span>
                    </div>
                  )}
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-300">{plan.images}</div>
                    <div className="text-xs text-purple-400/70">Imágenes/mes</div>
                  </div>
                  <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-pink-300">
                      {plan.maxProjects === 0 ? '0' : plan.maxProjects}
                    </div>
                    <div className="text-xs text-pink-400/70">Proyectos</div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3">
                    <Check className={`h-5 w-5 flex-shrink-0 ${
                      plan.popular ? 'text-purple-400' :
                      plan.recommended ? 'text-blue-400' :
                      plan.enterprise ? 'text-yellow-400' :
                      'text-green-400'
                    }`} />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => handleSubscribe(plan.id, plan.price)}
                disabled={loadingPlan === plan.id}
                className={`w-full h-12 text-base font-semibold transition-all ${
                  user?.plan === plan.id && plan.id !== 'free'
                    ? 'bg-gray-600 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                    : plan.recommended
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                    : plan.enterprise
                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {loadingPlan === plan.id ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Procesando...</span>
                  </div>
                ) : user?.plan === plan.id && plan.id !== 'free' ? (
                  user.imagesRemaining <= 0 ? 'Renovar Créditos' : 'Plan Actual'
                ) : plan.price === 0 ? (
                  'Empezar Gratis'
                ) : (
                  `Actualizar a ${plan.name}`
                )}
              </Button>

              {/* Additional Info */}
              {plan.id !== 'free' && (
                <p className="text-xs text-gray-500 text-center mt-4">
                  {plan.id === 'free' ? 'Sin compromiso' : 'Cancela en cualquier momento • Soporte 24/7'}
                </p>
              )}
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Preguntas Frecuentes</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 bg-gray-900/50 border-white/10">
              <h3 className="font-semibold mb-3">¿Puedo cambiar de plan en cualquier momento?</h3>
              <p className="text-gray-400 text-sm">
                Sí, puedes actualizar o degradar tu plan cuando quieras. Los cambios se aplicarán en el próximo ciclo de facturación.
              </p>
            </Card>
            
            <Card className="p-6 bg-gray-900/50 border-white/10">
              <h3 className="font-semibold mb-3">¿Las imágenes no utilizadas se acumulan?</h3>
              <p className="text-gray-400 text-sm">
                No, las imágenes se reinician cada mes. Te recomendamos usar todas tus imágenes antes del final del ciclo.
              </p>
            </Card>
            
            <Card className="p-6 bg-gray-900/50 border-white/10">
              <h3 className="font-semibold mb-3">¿Hay descuentos por pago anual?</h3>
              <p className="text-gray-400 text-sm">
                Sí, ofrecemos 2 meses gratis con el pago anual en todos los planes premium. Contáctanos para más detalles.
              </p>
            </Card>
            
            <Card className="p-6 bg-gray-900/50 border-white/10">
              <h3 className="font-semibold mb-3">¿Necesito conocimientos técnicos?</h3>
              <p className="text-gray-400 text-sm">
                No, Dazly está diseñado para ser intuitivo. Solo describe lo que quieres y nuestra IA se encarga del resto.
              </p>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-400 mb-6">
            ¿Tienes más preguntas? Estamos aquí para ayudarte.
          </p>
          <Button 
            variant="outline" 
            className="px-8 py-3"
            onClick={() => window.open('https://ig.me/m/dazly.art', '_blank')}
          >
            Contactar Soporte
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlansPage;