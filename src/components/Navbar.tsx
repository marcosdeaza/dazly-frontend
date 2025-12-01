// src/components/Navbar.tsx

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, CreditCard, LogOut, MessageCircle, Zap } from "lucide-react";
import logo from "@/assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useUserStore } from "@/store/userStore";
import { PLANS } from "@/types";

const Navbar = () => {
  const { token, logout } = useAuthStore();
  const { user } = useUserStore();
  const navigate = useNavigate();

  const currentPlan = PLANS.find(p => p.id === user?.plan) || PLANS[0];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to={token ? "/chat" : "/"}> 
              <img src={logo} alt="Dazly" className="h-10 w-auto" />
            </Link>
          </div>

          {token && user ? (
            <div className="flex items-center gap-4">
              {/* Quick Access Buttons */}
              <Link to="/chat">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat
                </Button>
              </Link>

              <Link to="/plans">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                  <Zap className="h-4 w-4 mr-2" />
                  Planes
                </Button>
              </Link>

              {/* Usage Badge */}
              <Badge variant="outline" className="hidden md:flex">
                {user.imagesRemaining || 0} / {currentPlan.images}
              </Badge>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1 rounded-full hover:bg-purple-500/20 transition-all duration-200">
                    <Avatar className="h-8 w-8 ring-2 ring-transparent hover:ring-purple-400 transition-all duration-200">
                      <AvatarImage src="" alt={user.email} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
                        {user.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-700">
                  <div className="p-2">
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-gray-400">Plan {currentPlan.name}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="flex items-center cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Mi Cuenta
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/plans" className="flex items-center cursor-pointer">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Cambiar Plan
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Configuración
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-400 cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/plans"
                className="text-foreground hover:text-primary transition-colors"
              >
                Planes
              </Link>
              
              <Link
                to="/login"
                className="text-foreground hover:text-primary transition-colors"
              >
                Login
              </Link>

              <Button
                asChild
                size="lg"
                className="bg-gradient-accent text-white font-semibold hover:shadow-glow transition-all duration-300"
              >
                <Link to="/register">
                  Empezar Gratis
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;