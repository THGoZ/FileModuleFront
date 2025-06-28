import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Upload, X, FileImage, ArrowLeftIcon } from "lucide-react";
import { uploadSchema } from "@/schemas/upload.schema";
import { useImages } from "@/context/ImagesContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useSearchParams } from "react-router";
import SimpleTextInput from "@/components/simpleTextInput";
import ErrorDisplay from "@/components/errorDisplay";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/ToastContext";
import type { FieldError } from "@/interfaces/interfaces";

interface ImageFormData {
  image: FileList;
  description?: string;
  user_id?: string;
  file_name?: string;
}

export default function UploadImageForm() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    resetField,
    setError,
  } = useForm<ImageFormData>({
    resolver: joiResolver(uploadSchema),
  });

  const watchedImage = watch("image");
  const watchedDescription = watch("description");
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const { uploadImage, isLoading } = useImages();
  const { tokenDetails: user } = useAuth();
  const { showToast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        alert(
          "Seleccione un archivo de imagen valido (JPEG, PNG, GIF, or WebP)"
        );
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("El tamaño del archivo no puede superar los 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);

      setValue("image", e.target.files as FileList);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setValue("image", null as any);
    const fileInput = document.getElementById("image") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const onSubmit = async (data: ImageFormData) => {
    setIsUploading(true);

    try {
      if (!user) {
        showToast("Debes iniciar sesión para subir imagenes", "error");
        return;
      }
      const formData = new FormData();
      formData.append("file", data.image[0]);
      formData.append("description", data.description || "");
      formData.append("file_name", data.file_name || "");
      formData.append("user_id", user.id);

      console.log("Upload data:", {
        file: data.image[0],
        file_name: data.file_name,
        description: data.description,
        user_id: user?.id,
      });

      const result = await uploadImage(formData);

      console.log(result);

      if (result.statusCode === 200) {
        showToast("Imagen subida con éxito", "success");
        const redirectUrl = params.get("redirectUrl");
        if (redirectUrl) {
          navigate(redirectUrl);
        } else {
          navigate("/dashboard");
        }
      } else {
        showToast(result.responseData.message ?? "Error al subir la imagen", "error");
        if (result.responseData.fieldErrors) {
          result.responseData.fieldErrors.forEach((error: FieldError) => {
            setError(error.field as keyof ImageFormData, {
              type: "manual",
              message: error.message,
            });
          });
        }
      }
    } catch (error) {
      console.error("Subir imagen fallido:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center ">
            <Upload className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
            Sube tu imagen
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Comparte tu imagen con una descripción
          </p>
        </div>

        <Card className="shadow-2xl border border-zinc-800 bg-zinc-800/50 backdrop-blur-sm rounded-none">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Image Upload Section */}
              <div className="space-y-2">
                {!imagePreview ? (
                  <div className="relative">
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-zinc-600 p-8 text-center hover:border-red-500 transition-colors">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="">
                          <FileImage className="h-8 w-8 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            Haz click aqui para subir una imagen
                          </p>
                          <p className="text-sm text-zinc-400 mt-1">
                            PNG, JPG, GIF, WebP hasta 5MB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="border border-zinc-600 p-4 bg-zinc-700/30">
                      <div className="relative">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-64 object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-zinc-400 mt-2">
                        {watchedImage?.[0]?.name} (
                        {Math.round((watchedImage?.[0]?.size || 0) / 1024)} KB)
                      </p>
                    </div>
                  </div>
                )}

                {errors.image && (
                  <p className="text-sm text-red-400">{errors.image.message}</p>
                )}
              </div>

              {/* Description Section */}
              <div className="space-y-2">
                <SimpleTextInput
                  label="Nombre de la imagen (Opcional)"
                  isValid={!errors.file_name}
                  onClear={() => resetField("file_name")}
                  {...register("file_name")}
                  {...{ autoComplete: "name" }}
                />
                {errors.file_name && (
                  <ErrorDisplay message={errors.file_name.message as string} />
                )}
                <SimpleTextInput
                  label="Descripción (Opcional)"
                  isValid={!errors.description}
                  type="textarea"
                  onClear={() => resetField("description")}
                  {...register("description")}
                  {...{
                    autoComplete: "description",
                    rows: 4,
                    id: "description",
                  }}
                />
                {errors.description && (
                  <ErrorDisplay
                    message={errors.description.message as string}
                  />
                )}
              </div>

              {/* Upload Guidelines */}
              <div className="bg-zinc-700/30 border border-zinc-600 p-4">
                <h4 className="text-sm font-medium text-white mb-2">
                  Reglas de subida
                </h4>
                <ul className="text-xs text-zinc-400 space-y-1">
                  <li>• Formatos soportados: JPEG, PNG, GIF, WebP</li>
                  <li>• Tamaño máximo de archivo: 5MB</li>
                  <li>• Descripción debe tener entre 10 y 1000 caracteres</li>
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-4">
              <Button
                type="submit"
                className="w-full h-12 rounded-none bg-red-600 hover:bg-red-700 text-white font-medium transition-colors shadow-lg shadow-red-600/20 disabled:bg-red-400 disabled:cursor-not-allowed"
                disabled={isLoading || !imagePreview || !watchedDescription}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Subiendo...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>Subir imagen</span>
                  </div>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  setImagePreview(null);
                }}
                className="w-full h-12 rounded-none border-zinc-600 bg-zinc-700/30 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                disabled={isUploading}
              >
                Limpiar formulario
              </Button>
              <Button
                type="button"
                onClick={() => window.history.back()}
                className="w-full h-12 rounded-none bg-red-600 hover:bg-red-700 text-white font-medium transition-colors shadow-lg shadow-red-600/20 disabled:bg-red-400 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-2">
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>Volver</span>
                </div>
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-sm text-zinc-400">
          Al subir algo algo{" "}
          <a
            href="#"
            className="font-medium text-red-400 hover:text-red-300 transition-colors"
          >
            Terminos y vicios
          </a>
        </p>
      </div>
    </div>
  );
}
