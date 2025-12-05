import { Instagram } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-black border-t border-white/10 py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6">
            <p className="text-muted-foreground">
              © 2025 Dazly.art. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <Link 
                to="/privacy" 
                className="text-muted-foreground hover:text-primary transition-colors underline"
              >
                Política de Privacidad
              </Link>
              <Link 
                to="/terms" 
                className="text-muted-foreground hover:text-primary transition-colors underline"
              >
                Términos de Servicio
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-foreground">Contáctanos en Instagram:</span>
            <a
              href="https://www.instagram.com/dazly.art"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:text-accent transition-colors group"
            >
              <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">@dazly.art</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
