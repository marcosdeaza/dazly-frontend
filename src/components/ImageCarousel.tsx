"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- ¡AQUÍ ESTÁ LA MAGIA! ---
// He reemplazado tu array genérico por este.
// Coincide con el orden EXACTO de tu 'imagen.jpg' y usa los prompts en español.
const carouselImages = [
  {
    id: 1,
    src: "/images/carousel-1.jpg",
    prompt: "Un guerrero samurái luchando contra una serpiente marina gigante, renderizado al estilo de un grabado en madera Ukiyo-e japonés clásico (como Hokusai). Olas dinámicas rompen en el fondo. Estilizado."
  },
  {
    id: 2,
    src: "/images/carousel-2.jpg",
    prompt: "Foto macro hiperdetallada de una libélula biomecánica. Sus alas son intrincados vitrales, su cuerpo es de cromo pulido y marfil. Posada sobre una flor brillante de color rosa neón. Poca profundidad de campo, 8K, iluminación cinematográfica."
  },
  {
    id: 3,
    src: "/images/carousel-3.jpg",
    prompt: "Un vasto paisaje desértico minimalista hecho de obsidiana suave y pulida. Una única luna gigante, perfectamente esférica y hecha de oro agrietado, flota en el cielo color naranja sangre. Inspirado en pintores surrealistas, ultrarrealista."
  },
  {
    id: 4,
    src: "/images/carousel-4.jpg",
    prompt: "Un interior de edificio 'imposible' al estilo Escher. Arquitectura brutalista de hormigón, pero con escaleras que desafían la gravedad. Una sola persona con un abrigo rojo camina por el techo. Rayos de luz volumétricos ('rayos de dios') iluminan la escena."
  },
  {
    id: 5,
    src: "/images/carousel-5.jpg",
    prompt: "Retrato de una elegante geisha cyberpunk. Su rostro es mitad humano, mitad porcelana intrincada con patrones de circuitos brillantes. Está en un callejón oscuro y lluvioso de Neo-Tokyo, iluminada solo por el reflejo de los letreros de neón en sus ojos. Grano de película, dramático."
  },
  {
    id: 6,
    src: "/images/carousel-6.jpg",
    prompt: "Una acogedora habitación de estudio de un mago en 3D isométrico. Pequeñas pociones, un libro flotante, un gato durmiendo. Renderizado en estilo 'low-poly'. Iluminación cálida, detallado."
  },
  {
    id: 7,
    src: "/images/carousel-7.jpg",
    prompt: "Foto macro de una 'rosa galaxia'. Una rosa negra cuyos pétalos contienen diminutas nebulosas y estrellas brillantes. Una sola gota de rocío en un pétalo refleja la flor entera. Oscuro, hermoso."
  },
  {
    id: 8,
    src: "/images/carousel-8.jpg",
    prompt: "Un Bugatti de los años 30, reimaginado con estética steampunk. Tubos de cobre, engranajes expuestos y un motor de caldera azul brillante. Aparcado en una calle adoquinada en un Londres victoriano con niebla."
  },
  {
    id: 9,
    src: "/images/carousel-9.jpg",
    prompt: "Un postre de 'gastronomía molecular' que parece el planeta Júpiter. Es una esfera perfecta, brillante, con remolinos de crema, servido en un plato de pizarra negra. Estrella Michelin, foto macro."
  },
  {
    id: 10,
    src: "/images/carousel-10.jpg",
    prompt: "Un bosque místico donde el suelo es una alfombra de setas bioluminiscentes azules. Un río de luz estelar líquida fluye a través de él. Un solo ciervo blanco con cuernos de cristal bebe del río. Mágico."
  },
  {
    id: 11,
    src: "/images/carousel-11.jpg",
    prompt: "Una única escalera de caracol hecha de mármol blanco, flotando en un vacío de niebla rosa pálido. No tiene principio ni fin. Minimalista, etéreo, renderizado 3D."
  },
  {
    id: 12,
    src: "/images/carousel-12.jpg",
    prompt: "Un piano de cola negro se derrite sobre una playa de arena rosa mientras las teclas se desprenden y vuelan como pájaros hacia un cielo turquesa. Inspirado en Dalí, luz de día brillante, hiper-surrealista."
  },
  {
    id: 13,
    src: "/images/carousel-13.jpg",
    prompt: "Retrato de una reina africana con pintura facial tribal luminosa (estilo UV) y tocados ornamentados hechos de titanio y componentes de nave espacial. Poderosa, simétrica, fondo oscuro."
  },
  {
    id: 14,
    src: "/images/carousel-14.jpg",
    prompt: "Retrato hiperrealista de un anciano relojero. Su ojo es un mecanismo de reloj complejo y transparente, con diminutos engranajes en movimiento. Iluminación estilo Rembrandt, detalle intenso."
  },
  {
    id: 15,
    src: "/images/carousel-15.jpg",
    prompt: "Un astronauta descubre un 'océano imposible' flotando en el cielo de Marte. Gotas de agua gigantescas cuelgan en el aire como vidrio. La arena roja del planeta se refleja en la superficie del agua. Fotorrealista."
  },
  {
    id: 16,
    src: "/images/carousel-16.jpg",
    prompt: "Una metrópolis Solarpunk al atardecer. Torres blancas y orgánicas se entrelazan con árboles gigantes y bioluminiscentes. Vehículos voladores con forma de mantarraya cruzan el cielo. Utópico, brillante, estético."
  },
  {
    id: 17,
    src: "/images/carousel-17.jpg",
    prompt: "Un dragón colosal hecho enteramente de cristal de amatista y electricidad crepitante. Está posado en el campanario de una catedral gótica durante una tormenta. Contraste extremo, iluminación dramática."
  },
  {
    id: 18,
    src: "/images/carousel-18.jpg",
    prompt: "Un samurái futurista con armadura de fibra de carbono y líneas de neón azul. Está arrodillado meditando en una azotea de Neo-Kyoto. La lluvia cae, reflejando los hologramas de la ciudad en su katana. Estilo cinemático, melancólico, 8K."
  },
  {
    id: 19,
    src: "/images/carousel-19.jpg",
    prompt: "Una colosal biblioteca antigua tallada en la ladera de una montaña nevada. Enormes ventanas arqueadas muestran una nebulosa estrellada en el exterior. Un único grifo brillante duerme sobre una enorme mesa de roble. Arte fantástico, toma de gran angular, escala épica."
  }
];
// --- FIN DE LA SECCIÓN DE PROMPTS ---


const ImageCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    skipSnaps: false,
  });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!emblaApi) return;

    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 3000); // El carrusel se moverá cada 3 segundos

    return () => clearInterval(autoplay);
  }, [emblaApi]);

  return (
    <section className="py-24 bg-black text-white">
      <div className="container mx-auto px-6 mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-6xl font-bold text-center mb-4"
        >
          Galería de Creaciones
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-400 text-center" // 'text-muted-foreground' cambiado a 'text-gray-400'
        >
          Explora lo que Dazly es capaz de crear
        </motion.p>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6 px-6">
          {carouselImages.map((image, index) => (
            <motion.div
              key={image.id}
              className="relative flex-[0_0_400px] h-[500px] group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              whileHover={{ scale: 1.02 }} // Un hover más sutil
              transition={{ duration: 0.3 }}
            >
              <img
                src={image.src}
                alt={`Creación de Dazly ${image.id}`}
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  // Si falla la imagen, muestra un placeholder (¡asegúrate de tenerlo!)
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />

              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    // Estética mejorada: gradiente sutil y blur
                    className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent rounded-xl flex items-end justify-center p-6"
                  >
                    <p className="text-white text-center text-sm leading-relaxed font-mono">
                      {image.prompt}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImageCarousel;