import { Upload } from "lucide-react";
import { useNavigate } from "react-router";

export default function Dashboard() {

  const navigate = useNavigate();

  const handleUpload = () => {
    navigate("/upload-image");
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-600 mb-2">
            Bienvenido al hosting de imagenes
          </h1>
        </div>
        <div className="flex flex-row items-center justify-center space-x-12 my-10">
          <div className="text-center" onClick={handleUpload}>
            <div className="mx-auto h-12 w-12 flex items-center justify-center ">
              <Upload className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
              Presiona aquí para subir una imagen
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
