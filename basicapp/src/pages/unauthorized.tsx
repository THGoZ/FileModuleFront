import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldX, Home, LogIn, ArrowLeft } from "lucide-react";
import { Link } from "react-router";

interface UnauthorizedPageProps {
  message?: string;
  redirectPath?: string;
  showLoginButton?: boolean;
  showBackButton?: boolean;
}

export default function UnauthorizedPage({
  message = "No tienes permiso para acceder a esta página.",
  redirectPath = "/",
  showLoginButton = true,
  showBackButton = true,
}: UnauthorizedPageProps) {
  const handleGoBack = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-red-900/20 border border-red-800/30">
            <ShieldX className="h-10 w-10 text-red-400" />
          </div>
          <h2 className="mt-6 text-4xl font-bold tracking-tight text-white">
            401
          </h2>
          <p className="mt-2 text-xl text-zinc-400">Unauthorized Access</p>
        </div>

        <Card className="shadow-2xl border border-zinc-800 bg-zinc-800/50 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-center text-white">
              Acceso denegado
            </CardTitle>
            <CardDescription className="text-center text-zinc-400">
              Necesitas autorización para ver esta página
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center text-zinc-300 space-y-4">
            <div className="p-4 bg-red-900/20 border border-red-800/30">
              <p className="text-red-300 font-medium mb-2">
                Autenticacion requerida
              </p>
              <p className="text-sm text-zinc-400">{message}</p>
            </div>

            <div className="space-y-2 text-sm text-zinc-400">
              <p>Esto podría ocurrir si:</p>
              <ul className="list-disc list-inside space-y-1 text-left">
                <li>No has iniciado sesión en tu cuenta</li>
                <li>Tu sesión ha expirado</li>
                <li>No tienes los permisos necesarios</li>
                <li>Tu cuenta ha sido suspendida</li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-4">
            {showLoginButton && (
              <Link to="/login" className="w-full">
                <Button className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium transition-colors shadow-lg shadow-red-600/20">
                  <LogIn className="h-4 w-4 mr-2" />
                  Iniciar sesión para continuar
                </Button>
              </Link>
            )}

            <div className="flex flex-col sm:flex-row gap-2 w-full">
              {showBackButton && (
                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  className="flex-1 h-12 border-zinc-600 bg-zinc-700/30 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              )}

              <Link to={redirectPath} className="flex-1">
                <Button
                  variant="outline"
                  className="w-full h-12 border-zinc-600 bg-zinc-700/30 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Página de inicio
                </Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
