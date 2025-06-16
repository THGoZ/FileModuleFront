import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, User, LogOut, Settings, Image, Upload } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router";

export default function Navbar() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const { tokenDetails: user, logout } = useAuth();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-900/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <a href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors rounded-none"
              >
                <Home className="h-4 w-4 mr-2" />
                Inicio
              </Button>
            </a>
            <a href="/images">
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors rounded-none"
              >
                <Image className="h-4 w-4 mr-2" />
                Galeria
              </Button>
            </a>
            <a href="/upload-image">
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors rounded-none"
              >
                <Upload className="h-4 w-4 mr-2" />
                Subir imagen
              </Button>
            </a>
          </div>
          <div className="hidden sm:flex items-center">
            <a
              href="/"
              className="text-xl font-bold text-white hover:text-red-400 transition-colors"
            >
              WEPP
            </a>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full hover:bg-zinc-800 transition-colors"
                  >
                    <Avatar className="h-10 w-10 border-2 border-zinc-700">
                      <AvatarImage
                        src={`https://placeholder.pics/svg/300`}
                        alt={user.name}
                      />
                      <AvatarFallback className="bg-red-600 text-white font-medium">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-zinc-800 border-zinc-700 text-zinc-100 rounded-none"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-white">
                        {user.name}
                      </p>
                      <p className="text-xs leading-none text-zinc-400">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-700" />
                  <DropdownMenuItem className="hover:bg-zinc-700 focus:bg-zinc-700 cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Ver perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-zinc-700 focus:bg-zinc-700 cursor-pointer"
                  onClick={() => navigate("/account/images")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Mis Imagenes</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-zinc-700" />
                  <DropdownMenuItem
                    className="hover:bg-red-600 focus:bg-red-600 cursor-pointer text-red-400 hover:text-white focus:text-white"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{isLoggingOut ? "Cerrando sesion..." : "Cerrar sesion"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <a href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors rounded-none"
                  >
                    Iniciar sesión
                  </Button>
                </a>
                <a href="/register">
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg shadow-red-600/20 rounded-none"
                  >
                    Registrarse
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
