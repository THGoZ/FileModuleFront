import EditModal from "@/components/edit-modal";
import ErrorDisplay from "@/components/errorDisplay";
import SimpleTextInput from "@/components/simpleTextInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useDocuments } from "@/context/DocumentsContext";
import { useImages } from "@/context/ImagesContext";
import { useToast } from "@/context/ToastContext";
import type {
  deleteUser,
  FieldError,
  updatePassword,
  User,
} from "@/interfaces/interfaces";
import {
  deleteUserSchema,
  updatePasswordSchema,
  updateUserSchema,
} from "@/schemas/accounts.schema";
import { joiResolver } from "@hookform/resolvers/joi";
import {
  ArrowRight,
  AtSign,
  CheckIcon,
  FileIcon,
  ImageIcon,
  LoaderCircle,
  LockOpenIcon,
  PenIcon,
  RefreshCwIcon,
  TrashIcon,
  UserIcon,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

const roleBadgeColor = {
  user: "bg-red-600/10 border-1 border-red-600 text-red-300 shadow-sm shadow-red-600/20",
  admin:
    "bg-green-600/10 border-1 border-green-600/50 text-green-300 shadow-sm shadow-green-600/20",
};

const getRoleBadgeColor = (role: string) => {
  if (role === "user") {
    return roleBadgeColor.user;
  } else if (role === "admin") {
    return roleBadgeColor.admin;
  } else {
    return roleBadgeColor.user;
  }
};

const renderUploadStatus = ({
  status,
  type,
  icon: Icon,
  total,
  onReload,
  onManage,
}: {
  status: "loading" | "error" | "success";
  type: string;
  icon: React.ElementType;
  total: number;
  onReload: () => void;
  onManage?: () => void;
}) => {
  if (status === "loading") {
    return (
      <div className="flex flex-col space-y-4">
        <div className="h-6 animate-pulse bg-zinc-700 rounded"></div>
        <div className="h-9 animate-pulse bg-zinc-700 rounded"></div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center justify-center">
        <CardContent className="p-2 text-center space-y-4">
          <Icon className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            Error al cargar la información
          </h3>
          <p className="text-zinc-400">¿Volver a intentar?</p>
          <Button
            variant="outline"
            className="border-zinc-800 bg-zinc-700/30 shadow-md shadow-zinc-900/20 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
            onClick={onReload}
          >
            <RefreshCwIcon className="h-4 w-4" />
            Recargar
          </Button>
        </CardContent>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-row items-center justify-start gap-1">
        <Icon className="h-5 w-5 text-red-500 me-2" />
        <p className="text-zinc-300">
          {type.charAt(0).toUpperCase() + type.slice(1)}:
        </p>
        <p className="text-white font-bold">{total}</p>
      </div>
      <Button
        onClick={onManage}
        variant="default"
        className="p-4 my-1 w-fit border-zinc-600 bg-zinc-700/30 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors rounded-none"
      >
        Administrar
        <ArrowRight className="h-10 w-10 text-red-500" />
      </Button>
    </div>
  );
};

export default function Profile() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    resetField,
    setValue,
    reset,
  } = useForm({
    resolver: joiResolver(updateUserSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordChangeSubmit,
    formState: { errors: errorsPassword },
    setError: setErrorPassword,
    resetField: resetFieldPassword,
    reset: resetPassword,
  } = useForm({
    resolver: joiResolver(updatePasswordSchema),
  });

  const {
    register: registerDelete,
    handleSubmit: handleDeleteSubmit,
    formState: { errors: errorsDelete },
    setError: setErrorDelete,
    resetField: resetFieldDelete,
  } = useForm({
    resolver: joiResolver(deleteUserSchema),
  });

  const { tokenDetails, updateUserDetails, handlePasswordChange, deleteUser } =
    useAuth();
  const { getAllDocuments, documents } = useDocuments();
  const { getAllImages, images } = useImages();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isProfileEditMode, setIsProfileEditMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPasswordEditMode, setIsPasswordEditMode] = useState(false);
  const [documentsStatus, setDocumentsStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [imagesStatus, setImagesStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => {
    setValue("name", tokenDetails?.name);
    setValue("email", tokenDetails?.email);
    setIsProfileEditMode(true);
  };

  const handleEditSave = async (data: any) => {
    if (!tokenDetails) return;
    setIsLoading(true);
    if (data.name === tokenDetails.name && data.email === tokenDetails.email) {
      showToast("No se han modificado los datos", "warning");
      setError("name", {
        type: "manual",
        message: "No se han modificado los datos",
      });
      setError("email", {
        type: "manual",
        message: "No se han modificado los datos",
      });
      setIsLoading(false);
      return;
    }
    const result = await updateUserDetails(
      tokenDetails.id,
      data.name,
      data.email
    );
    if (result.statusCode === 204) {
      showToast("Cambios guardados con éxito", "success");
      await loadDocumentData();
      await loadImageData();
      setIsProfileEditMode(false);
    } else {
      showToast(
        result.responseData.message ?? "Error al guardar los datos",
        "error"
      );
      if (result.responseData.fieldErrors) {
        result.responseData.fieldErrors.forEach((error: FieldError) => {
          setError(error.field as keyof User, {
            type: "manual",
            message: error.message,
          });
        });
      }
    }
    setIsLoading(false);
  };

  const handleEditCancel = () => {
    setIsProfileEditMode(false);
    reset();
  };

  const handleNavigate = (location: string) => {
    navigate(location);
  };

  const handleDelete = () => {
    setIsDeleting(true);
  };

  const handleDeleteSave = async (data: any) => {
    if (!tokenDetails) return;
    setIsLoading(true);
    const result = await deleteUser(tokenDetails.id, data.password);
    if (result.statusCode === 204) {
      showToast("Usuario eliminado con éxito", "success");
      navigate("/");
    } else {
      if (result.responseData.fieldErrors) {
        result.responseData.fieldErrors.forEach((error: FieldError) => {
          setErrorDelete(error.field as keyof deleteUser, {
            type: "manual",
            message: error.message,
          });
        });
      }
      showToast(
        result.responseData.message ?? "Error al eliminar el usuario",
        "error"
      );
    }
    setIsLoading(false);
  };

  const handlePasswordEdit = () => {
    setIsPasswordEditMode(true);
  };

  const handlePasswordChangeSave = async (data: any) => {
    if (!tokenDetails) return;
    console.log(data);
    setIsLoading(true);
    const result = await handlePasswordChange(
      tokenDetails.id,
      data.password,
      data.newPassword
    );

    if (result.statusCode === 204) {
      showToast("Cambios guardados con éxito", "success");
      await loadDocumentData();
      await loadImageData();
      setIsPasswordEditMode(false);
      resetPassword();
    } else {
      showToast(
        result.responseData.message ?? "Error al guardar los datos",
        "error"
      );
      if (result.responseData.fieldErrors) {
        result.responseData.fieldErrors.forEach((error: FieldError) => {
          setErrorPassword(error.field as keyof updatePassword, {
            type: "manual",
            message: error.message,
          });
        });
      }
    }
    setIsLoading(false);
  };

  const loadDocumentData = async () => {
    if (!tokenDetails) return;
    const response = await getAllDocuments(
      1,
      undefined,
      undefined,
      tokenDetails.id,
      undefined,
      false
    );
    if (response.statusCode === 200) {
      setDocumentsStatus("success");
    } else {
      setDocumentsStatus("error");
      showToast(
        response.responseData.message ?? "Error al cargar los documentos",
        "error"
      );
    }
  };

  const loadImageData = async () => {
    if (!tokenDetails) return;
    const response = await getAllImages(
      1,
      undefined,
      undefined,
      tokenDetails.id,
      undefined,
      false
    );
    if (response.statusCode === 200) {
      setImagesStatus("success");
    } else {
      setImagesStatus("error");
      showToast(
        response.responseData.message ?? "Error al cargar las imágenes",
        "error"
      );
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await loadDocumentData();
      await loadImageData();
    };
    fetchData();
  }, []);

  const renderProfileInfo = () => {
    if (isProfileEditMode) {
      return (
        <div className="flex flex-col space-y-4">
          {/* Profile edit */}
          <form
            className="flex flex-col space-y-4"
            onSubmit={handleSubmit(handleEditSave)}
          >
            <SimpleTextInput
              label="Nombre"
              isValid={!errors.name}
              onClear={() => resetField("name")}
              {...register("name")}
              {...{ autoComplete: "username" }}
              value={tokenDetails?.name}
            />
            {errors.name && (
              <ErrorDisplay message={errors.name.message as string} />
            )}
            <SimpleTextInput
              label="Email"
              isValid={!errors.email}
              onClear={() => resetField("email")}
              {...register("email")}
              {...{ autoComplete: "email" }}
              value={tokenDetails?.email}
            />
            {errors.email && (
              <ErrorDisplay message={errors.email.message as string} />
            )}
            <div className="flex flex-row flex-wrap items-center gap-3 mt-4 w-full">
              <Button
                variant="outline"
                onClick={handleEditCancel}
                className="border-zinc-800 bg-zinc-700/30 shadow-md shadow-zinc-900/20 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
              <Button
                variant="outline"
                disabled={isLoading}
                className="border-zinc-800 bg-red-600 shadow-md shadow-red-600/20 text-white hover:bg-red-700 hover:text-white transition-colors"
              >
                {isLoading ? (
                  <LoaderCircle className="animate-spin" size={24} />
                ) : (
                  <CheckIcon className="h-4 w-4" />
                )}
                Guardar
              </Button>
            </div>
          </form>
        </div>
      );
    } else {
      return (
        <>
          {/* Profile info */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center justify-start gap-1">
              <UserIcon className="h-5 w-5 text-red-500" />
              <p className="text-zinc-400">Nombre:</p>
            </div>
            <div
              className={`flex items-center justify-start gap-1 p-1 ${getRoleBadgeColor(
                tokenDetails?.role
              )}`}
            >
              <p className="text-sm">{tokenDetails?.role.toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center justify-start gap-1 bg-zinc-800 p-4 my-3">
            <p className="text-white">{tokenDetails?.name}</p>
          </div>
          <div className="flex items-center justify-start gap-1">
            <AtSign className="h-5 w-5 text-red-500" />
            <p className=" text-zinc-400">Email:</p>
          </div>
          <div className="flex items-center w-full justify-between flex-wrap">
            <div className="flex items-center justify-start gap-2 grow bg-zinc-800 p-4 my-3">
              <p className=" text-white">{tokenDetails?.email}</p>
            </div>
          </div>
          <div className="flex flex-row flex-wrap items-center gap-3 mt-4 w-full">
            <Button
              variant="outline"
              onClick={handleEdit}
              disabled={isLoading}
              className="border-zinc-800 bg-zinc-700/30 shadow-md shadow-zinc-900/20 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              <PenIcon className="h-4 w-4" />
              Editar
            </Button>
            <Button
              onClick={handlePasswordEdit}
              variant="outline"
              disabled={isLoading}
              className="border-zinc-800 bg-zinc-700/30 shadow-md shadow-zinc-900/20 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              <LockOpenIcon className="h-4 w-4" />
              Cambiar contraseña
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              variant="outline"
              className="ml-auto border-zinc-800 bg-red-600 shadow-md shadow-red-600/20 text-white hover:bg-red-700 hover:text-white transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
              Eliminar cuenta
            </Button>
          </div>
        </>
      );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="text-start">
          <h1 className="text-3xl font-bold text-white mb-2">
            Datos del usuario
          </h1>
        </div>
        <Card className="bg-zinc-800/50 border-zinc-700 rounded-none">
          <CardContent className="p-4">{renderProfileInfo()}</CardContent>
        </Card>
        {/* Documents Header */}
        <div className="text-start">
          <h1 className="text-3xl font-bold text-white mb-2">Documentos</h1>
        </div>
        <Card className="bg-zinc-800/50 border-zinc-700 rounded-none">
          <CardContent className="p-4">
            {renderUploadStatus({
              status: documentsStatus,
              type: "documentos",
              icon: FileIcon,
              total: documents.total,
              onReload: () => loadDocumentData(), // replace with your actual reload logic
              onManage: () => handleNavigate("/account/documents"),
            })}
          </CardContent>
        </Card>
        {/* Images Header */}
        <div className="text-start">
          <h1 className="text-3xl font-bold text-white mb-2">Imagenes</h1>
        </div>
        <Card className="bg-zinc-800/50 border-zinc-700 rounded-none">
          <CardContent className="p-4">
            {renderUploadStatus({
              status: imagesStatus,
              type: "imagenes",
              icon: ImageIcon,
              total: images.total,
              onReload: () => loadImageData(), // replace with your actual reload logic
              onManage: () => handleNavigate("/account/images"),
            })}
          </CardContent>
        </Card>
      </div>
      {/* Delete account modal */}
      <EditModal
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        onSave={handleDeleteSubmit(handleDeleteSave)}
        saveButtonText="Confirmar"
        title="Eliminar cuenta"
        description="¿Estás seguro de que deseas eliminar tu cuenta?"
        isLoading={false}
        children={
          <div className="flex flex-col">
            <p className="text-zinc-400 text-sm">
              Esta acción no se puede deshacer y eliminará permanentemente tu
              cuenta.
            </p>
            <div className="items-center gap-3 mt-4 w-full">
              <p className="text-zinc-300 mb-4">
                Ingresa tu contraseña para confirmar:
              </p>
              <SimpleTextInput
                label="Contraseña"
                type="password"
                onClear={() => resetFieldDelete("password")}
                {...registerDelete("password")}
                {...{ autoComplete: "password" }}
              />
              {errorsDelete.password && (
                <ErrorDisplay
                  message={errorsDelete.password.message as string}
                />
              )}
            </div>
          </div>
        }
      />
      {/* Change password modal */}
      <EditModal
        isOpen={isPasswordEditMode}
        onClose={() => setIsPasswordEditMode(false)}
        onSave={handlePasswordChangeSubmit(handlePasswordChangeSave)}
        saveButtonText="Guardar"
        title="Cambiar contraseña"
        isLoading={false}
        children={
          <div className="flex flex-col">
            <div className="items-center gap-3 mt-4 space-y-4 w-full">
              <p className="text-zinc-300 mb-1">
                Ingresa tu contraseña actual:
              </p>
              <div className="flex flex-col space-y-2">
                <form
                  onSubmit={handlePasswordChangeSubmit(
                    handlePasswordChangeSave
                  )}
                >
                  <SimpleTextInput
                    label="Contraseña actual"
                    type="password"
                    onClear={() => {
                      resetFieldPassword("password");
                    }}
                    {...registerPassword("password")}
                    {...{ autoComplete: "password" }}
                  />
                  {errorsPassword.password && (
                    <ErrorDisplay
                      message={errorsPassword.password.message as string}
                    />
                  )}
                  <p className="text-zinc-300 mb-1">
                    Ingresa tu nueva contraseña:
                  </p>
                  <SimpleTextInput
                    label="Nueva contraseña"
                    type="password"
                    onClear={() => {
                      resetFieldPassword("newPassword");
                    }}
                    {...registerPassword("newPassword")}
                    {...{ autoComplete: "new-password" }}
                  />
                  {errorsPassword.newPassword && (
                    <ErrorDisplay
                      message={errorsPassword.newPassword.message as string}
                    />
                  )}
                  <ul className="text-xs text-zinc-500 space-y-1 mx-1">
                    <li>• Minimo 8 caracteres</li>
                  </ul>
                  <p className="text-zinc-300 mb-1">
                    Confirma tu nueva contraseña:
                  </p>
                  <SimpleTextInput
                    label="Confirmar nueva contraseña"
                    type="password"
                    onClear={() => {
                      resetFieldPassword("confirmPassword");
                    }}
                    {...registerPassword("confirmPassword")}
                    {...{ autoComplete: "new-password" }}
                  />
                  {errorsPassword.confirmPassword && (
                    <ErrorDisplay
                      message={errorsPassword.confirmPassword.message as string}
                    />
                  )}
                </form>
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
}
