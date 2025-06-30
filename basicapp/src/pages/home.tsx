import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Bienvenido al hosting
          </h1>
          <p className="text-zinc-400">
            Inicia sesion o crea una cuenta para subir imagenes y/o documentos.
          </p>
        </div>
        <div className="flex flex-row items-center justify-center space-x-12 my-10">
          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            className="border-red-600 bg-red-600 text-zinc-300 hover:bg-red-700 hover:text-white transition-colors rounded-none text-xl p-6"
          >
            Iniciar sesión
          </Button>
          <Button
            onClick={() => navigate("/register")}
            variant="default"
            className="border-zinc-600 bg-zinc-700/30 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors rounded-none text-xl p-6"
          >
            Registrarse
          </Button>
        </div>
      </div>
    </div>
  );
}
