// src/components/AccountSettings.tsx

import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock, User, CreditCard, Calendar, AlertTriangle } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { PLANS } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AccountSettingsProps {
  onClose: () => void;
}

export const AccountSettings = ({ onClose }: AccountSettingsProps) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  const { user, cancelSubscription, getRemainingDays } = useUserStore();
  const { token } = useAuthStore();
  const { toast } = useToast();
  
  const remainingDays = getRemainingDays();

  const currentPlan = PLANS.find(p => p.id === user?.plan) || PLANS[0];

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
        duration: 4000
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
        duration: 4000
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      console.log('🔐 Enviando solicitud de cambio de contraseña...');
      console.log('URL:', `${import.meta.env.VITE_API_URL}/api/auth/change-password`);
      console.log('Token presente:', !!token);
      console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
      
      // Llamada REAL a la API para cambiar contraseña
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      console.log('📡 Respuesta recibida:', response.status, response.statusText);

      // Verificar si la respuesta es JSON válido
      const contentType = response.headers.get('content-type');
      console.log('📄 Content-Type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('❌ Respuesta no es JSON:', textResponse);
        console.error('❌ Status completo:', response.status, response.statusText);
        console.error('❌ Headers completos:', Object.fromEntries(response.headers.entries()));
        
        // Si es un error de servidor HTML, mostrar info más específica
        if (textResponse.includes('<!DOCTYPE html>') || textResponse.includes('<html>')) {
          throw new Error(`Error del servidor (${response.status}): El endpoint no existe o hay un problema de configuración`);
        } else {
          throw new Error(`Respuesta inválida del servidor: ${textResponse.substring(0, 200)}`);
        }
      }

      const data = await response.json();

      if (!response.ok) {
        // Manejar errores específicos del servidor
        if (response.status === 401) {
          throw new Error('La contraseña actual es incorrecta');
        } else if (response.status === 400) {
          throw new Error(data.message || 'Datos de contraseña inválidos');
        } else {
          throw new Error(data.message || 'Error del servidor al cambiar contraseña');
        }
      }

      // Si todo salió bien
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña se ha cambiado exitosamente",
        duration: 4000 // Auto-eliminar después de 4 segundos
      });

    } catch (error) {
      setIsChangingPassword(false);
      
      // Manejar diferentes tipos de errores
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast({
          title: "Error de conexión",
          description: "No se pudo conectar al servidor. Verifica tu conexión.",
          variant: "destructive",
          duration: 5000 // Auto-eliminar después de 5 segundos
        });
      } else {
        toast({
          title: "Error al cambiar contraseña",
          description: error instanceof Error ? error.message : "Error desconocido",
          variant: "destructive",
          duration: 6000 // Auto-eliminar después de 6 segundos
        });
      }
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Configuración de Cuenta</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Account Info */}
          <Card className="p-4 bg-gray-800/50 border-gray-700">
            <h3 className="font-semibold mb-4 flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Información de la cuenta</span>
            </h3>
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-gray-400">Email</Label>
                <div className="text-sm">{user?.email}</div>
              </div>
              
              <div>
                <Label className="text-sm text-gray-400">Plan actual</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={`${
                    currentPlan.popular ? 'bg-gradient-to-r from-purple-600 to-pink-600' :
                    currentPlan.recommended ? 'bg-gradient-to-r from-blue-600 to-cyan-600' :
                    currentPlan.enterprise ? 'bg-gradient-to-r from-yellow-600 to-orange-600' :
                    'bg-gray-600'
                  }`}>
                    {currentPlan.name}
                  </Badge>
                  <span className="text-sm text-gray-400">
                    €{currentPlan.price}/mes
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-400">Uso este mes</Label>
                <div className="text-sm">
                  {(user?.imagesUsedThisMonth || 0)} de {currentPlan.images} imágenes
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    style={{ 
                      width: `${Math.min(100, ((user?.imagesUsedThisMonth || 0) / currentPlan.images) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Change Password */}
          <Card className="p-4 bg-gray-800/50 border-gray-700">
            <h3 className="font-semibold mb-4 flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>Cambiar contraseña</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="current-password">Contraseña actual</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-gray-800 border-gray-600 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="new-password">Nueva contraseña</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-gray-800 border-gray-600 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-gray-800 border-gray-600 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                onClick={handlePasswordChange}
                disabled={!currentPassword || !newPassword || !confirmPassword || isChangingPassword}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isChangingPassword ? 'Cambiando...' : 'Cambiar contraseña'}
              </Button>
            </div>
          </Card>

          {/* Subscription Management */}
          <Card className="p-4 bg-gray-800/50 border-gray-700">
            <h3 className="font-semibold mb-4 flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Suscripción</span>
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Plan actual</span>
                <Badge className={`${
                  currentPlan.popular ? 'bg-gradient-to-r from-purple-600 to-pink-600' :
                  currentPlan.recommended ? 'bg-gradient-to-r from-blue-600 to-cyan-600' :
                  currentPlan.enterprise ? 'bg-gradient-to-r from-yellow-600 to-orange-600' :
                  'bg-gray-600'
                }`}>
                  {currentPlan.name}
                </Badge>
              </div>
              
              {user?.plan !== 'free' && (
                <>
                  <div className="flex items-center justify-between">
                    <span>Precio</span>
                    <span className="font-medium">€{currentPlan.price}/mes</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Estado</span>
                    <Badge variant="outline" className={
                      user?.subscriptionStatus === 'active' ? 'text-green-400 border-green-400' :
                      user?.subscriptionStatus === 'cancelled' ? 'text-red-400 border-red-400' :
                      'text-yellow-400 border-yellow-400'
                    }>
                      {user?.subscriptionStatus === 'active' ? 'Activa' :
                       user?.subscriptionStatus === 'cancelled' ? 'Cancelada' : 'Pendiente'}
                    </Badge>
                  </div>

                  {/* Días restantes - Solo para planes premium */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-purple-400" />
                      <span>Días restantes</span>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${
                        remainingDays <= 7 ? 'text-red-400' :
                        remainingDays <= 15 ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {remainingDays} días
                      </div>
                      {remainingDays <= 7 && remainingDays > 0 && (
                        <div className="text-xs text-red-400">¡Próximo a vencer!</div>
                      )}
                      {remainingDays === 0 && (
                        <div className="text-xs text-red-400">Vencido</div>
                      )}
                    </div>
                  </div>

                  {/* Fecha de renovación/vencimiento */}
                  {user?.subscriptionEndDate && (
                    <div className="text-xs text-gray-400 mt-2 p-2 bg-gray-700/50 rounded">
                      <div className="flex items-center justify-between">
                        <span>
                          {user.subscriptionStatus === 'active' ? 'Se renueva el:' : 'Vence el:'}
                        </span>
                        <span>
                          {new Date(user.subscriptionEndDate).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long', 
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Plan Free - Sin botón de cancelar */}
              {user?.plan === 'free' && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Eye className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-400">Plan de Demostración</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Actualiza tu plan para acceder a todas las funciones y generar imágenes.
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-gray-700 space-y-2">
                <Button variant="outline" className="w-full" onClick={() => window.location.href = '/plans'}>
                  {user?.plan === 'free' ? 'Elegir Plan Premium' : 'Cambiar Plan'}
                </Button>
                
                {/* Botón de cancelar - Solo para planes premium activos */}
                {user?.plan !== 'free' && user?.subscriptionStatus === 'active' && (
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={isCancelling}
                  >
                    {isCancelling ? 'Cancelando...' : 'Cancelar Suscripción'}
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Confirmación de cancelación */}
          {showCancelConfirm && (
            <Card className="p-4 bg-red-900/20 border-red-500/30">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <h4 className="font-semibold text-red-400">¿Confirmar cancelación?</h4>
              </div>
              <p className="text-sm text-gray-300 mb-4">
                Tu plan se convertirá a Free inmediatamente y perderás acceso a todas las funciones premium. 
                Esta acción no se puede deshacer.
              </p>
              <div className="flex space-x-2">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={async () => {
                    setIsCancelling(true);
                    try {
                      cancelSubscription();
                      toast({
                        title: "Suscripción cancelada",
                        description: "Tu plan ha sido cancelado. Ahora tienes el plan Free.",
                        variant: "destructive",
                        duration: 6000 // Auto-eliminar después de 6 segundos
                      });
                      setShowCancelConfirm(false);
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "No se pudo cancelar la suscripción. Inténtalo de nuevo.",
                        variant: "destructive",
                        duration: 5000 // Auto-eliminar después de 5 segundos
                      });
                    } finally {
                      setIsCancelling(false);
                    }
                  }}
                  disabled={isCancelling}
                >
                  Sí, cancelar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCancelConfirm(false)}
                >
                  No, mantener
                </Button>
              </div>
            </Card>
          )}

          {/* Close Button */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};