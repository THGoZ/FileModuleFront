import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Upload, X, FileText, File, ArrowLeftIcon } from "lucide-react";
import { documentUploadSchema } from "@/schemas/upload.schema";
import { formatDate, formatFileSize } from "@/utils/formatters";
import { useDocuments } from "@/context/DocumentsContext";
import { useToast } from "@/context/ToastContext";
import { useNavigate, useSearchParams } from "react-router";
import type { FieldError } from "@/interfaces/interfaces";
import { useAuth } from "@/context/AuthContext";
import SimpleTextInput from "@/components/simpleTextInput";
import ErrorDisplay from "@/components/errorDisplay";

interface DocumentInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

interface DocumentFormData {
  file: FileList;
  description?: string;
  user_id?: string;
  file_name?: string;
}

export default function UploadDocumentForm() {
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [params] = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    setError,
    resetField,
  } = useForm<DocumentFormData>({
    resolver: joiResolver(documentUploadSchema),
  });

  const { uploadDocument } = useDocuments();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { tokenDetails: user } = useAuth();

  const watchedDocument = watch("file");

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Seleccione un archivo de PDF válido");
        return;
      }

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("El tamaño del archivo no puede superar los 10MB");
        return;
      }

      setDocumentInfo({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      });

      setValue("file", e.target.files as FileList);
    }
  };

  const removeDocument = () => {
    setDocumentInfo(null);
    setValue("file", null as any);
    setValue("file_name", null as any);
    const fileInput = document.getElementById("document") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const onSubmit = async (data: DocumentFormData) => {
    setIsUploading(true);

    try {
      if (!user) {
        showToast("Debes iniciar sesión para subir documentos", "error");
        return;
      }
      const formData = new FormData();
      formData.append("file", data.file[0]);
      formData.append("description", data.description || "");
      formData.append("file_name", data.file_name || "");
      formData.append("user_id", user.id);

      const result = await uploadDocument(formData);

      if (result.statusCode === 200) {
        showToast("Documento subido con éxito", "success");
        const redirectUrl = params.get("redirectUrl");
        if (redirectUrl) {
          navigate(redirectUrl);
        } else {
          navigate("/dashboard");
        }
      } else {
        showToast(result.responseData.message ?? "Error al subir el documento", "error");
        if (result.responseData.fieldErrors) {
          result.responseData.fieldErrors.forEach((error: FieldError) => {
            setError(error.field as keyof DocumentFormData, {
              type: "manual",
              message: error.message,
            });
          });
        }
      }
    } catch (error) {
      console.error("Subir documento fallido:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center ">
            <FileText className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
            Subir documento
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Comparte tus documentos PDF con la comunidad
          </p>
        </div>

        <Card className="shadow-2xl border border-zinc-800 bg-zinc-800/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Document Upload Section */}
              <div className="space-y-2">
                {!documentInfo ? (
                  <div className="relative">
                    <input
                      id="document"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleDocumentChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-zinc-600 p-8 text-center hover:border-red-500 transition-colors">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="p-4">
                          <File className="h-8 w-8 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            Haz clic para subir un documento PDF
                          </p>
                          <p className="text-sm text-zinc-400 mt-1">
                            Archivos PDF hasta 5MB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="border border-zinc-600 p-4 bg-zinc-700/30">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-20 bg-red-600/20 border border-red-600/30 flex items-center justify-center">
                            <FileText className="h-8 w-8 text-red-400" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-white truncate">
                              {documentInfo.name}
                            </h4>
                            <button
                              type="button"
                              onClick={removeDocument}
                              className="ml-2 p-1 bg-red-600 hover:bg-red-700 text-white transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="mt-1 space-y-1">
                            <p className="text-xs text-zinc-400">
                              Tamaño: {formatFileSize(documentInfo.size)}
                            </p>
                            <p className="text-xs text-zinc-400">
                              Modificado:{" "}
                              {formatDate(documentInfo.lastModified)}
                            </p>
                            <p className="text-xs text-zinc-400">
                              Tipo: Documento PDF
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {errors.file && (
                  <p className="text-sm text-red-400">{errors.file.message}</p>
                )}
              </div>

              {/* Description Section */}
              <div className="space-y-3">
                <SimpleTextInput
                  label="Nombre/Titulo (Opcional)"
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
                  <li>• Solo se admiten archivos PDF</li>
                  <li>• Tamaño máximo: 5MB</li>
                  <li>
                    • Si no se proporciona un nombre, se utilizará el nombre del
                    archivo
                  </li>
                  <li>
                    • La descripción debe tener entre 10 y 1000 caracteres
                  </li>
                  <li>
                    • Asegúrate de que tu documento siga nuestras reglas de
                    comunidad
                  </li>
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-4">
              <Button
                type="submit"
                className="w-full h-12 rounded-none bg-red-600 hover:bg-red-700 text-white font-medium transition-colors shadow-lg shadow-red-600/20 disabled:bg-red-400 disabled:cursor-not-allowed"
                disabled={isUploading || !documentInfo || !watchedDocument}
              >
                {isUploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Subiendo...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>Subir documento</span>
                  </div>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  setDocumentInfo(null);
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
          Al subir, aceptas nuestros{" "}
          <a
            href="#"
            className="font-medium text-red-400 hover:text-red-300 transition-colors"
          >
            Términos de servicio
          </a>{" "}
          y{" "}
          <a
            href="#"
            className="font-medium text-red-400 hover:text-red-300 transition-colors"
          >
            Política de derechos de autor
          </a>
        </p>
      </div>
    </div>
  );
}
