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
    features: [
      'Explora la plataforma',
      'Prueba funciones básicas',
      'Sin compromiso',
      'Perfecto para comenzar'
    ]
  },
  {
    id: 'pulse',
    name: 'Pulse',
    price: 3.99,
    images: 50,
    features: [
      '50 creaciones al mes',
      'Calidad HD profesional',
      'Generación en segundos',
      'Chat inteligente con IA',
      'Soporte por email'
    ]
  },
  {
    id: 'flow',
    name: 'Flow',
    price: 9.99,
    images: 150,
    features: [
      '150 creaciones al mes',
      'Calidad Ultra HD (4K)',
      'Edición avanzada de imágenes',
      'Proyectos ilimitados',
      'Sin marca de agua',
      'Velocidad prioritaria'
    ],
    popular: true
  },
  {
    id: 'summit',
    name: 'Summit',
    price: 19.99,
    images: 350,
    features: [
      '350 creaciones al mes',
      'Modelos de IA premium',
      'Generación ultra-rápida',
      'Estilos exclusivos',
      'Historial completo',
      'Soporte prioritario 24/7'
    ],
    recommended: true
  },
  {
    id: 'peak',
    name: 'Peak',
    price: 39.99,
    images: 700,
    features: [
      '700 creaciones al mes',
      'Funciones experimentales',
      'Procesamiento instantáneo',
      'Colaboración en equipo',
      'Exportación masiva',
      'Acceso anticipado a novedades'
    ]
  },
  {
    id: 'infinity',
    name: 'Infinity',
    price: 79.99,
    images: 1500,
    features: [
      '1500 creaciones al mes',
      'Uso empresarial sin límites',
      'Integraciones personalizadas',
      'Capacitación del equipo',
      'Gerente de cuenta dedicado',
      'SLA garantizado'
    ],
    enterprise: true
  }
];