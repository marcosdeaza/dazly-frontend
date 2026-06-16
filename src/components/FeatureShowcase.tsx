"use client";

import { motion } from "framer-motion";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";

// (Tu array 'features' no cambia, va aquí tal cual)
const features = [
  {
    title: "Anuncios que Convierten",
    description: "Crea material comercial y publicitario profesional. Sube tu producto y Dazly generará fondos, escenas y eslógans listos para vender.",
    beforeImage: "/images/feat-ad-before.jpg",
    afterImage: "/images/feat-ad-after.jpg",
    gradient: "from-purple-900/20 to-black",
  },
  {
    title: "Perfección para Redes Sociales",
    description: "Más que un filtro. La IA analiza tu foto y ajusta cientos de parámetros (luz, color, encuadre) para un acabado profesional y viral. ¿Vas a dejar que una mancha o un pelo despeinado arruinen la foto?",
    beforeImage: "/images/feat-style-before.jpg",
    afterImage: "/images/feat-style-after.jpg",
    gradient: "from-pink-900/20 to-black",
    reverse: true,
  },
  {
    title: "Creatividad para tu Marca",
    description: "Genera logos únicos, paletas de colores e identidades visuales para tu proyecto. La IA como tu director de arte personal.",
    beforeImage: "/images/feat-logo-before.jpg",
    afterImage: "/images/feat-logo-after.jpg",
    gradient: "from-blue-900/20 to-black",
  },
  {
    title: "Limpia o Añade lo que Quieras",
    description: "Toma el control total de tu imagen. Borra personas, objetos o imperfecciones que arruinen tu foto, o añade elementos nuevos.",
    beforeImage: "/images/feat-erase-before.jpg",
    afterImage: "/images/feat-erase-after.jpg",
    gradient: "from-purple-900/20 to-black",
    reverse: true,
  },
  {
    title: "Rescata tus Recuerdos",
    description: "Repara fotos antiguas, borrosas, rotas o dañadas. Dazly restaura detalles y colores perdidos con una claridad asombrosa.",
    beforeImage: "/images/feat-restore-before.jpg",
    afterImage: "/images/feat-restore-after.jpg",
    gradient: "from-pink-900/20 to-black",
  },
  {
    title: "Edita Texto en Cualquier Superficie",
    description: "Cambia palabras en un cartel, una nota escrita a mano o un letrero. La IA detecta y replica la tipografía (digital o caligráfica) a la perfección.",
    beforeImage: "/images/feat-text-before.jpg",
    afterImage: "/images/feat-text-after.jpg",
    gradient: "from-blue-900/20 to-black",
    reverse: true,
  },
  {
    title: "Imágenes Limpias, Sin Distracciones",
    description: "Elimina marcas de agua, logos o sellos de tiempo de cualquier imagen de forma inteligente, reconstruyendo el fondo por completo.",
    beforeImage: "/images/feat-watermark-before.jpg",
    afterImage: "/images/feat-watermark-after.jpg",
    gradient: "from-purple-900/20 to-black",
  },
];


const FeatureShowcase = () => {
  const { token } = useAuthStore();
  const navigate = useNavigate();
  
  const isLoggedIn = !!token;
  return (
    <section className="py-24 bg-black text-white">
      <div className="container mx-auto px-6 mb-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-6xl md:text-7xl font-bold text-center mb-6"
        >
          Tu Estudio de Edición IA Completo
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-400 text-center max-w-3xl mx-auto"
        >
          7 herramientas profesionales en una sola plataforma
        </motion.p>
      </div>

      <div className="space-y-32">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={`relative bg-gradient-to-br ${feature.gradient} py-20`}
          >
            <div className="container mx-auto px-6">
              <div className={`grid lg:grid-cols-2 gap-12 items-center ${feature.reverse ? 'lg:grid-flow-dense' : ''}`}>
                <div className={`space-y-6 ${feature.reverse ? 'lg:col-start-2' : ''}`}>
                  <h3 className="text-4xl md:text-5xl font-bold">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className={`${feature.reverse ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                  <div className="rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-white/10">
                    
                    {/* --- ¡AQUÍ ESTÁ LA MODIFICACIÓN! --- */}
                    {/* He quitado el className="h-[500px]" de aquí */}
                    <ReactCompareSlider
                      itemOne={
                        <ReactCompareSliderImage
                          src={feature.beforeImage}
                          alt="Antes"
                          // Y he quitado el 'style' de aquí
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      }
                      itemTwo={
                        <ReactCompareSliderImage
                          src={feature.afterImage}
                          alt="Después"
                          // Y he quitado el 'style' de aquí
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      }
                      // El resultado es un slider que se adapta a la altura de la imagen
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

    </section>
  );
};

export default FeatureShowcase;