// src/types/index.ts

export interface User {
  userId: string;
  email: string;
  plan: string;
  imagesRemaining: number;
  imagesUsedThisMonth: number;
  subscriptionStatus: string;
  subscriptionEndDate?: Date;
  subscriptionStartDate?: Date;
  iat?: number;
  exp?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  imagePrompt?: string;
  images?: Array<{
    id: string;
    url: string;
    preview?: string;
    name: string;
    size: number;
    type: string;
  }>;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  images: number;
  features: string[];
  popular?: boolean;
  recommended?: boolean;
  enterprise?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    images: 0,
    features: ['Plan de demostración', 'Funciones limitadas', 'Actualiza para usar', 'Solo navegación']
  },
  {
    id: 'pulse',
    name: 'Pulse',
    price: 3.99,
    images: 50,
    features: ['50 imágenes al mes', 'Generación avanzada', 'Calidad HD', 'Soporte prioritario']
  },
  {
    id: 'flow',
    name: 'Flow',
    price: 9.99,
    images: 150,
    features: ['150 imágenes al mes', 'Edición avanzada', 'Calidad 4K', 'Proyectos ilimitados', 'Sin marca de agua'],
    popular: true
  },
  {
    id: 'summit',
    name: 'Summit',
    price: 19.99,
    images: 350,
    features: ['350 imágenes al mes', 'IA premium', 'Exportación sin límites', 'API access', 'Soporte 24/7'],
    recommended: true
  },
  {
    id: 'peak',
    name: 'Peak',
    price: 39.99,
    images: 700,
    features: ['700 imágenes al mes', 'Funciones experimentales', 'Renderizado ultra-rápido', 'Colaboración en equipo']
  },
  {
    id: 'infinity',
    name: 'Infinity',
    price: 79.99,
    images: 1500,
    features: ['1500 imágenes al mes', 'Acceso completo a la API', 'Integraciones personalizadas', 'Gerente de cuenta dedicado'],
    enterprise: true
  }
];