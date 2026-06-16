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
  maxProjects: number; // ✨ Límite de proyectos
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
    maxProjects: 0, // 🔒 Sin proyectos (solo vista previa)
    features: [
      'Explora la plataforma',
      'Prueba funciones básicas',
      'Sin proyectos',
      'Sin compromiso'
    ]
  },
  {
    id: 'pulse',
    name: 'Pulse',
    price: 3.99,
    images: 50,
    maxProjects: 5, // 🔒 Máximo 5 proyectos
    features: [
      '50 creaciones al mes',
      'Hasta 5 proyectos',
      'Calidad HD profesional',
      'Chat inteligente con IA',
      'Soporte por email'
    ]
  },
  {
    id: 'flow',
    name: 'Flow',
    price: 9.99,
    images: 150,
    maxProjects: 10, // 🔒 Máximo 10 proyectos
    features: [
      '150 creaciones al mes',
      'Hasta 10 proyectos',
      'Calidad Ultra HD (4K)',
      'Edición avanzada de imágenes',
      'Velocidad prioritaria'
    ],
    popular: true
  },
  {
    id: 'summit',
    name: 'Summit',
    price: 19.99,
    images: 350,
    maxProjects: 25, // 🔒 Máximo 25 proyectos
    features: [
      '350 creaciones al mes',
      'Hasta 25 proyectos',
      'Modelos de IA premium',
      'Generación ultra-rápida',
      'Estilos exclusivos',
      'Soporte prioritario 24/7'
    ],
    recommended: true
  },
  {
    id: 'peak',
    name: 'Peak',
    price: 39.99,
    images: 700,
    maxProjects: 50, // 🔒 Máximo 50 proyectos
    features: [
      '700 creaciones al mes',
      'Hasta 50 proyectos',
      'Funciones experimentales',
      'Procesamiento instantáneo',
      'Colaboración en equipo',
      'Exportación masiva'
    ]
  },
  {
    id: 'infinity',
    name: 'Infinity',
    price: 79.99,
    images: 1500,
    maxProjects: 100, // 🔒 100 proyectos
    features: [
      '1500 creaciones al mes',
      'Hasta 100 proyectos',
      'Uso empresarial sin límites',
      'Integraciones personalizadas',
      'Capacitación del equipo',
      'Gerente de cuenta dedicado'
    ],
    enterprise: true
  }
];