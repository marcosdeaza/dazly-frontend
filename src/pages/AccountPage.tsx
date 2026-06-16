// src/pages/AccountPage.tsx

import React, { useState } from 'react';
import { 
  User, 
  CreditCard, 
  History, 
  Settings, 
  Download, 
  Trash2, 
  Edit2,
  Calendar,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PLANS } from '@/types';
import { AccountSettings } from '@/components/AccountSettings';
import { useNavigate } from 'react-router-dom';

const AccountPage = () => {
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const { user, projects } = useUserStore();
  const navigate = useNavigate();

  const currentPlan = PLANS.find(p => p.id === user?.plan) || PLANS[0];
  const usagePercentage = user ? ((user.imagesUsedThisMonth / currentPlan.images) * 100) : 0;
  
  // Mock data para el historial
  const billingHistory = [
    { id: 1, date: '2024-01-01', plan: 'Flow', amount: 9.99, status: 'paid' },
    { id: 2, date: '2023-12-01', plan: 'Flow', amount: 9.99, status: 'paid' },
    { id: 3, date: '2023-11-01', plan: 'Pulse', amount: 3.99, status: 'paid' },
  ];

  const totalImagesGenerated = projects.reduce((total, project) => {
    return total + project.messages.filter(msg => msg.role === 'assistant' && msg.imageUrl).length;
  }, 0);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" alt={user?.email} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-xl">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{user?.email}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={`${
                    currentPlan.popular ? 'bg-gradient-to-r from-purple-600 to-pink-600' :
                    currentPlan.recommended ? 'bg-gradient-to-r from-blue-600 to-cyan-600' :
                    currentPlan.enterprise ? 'bg-gradient-to-r from-yellow-600 to-orange-600' :
                    'bg-gray-600'
                  }`}>
                    Plan {currentPlan.name}
                  </Badge>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400">Miembro desde {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setShowAccountSettings(true)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Configuración</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="usage">Uso</TabsTrigger>
            <TabsTrigger value="billing">Facturación</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 bg-gray-900/50 border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Plan Actual</p>
                    <p className="text-2xl font-bold">{currentPlan.name}</p>
                    <p className="text-sm text-gray-400">€{currentPlan.price}/mes</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-purple-400" />
                </div>
              </Card>

              <Card className="p-6 bg-gray-900/50 border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Imágenes Restantes</p>
                    <p className="text-2xl font-bold">{user?.imagesRemaining || 0}</p>
                    <p className="text-sm text-gray-400">de {currentPlan.images}</p>
                  </div>
                  <ImageIcon className="h-8 w-8 text-blue-400" />
                </div>
              </Card>

              <Card className="p-6 bg-gray-900/50 border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Proyectos</p>
                    <p className="text-2xl font-bold">{projects.length}</p>
                    <p className="text-sm text-gray-400">creados</p>
                  </div>
                  <User className="h-8 w-8 text-green-400" />
                </div>
              </Card>

              <Card className="p-6 bg-gray-900/50 border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Generadas</p>
                    <p className="text-2xl font-bold">{totalImagesGenerated}</p>
                    <p className="text-sm text-gray-400">imágenes</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-yellow-400" />
                </div>
              </Card>
            </div>

            {/* Usage Progress */}
            <Card className="p-6 bg-gray-900/50 border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Uso este mes</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Imágenes utilizadas</span>
                  <span className="text-gray-400">
                    {user?.imagesUsedThisMonth || 0} / {currentPlan.images}
                  </span>
                </div>
                <Progress value={usagePercentage} className="h-3" />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>0</span>
                  <span>{currentPlan.images}</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage">
            <Card className="p-6 bg-gray-900/50 border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Estadísticas de Uso</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Este mes</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Imágenes generadas</span>
                      <span>{user?.imagesUsedThisMonth || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Imágenes restantes</span>
                      <span>{user?.imagesRemaining || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Proyectos activos</span>
                      <span>{projects.length}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Límites del plan</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Máximo imágenes/mes</span>
                      <span>{currentPlan.images}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Proyectos</span>
                      <span>Ilimitados</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Calidad</span>
                      <span>HD</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>


          {/* Billing Tab */}
          <TabsContent value="billing">
            <div className="space-y-6">
              <Card className="p-6 bg-gray-900/50 border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Suscripción Actual</h3>
                  <Button onClick={() => navigate('/plans')}>
                    Cambiar Plan
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Plan</p>
                    <p className="font-medium">{currentPlan.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Precio</p>
                    <p className="font-medium">€{currentPlan.price}/mes</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Próxima facturación</p>
                    <p className="font-medium">1 de febrero, 2024</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gray-900/50 border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Historial de Facturación</h3>
                <div className="space-y-4">
                  {billingHistory.map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{new Date(bill.date).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-400">Plan {bill.plan}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">€{bill.amount}</p>
                          <Badge variant="outline" className="text-green-400 border-green-400">
                            Pagado
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Account Settings Modal */}
      {showAccountSettings && (
        <AccountSettings onClose={() => setShowAccountSettings(false)} />
      )}
    </div>
  );
};

export default AccountPage;