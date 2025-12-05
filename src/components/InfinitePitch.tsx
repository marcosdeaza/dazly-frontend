"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";

const InfinitePitch = () => {
  const { token } = useAuthStore();
  const navigate = useNavigate();
  
  const isLoggedIn = !!token;
  return (
    <section className="relative py-32 bg-black overflow-hidden">
      {/* Animated background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-primary/10 via-black to-accent/10"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <h2 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter">
            Esto es solo el
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-accent">
              Comienzo.
            </span>
          </h2>

          <p className="text-2xl md:text-3xl text-muted-foreground leading-relaxed">
            Lo que has visto es una mera demostración. 
            <br />
            El poder de Dazly es infinito. 
            <br />
            El único límite es tu imaginación.
          </p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Button 
              size="lg"
              onClick={() => {
                if (isLoggedIn) {
                  navigate('/chat');
                } else {
                  navigate('/register');
                }
              }}
              className="text-xl px-12 py-8 bg-gradient-accent text-white font-bold hover:shadow-glow transition-all duration-300 mt-8"
            >
              Empieza a Explorar Gratis
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <motion.div
        className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl"
        animate={{
          scale: [1.5, 1, 1.5],
          opacity: [0.4, 0.2, 0.4],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </section>
  );
};

export default InfinitePitch;
