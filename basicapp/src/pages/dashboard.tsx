import AnimatedContainer from "@/components/animatedContainter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, FileText, ImageIcon, Upload } from "lucide-react";
import { useNavigate } from "react-router";

export default function Dashboard() {
  const { tokenDetails } = useAuth();

  const navigate = useNavigate();

  const handleNavigate = (location: string) => {
    navigate(location);
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="container mx-auto px-12 py-8">
        <AnimatedContainer>
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-zinc-400">
              Bienvenido al hosting {tokenDetails?.name}
            </h1>
          </div>
        </AnimatedContainer>
        <AnimatedContainer delay={60}>
          <div className="flex flex-row items-center justify-center mt-5 mb-8">
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
                Que deseas realizar?
              </h2>
            </div>
          </div>
        </AnimatedContainer>
        <AnimatedContainer delay={120}>
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center justify-center my-12 gap-8">
            <div className="bg-zinc-400/50 border-zinc-600 border-1 dark:border-zinc-700 dark:bg-zinc-800/50 p-6 space-x-4 space-y-6">
              <div className="flex flex-row items-center justify-start flex-wrap space-x-2">
                <FileText className="h-8 w-8 text-red-500" />
                <h2 className="text-3xl font-bold tracking-tight text-white">
                  Documentos
                </h2>
              </div>
              <p className="text-zinc-400">Sube y administra tus documentos</p>
              <div className="mt-6 flex flex-row items-center justify-center flex-wrap space-x-2">
                <div className="flex items-center justify-center">
                  <Button
                    onClick={() => handleNavigate("/uploads/document")}
                    variant="default"
                    className="p-5 my-1 border-zinc-600 bg-zinc-700/30 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors rounded-none text-xl"
                  >
                    Subir
                    <Upload className="h-10 w-10 text-red-500 mt-1.5" />
                  </Button>
                </div>
                <Button
                  variant="default"
                  onClick={() => handleNavigate("/account/documents")}
                  className="p-5 my-1 border-zinc-600 bg-zinc-700/30 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors rounded-none text-xl"
                >
                  Administrar
                  <ArrowRight className="h-10 w-10 text-red-500 mt-1.5" />
                </Button>
              </div>
            </div>

            <div className="bg-zinc-400/50 border-zinc-600 border-1 dark:border-zinc-700 dark:bg-zinc-800/50 p-6 space-x-4 space-y-6">
              <div className="flex flex-row items-center justify-start flex-wrap space-x-2">
                <ImageIcon className="h-8 w-8 text-red-500" />
                <h2 className="text-3xl font-bold tracking-tight text-white">
                  Imagenes
                </h2>
              </div>
              <p className="text-zinc-400">Sube y administra tus imagenes</p>
              <div className="mt-6 flex flex-row items-center justify-center flex-wrap space-x-2">
                <div className="flex items-center justify-center">
                  <Button
                    onClick={() => handleNavigate("/uploads/image")}
                    variant="default"
                    className="p-5 my-1 border-zinc-600 bg-zinc-700/30 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors rounded-none text-xl"
                  >
                    Subir
                    <Upload className="h-10 w-10 text-red-500 mt-1.5" />
                  </Button>
                </div>
                <Button
                  onClick={() => handleNavigate("/account/images")}
                  variant="default"
                  className="p-5 my-1 border-zinc-600 bg-zinc-700/30 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors rounded-none text-xl"
                >
                  Administrar
                  <ArrowRight className="h-10 w-10 text-red-500 mt-1.5" />
                </Button>
              </div>
            </div>
          </div>
        </AnimatedContainer>
      </div>
    </div>
  );
}
