import CrudItem from "@/components/crud-item";
import CrudList from "@/components/crud-list";
import ErrorDisplay from "@/components/errorDisplay";
import SimpleTextInput from "@/components/simpleTextInput";
import type { SortOption } from "@/components/sortSelectInput";
import { CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useImages } from "@/context/ImagesContext";
import { useToast } from "@/context/ToastContext";
import type { FieldError, ImageData, User } from "@/interfaces/interfaces";
import { updateDocumentSchema } from "@/schemas/upload.schema";
import { formatLongDate, getInitials } from "@/utils/formatters";
import { joiResolver } from "@hookform/resolvers/joi";
import {
  Calendar,
  Download,
  FileIcon,
  ImageIcon,
  MailIcon,
  RefreshCwIcon,
  TextIcon,
  UserIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";

interface ImagesCRUDListProps {
  tokenDetails: User;
  adminMode?: boolean;
}

const sortOptions: SortOption[] = [
  {
    key: "created_at",
    label: "Fecha de creación",
    direction: "DESC",
  },
  {
    key: "file_name",
    label: "Nombre",
    direction: "ASC",
  },
];

const apiUrl = import.meta.env.VITE_APP_BASEAPI_URL as string;
const pageSize = 6;

export default function ImagesCRUDList({
  tokenDetails,
  adminMode = false,
}: ImagesCRUDListProps) {
  const {
    images,
    isLoading,
    getAllImages,
    deleteImage,
    updateImage,
    bulkDeleteImages,
  } = useImages();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    resetField,
    setValue,
    reset,
  } = useForm({
    resolver: joiResolver(updateDocumentSchema),
  });

  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>(sortOptions[0]);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [editingImage, setEditingImage] = useState<ImageData | null>(null);
  const [deletingImage, setDeletingImage] = useState<ImageData | null>(null);
  const [detailsImage, setDetailsImage] = useState<ImageData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const loadDocuments = async () => {
    const response = await getAllImages(
      page,
      searchTerm,
      sortBy,
      adminMode ? undefined : tokenDetails.id,
      pageSize,
      true
    );
    if (response.statusCode !== 200) {
      showToast(
        response.responseData.message ?? "Error al cargar los documentos",
        "error"
      );
    }
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTerm.trim() !== "") {
        await loadDocuments();
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchData = async () => {
      await loadDocuments();
    };
    fetchData();
  }, [sortBy, page, reloadKey]);

  const clearAndReload = useCallback(() => {
    setSearchTerm("");
    setSortBy(sortOptions[0]);
    setPage(1);
    setReloadKey((prev) => prev + 1);
  }, []);

  const handleSelectDocument = useCallback(
    (imageId: number) => {
      setSelectedItems((prev) =>
        prev.includes(imageId)
          ? prev.filter((id) => id !== imageId)
          : [...prev, imageId]
      );
    },
    [setSelectedItems]
  );

  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === images.data.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(images.data.map((user) => Number(user.id)));
    }
  }, [selectedItems, images.data]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedItems.length === 0) return;
    try {
      const result = await bulkDeleteImages(selectedItems);
      if (result.statusCode === 200) {
        if (!result.responseData.data.deletedIds) {
          showToast("Imagenes eliminadas con éxito", "success");
        } else {
          const message =
            result.responseData.data.deletedIds.length === 1
              ? "Se eliminó una imagen"
              : "Se eliminaron " +
                result.responseData.data.deletedIds.length +
                " imagenes";
          if (result.responseData.data.notDeletedIds.length !== 0) {
            const warningMessage =
              result.responseData.data.notDeletedIds.length === 1
                ? "No se eliminó una imagen"
                : "No se eliminaron " +
                  result.responseData.data.deletedIds.length +
                  " imagenes";
            showToast(warningMessage, "warning");
          }
          showToast(message, "success");
        }
      } else {
        showToast(
          result.responseData.message ?? "No se pudo realizar la accion",
          "error"
        );
      }
    } finally {
      await loadDocuments();
      setSelectedItems([]);
    }
  }, [bulkDeleteImages, selectedItems, images.data]);

  const handleEdit = useCallback((image: ImageData) => {
    setEditingImage(image);
    setValue("file_name", image.file_name);
    setValue("description", image.description);
    setIsEditDialogOpen(true);
    setIsDetailsDialogOpen(false);
  }, []);

  const handleSaveEdit = async (data: any) => {
    if (!editingImage) return;
    console.log(data);
    if (
      editingImage.file_name === data.file_name &&
      editingImage.description === data.description
    ) {
      showToast("No se han modificado los datos", "warning");
      setError("file_name", {
        type: "manual",
        message: "No se han modificado los datos",
      });
      setError("description", {
        type: "manual",
        message: "No se han modificado los datos",
      });
      return;
    }
    const result = await updateImage(editingImage.id, data.name, data.email);

    if (result.statusCode === 204) {
      showToast("Cambios guardados con éxito", "success");
      await loadDocuments();
      setIsEditDialogOpen(false);
      setEditingImage(null);
    } else {
      showToast(
        result.responseData.message ?? "Error al guardar los datos",
        "error"
      );
      if (result.responseData.fieldErrors) {
        result.responseData.fieldErrors.forEach((error: FieldError) => {
          setError(error.field as keyof ImageData, {
            type: "manual",
            message: error.message,
          });
        });
      }
    }
  };

  const handleDelete = useCallback((image: ImageData) => {
    setDeletingImage(image);
    setIsDeleteDialogOpen(true);
    setIsDetailsDialogOpen(false);
  }, []);

  const confirmDelete = async () => {
    if (!deletingImage) return;
    try {
      const result = await deleteImage(deletingImage.id);
      if (result.statusCode === 204) {
        showToast("Usuario eliminado con éxito", "success");
      } else {
        console.log(result);
        showToast(
          result.responseData.message ?? "Error al eliminar el usuario",
          "error"
        );
      }
    } finally {
      await loadDocuments();
      setIsDeleteDialogOpen(false);
      setDeletingImage(null);
    }
  };

  const handleViewDetails = useCallback(async (image: ImageData) => {
    setDetailsImage(image);
    setIsDetailsDialogOpen(true);
  }, []);

  const handleDownload = async (file: ImageData) => {
    try {
      const response = await fetch(`${apiUrl}${file.path}`);
      console.log(`${apiUrl}${file.path}`);

      if (response.status !== 200) {
        switch (response.status) {
          case 401:
            showToast(
              "No tienes permisos para descargar este archivo",
              "error"
            );
            break;
          case 404:
            showToast("No se encontró el archivo", "error");
            break;
          default:
            showToast("Error al descargar el archivo", "error");
            break;
        }
        return;
      }

      const blob = await response.blob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const filename = file.file_name;

      a.download = filename;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar el archivo:", error);
      showToast("Error al descargar el archivo", "error");
    }
  };

  const renderDocument = useCallback(
    (image: ImageData, isSelected: boolean, onSelect: (id: number) => void) => (
      <CrudItem
        key={image.id}
        id={image.id}
        isSelected={isSelected}
        onSelect={onSelect}
        onEdit={() => handleEdit(image)}
        onDelete={() => handleDelete(image)}
        onViewDetails={() => handleViewDetails(image)}
        customActions={[
          {
            label: "Descargar",
            icon: <Download className="h-4 w-4" />,
            onClick: () => handleDownload(image),
          },
        ]}
      >
        <div
          className="relative"
          key={image.id}
          onClick={(e) => {
            handleViewDetails(image);
            e.stopPropagation();
          }}
        >
          <img
            src={`${apiUrl}${image.path}` || "/placeholder.svg"}
            alt={image.description}
            className="w-full aspect-square object-cover"
          />
        </div>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-8 w-8 p-4 justify-center items-center border flex border-zinc-600 bg-red-500 rounded-2xl">
              <p className="m-0 p-0">
                {getInitials(image.userData?.name || "")}
              </p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {image.userData?.name}
              </p>
              <p className="text-xs text-zinc-400 truncate">
                @{image.userData?.email}
              </p>
            </div>
          </div>
          <div className="space-y-2 mx-1">
            <p className="text-sm text-zinc-300 leading-relaxed mb-4 line-clamp-3">
              {image.file_name}
            </p>
            <p className="text-xs text-zinc-500">{image.description}</p>
          </div>
          <div className="flex flex-row justify-end mt-2 w-full">
            <div className="flex items-center text-xs text-zinc-500">
              <Calendar className="h-3 w-3 mr-1" />
              {formatLongDate(image.created_at.toString())}
            </div>
          </div>
        </CardContent>
      </CrudItem>
    ),
    [handleEdit, handleDelete, handleViewDetails]
  );

  const handleAdd = () => {
    const redirectUrl = `${location.pathname}${location.search}`;
    navigate(`/uploads/image?redirectUrl=${encodeURIComponent(redirectUrl)}`);
  };

  return (
    <CrudList
      title="Administración de Imagenes"
      description="Administrar todas las imágenes del sistema"
      items={images.data}
      isLoading={isLoading}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      onClearSearch={() => setReloadKey(reloadKey + 1)}
      searchPlaceholder="Buscar usuarios..."
      sortOptions={sortOptions}
      sortBy={sortBy}
      onSortChange={setSortBy}
      selectedItems={selectedItems}
      onSelectItem={handleSelectDocument}
      onSelectAll={handleSelectAll}
      onBulkDelete={handleBulkDelete}
      onClearSelection={() => setSelectedItems([])}
      addButtonLabel="Agregar una imagen"
      onAdd={handleAdd}
      renderItem={renderDocument}
      getItemId={(user) => Number(user.id)}
      editModal={
        editingImage
          ? {
              isOpen: isEditDialogOpen,
              onClose: () => {
                setIsEditDialogOpen(false);
                reset();
              },
              onSave: handleSubmit(handleSaveEdit),
              title: "Editar documento",
              description: "Actualizar la información del documento.",
              children: (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <SimpleTextInput
                      label="Nombre de imagen"
                      isValid={!errors.file_name}
                      onClear={() => resetField("file_name")}
                      {...register("file_name")}
                    />
                    {errors.file_name && (
                      <ErrorDisplay
                        message={errors.file_name.message as string}
                      />
                    )}
                    <ul className="text-xs text-zinc-500 space-y-1 mx-1">
                      <li>• Minimo 3 caracteres</li>
                    </ul>
                    <SimpleTextInput
                      label="Descripción"
                      isValid={!errors.description}
                      type="textarea"
                      onClear={() => resetField("description")}
                      value={editingImage.description ?? ""}
                      {...register("description")}
                      {...{
                        rows: 4,
                      }}
                    />
                    {errors.description && (
                      <ErrorDisplay
                        message={errors.description.message as string}
                      />
                    )}
                    <ul className="text-xs text-zinc-500 space-y-1 mx-1">
                      <li>• Mínimo 10 caracteres</li>
                    </ul>
                  </div>
                </div>
              ),
            }
          : undefined
      }
      deleteModal={
        deletingImage
          ? {
              isOpen: isDeleteDialogOpen,
              onClose: () => setIsDeleteDialogOpen(false),
              onConfirm: confirmDelete,
              title: "Eliminar documento",
              itemName: deletingImage.file_name,
            }
          : undefined
      }
      detailsModal={
        detailsImage
          ? {
              isOpen: isDetailsDialogOpen,
              onClose: () => setIsDetailsDialogOpen(false),
              title: "Detalles de la imagen",
              subtitle: "Mostrando los detalles de la imagen",
              metadata: [
                {
                  label: "Nombre",
                  value: detailsImage.file_name,
                  icon: <ImageIcon className="h-4 w-4 text-red-500" />,
                },
                {
                  label: "Descripción",
                  value: detailsImage.description,
                  icon: <TextIcon className="h-4 w-4 text-red-500" />,
                },
                {
                  label: "Tipo",
                  value: detailsImage.file_type,
                  icon: <FileIcon className="h-4 w-4 text-red-500" />,
                },
                {
                  label: "Fecha de subida",
                  value: formatLongDate(detailsImage.created_at.toString()),
                  icon: <Calendar className="h-4 w-4 text-red-500" />,
                },
                {
                  label: "Nombre del usuario",
                  value: detailsImage.userData?.name,
                  icon: <UserIcon className="h-4 w-4 text-red-500" />,
                },
                {
                  label: "Email del usuario",
                  value: detailsImage.userData?.email,
                  icon: <MailIcon className="h-4 w-4 text-red-500" />,
                },
              ],
              onEdit: () => handleEdit(detailsImage),
              onDelete: () => handleDelete(detailsImage),
              children: (
                <div className="space-y-4">
                  <Separator className="bg-zinc-700 my-3" />
                  <div className="flex-1 flex items-center justify-center p-4 lg:p-6">
                    <img
                      src={
                        `${apiUrl}${detailsImage.path}` || "/placeholder.svg"
                      }
                      alt={detailsImage.description}
                      className="max-w-full max-h-[70vh] lg:max-h-[80vh] object-contain"
                    />
                  </div>
                </div>
              ),
            }
          : undefined
      }
      emptyState={{
        icon: <ImageIcon className="h-12 w-12 text-zinc-400 mx-auto mb-4" />,
        title: "No se encontraron imágenes",
        description: "Intenta cambiar tus criterios de búsqueda o filtro.",
        action: clearAndReload,
        actionLabel: "Recargar",
        actionIcon: <RefreshCwIcon className="h-4 w-4" />,
      }}
      itemLabel="Imagen/es"
      totalItems={images.total}
      page={page}
      totalPages={images.totalPages}
      setPage={setPage}
      pagesize={pageSize}
    />
  );
}
