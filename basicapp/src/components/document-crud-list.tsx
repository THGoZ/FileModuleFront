import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Calendar,
  Download,
  RefreshCcwIcon,
  TextIcon,
  FileIcon,
  HardDriveIcon,
} from "lucide-react";
import CrudItem from "@/components/crud-item";
import CrudList from "@/components/crud-list";
import type { FieldError, User, UserDocument } from "@/interfaces/interfaces";
import { formatFileSize, formatLongDate } from "@/utils/formatters";
import { useDocuments } from "@/context/DocumentsContext";
import { useToast } from "@/context/ToastContext";
import type { SortOption } from "@/components/sortSelectInput";
import SimpleTextInput from "@/components/simpleTextInput";
import ErrorDisplay from "@/components/errorDisplay";
import { joiResolver } from "@hookform/resolvers/joi";
import { useForm } from "react-hook-form";
import { updateDocumentSchema } from "@/schemas/upload.schema";
import { useLocation, useNavigate } from "react-router";

interface DocumentsCRUDListProps {
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

interface UserDocumentDetails {
  id: number;
  file_name: string;
  description?: string;
  file_type: string;
  created_at: Date;
  path: string;
  fileSize?: number;
}

const pageSize = 6;
const apiUrl = import.meta.env.VITE_APP_BASEAPI_URL as string;

export default function DocumentsCRUDList({
  tokenDetails,
  adminMode = false,
}: DocumentsCRUDListProps) {
  const {
    documents,
    getAllDocuments,
    updateDocument,
    deleteDocument,
    bulkDeleteDocuments,
    isLoading,
  } = useDocuments();
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    resetField,
    setValue,
  } = useForm({
    resolver: joiResolver(updateDocumentSchema),
  });
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>(sortOptions[0]);
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [editingDocument, setEditingDocument] = useState<UserDocument | null>(
    null
  );
  const [deletingDocument, setDeletingDocument] = useState<UserDocument | null>(
    null
  );
  const [detailsDocument, setDetailsDocument] =
    useState<UserDocumentDetails | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const loadDocuments = async () => {
    const userId = tokenDetails.id;
    const response = await getAllDocuments(
      page,
      searchTerm,
      sortBy,
      adminMode ? undefined : userId,
      pageSize
    );
    if (response.statusCode !== 200) {
      console.log(response);
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

  const clearAndReload = () => {
    setSearchTerm("");
    setSortBy(sortOptions[0]);
    setPage(1);
    setReloadKey((prev) => prev + 1);
  };

  const handleSelectDocument = useCallback(
    (documentId: number) => {
      setSelectedDocuments((prev) =>
        prev.includes(documentId)
          ? prev.filter((id) => id !== documentId)
          : [...prev, documentId]
      );
    },
    [setSelectedDocuments]
  );

  const handleSelectAll = useCallback(() => {
    if (selectedDocuments.length === documents.data.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(documents.data.map((doc) => doc.id));
    }
  }, [setSelectedDocuments, documents.data]);

  const handleEdit = useCallback(
    (document: UserDocument) => {
      setEditingDocument(document);
      setValue("file_name", document.file_name);
      setValue("description", document.description);
      setIsEditDialogOpen(true);
      setIsDetailsDialogOpen(false);
    },
    [setEditingDocument, setValue, setIsEditDialogOpen, setIsDetailsDialogOpen]
  );

  const handleSaveEdit = async (data: any) => {
    if (!editingDocument) return;
    if (
      editingDocument.file_name === data.file_name &&
      editingDocument.description === data.description
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
    try {
      const result = await updateDocument(
        editingDocument.id,
        data.file_name,
        data.description
      );

      if (result.statusCode === 204) {
        showToast("Cambios guardados con éxito", "success");
      } else {
        showToast(
          result.responseData.message ?? "Error al guardar los datos",
          "error"
        );
        if (result.responseData.fieldErrors) {
          result.responseData.fieldErrors.forEach((error: FieldError) => {
            setError(error.field as keyof UserDocument, {
              type: "manual",
              message: error.message,
            });
          });
        }
      }
    } finally {
      await loadDocuments();
      setIsEditDialogOpen(false);
      setEditingDocument(null);
    }
  };

  const handleDelete = useCallback(
    (document: UserDocument) => {
      setDeletingDocument(document);
      setIsDeleteDialogOpen(true);
      setIsDetailsDialogOpen(false);
    },
    [setDeletingDocument, setIsDeleteDialogOpen, setIsDetailsDialogOpen]
  );

  const confirmDelete = async () => {
    if (!deletingDocument) return;
    try {
      const result = await deleteDocument(deletingDocument.id);
      if (result.statusCode === 204) {
        showToast("Documento eliminado con éxito", "success");
      } else {
        showToast(
          result.responseData.message ?? "Error al eliminar el documento",
          "error"
        );
      }
    } finally {
      await loadDocuments();
      setIsDeleteDialogOpen(false);
      setDeletingDocument(null);
    }
  };

  const handleViewDetails = async (document: UserDocument) => {
    try {
      const response = await fetch(`${apiUrl}${document.path}`);
      const blob = await response.blob();
      const file = new File([blob], document.file_name, { type: blob.type });

      const documentDetails = {
        id: document.id,
        file_name: document.file_name,
        description: document.description,
        file_type: document.file_type,
        created_at: document.created_at,
        path: document.path,
        fileSize: file.size,
      };
      setDetailsDocument(documentDetails);
    } catch (error) {
      showToast("Error al cargar detalles del archivo:" + error, "error");
      setDetailsDocument({
        id: document.id,
        file_name: document.file_name,
        description: document.description,
        file_type: document.file_type,
        created_at: document.created_at,
        path: document.path,
      });
    } finally {
      setIsDetailsDialogOpen(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDocuments.length === 0) return;
    try {
      const result = await bulkDeleteDocuments(selectedDocuments);
      if (result.statusCode === 200) {
        if (!result.responseData.data.deletedIds) {
          showToast("Documentos eliminados con éxito", "success");
        } else {
          const message =
            result.responseData.data.deletedIds.length === 1
              ? "Se eliminó un documento"
              : "Se eliminaron " +
                result.responseData.data.deletedIds.length +
                " documentos";

          if (result.responseData.data.notDeletedIds.length !== 0) {
            const warningMessage =
              result.responseData.data.notDeletedIds.length === 1
                ? "No se eliminó un elemento"
                : "No se eliminaron " +
                  result.responseData.data.deletedIds.length +
                  " documentos";
            showToast(warningMessage, "warning");
          }
          showToast(message, "success");
        }
      } else {
        showToast(
          result.responseData.message ?? "Error al eliminar los documentos",
          "error"
        );
      }
    } finally {
      await loadDocuments();
      setSelectedDocuments([]);
    }
  };

  const handleDownload = async (file: UserDocument) => {
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
    } finally {
      setIsDetailsDialogOpen(false);
    }
  };

  const renderDocument = (
    document: UserDocument,
    isSelected: boolean,
    onSelect: (id: number) => void
  ) => (
    <CrudItem
      key={document.id}
      id={document.id}
      isSelected={isSelected}
      onSelect={onSelect}
      onEdit={() => handleEdit(document)}
      onDelete={() => handleDelete(document)}
      onViewDetails={() => handleViewDetails(document)}
      customActions={[
        {
          label: "Descargar",
          icon: <Download className="h-4 w-4" />,
          onClick: () => handleDownload(document),
        },
      ]}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12  flex items-center justify-center">
            <FileText className="h-10 w-10 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className={`text-lg font-semibold truncate ${
                document.file_name?.trim() ? "text-white" : "text-zinc-400"
              }`}
            >
              {document.file_name?.trim() || "Sin título"}
            </h3>
          </div>
        </div>

        <p
          className={`text-sm line-clamp-2 ${
            document.description?.trim() ? "text-zinc-400" : "text-zinc-500"
          }`}
        >
          {document.description?.trim() || "Sin descripción"}
        </p>
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatLongDate(document.created_at.toString())}
          </div>
        </div>
      </div>
    </CrudItem>
  );

  const handleAdd = () => {
    const redirectUrl = `${location.pathname}${location.search}`;
    navigate(
      `/uploads/document?redirectUrl=${encodeURIComponent(redirectUrl)}`
    );
  };

  return (
    <>
      <CrudList
        title="Administración de documentos"
        description="Administrar todos los documentos subidos por el usuario"
        items={documents.data}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClearSearch={() => setReloadKey(reloadKey + 1)}
        searchPlaceholder="Buscar documentos..."
        sortOptions={sortOptions}
        sortBy={sortBy}
        onSortChange={setSortBy}
        selectedItems={selectedDocuments}
        onSelectItem={handleSelectDocument}
        onSelectAll={handleSelectAll}
        onBulkDelete={handleBulkDelete}
        onClearSelection={() => setSelectedDocuments([])}
        onAdd={handleAdd}
        addButtonLabel="Agregar documento"
        renderItem={renderDocument}
        getItemId={(document) => document.id}
        editModal={
          editingDocument
            ? {
                isOpen: isEditDialogOpen,
                onClose: () => setIsEditDialogOpen(false),
                onSave: handleSubmit(handleSaveEdit),
                title: "Editar documento",
                description: "Actualizar la información del documento.",
                children: (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <SimpleTextInput
                        label="Nombre/Titulo (Opcional)"
                        isValid={!errors.file_name}
                        onClear={() => resetField("file_name")}
                        value={editingDocument.file_name ?? ""}
                        {...register("file_name")}
                        {...{ autoComplete: "name" }}
                      />
                      {errors.file_name && (
                        <ErrorDisplay
                          message={errors.file_name.message as string}
                        />
                      )}
                      <SimpleTextInput
                        label="Descripción (Opcional)"
                        isValid={!errors.description}
                        type="textarea"
                        onClear={() => resetField("description")}
                        value={editingDocument.description ?? ""}
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
          deletingDocument
            ? {
                isOpen: isDeleteDialogOpen,
                onClose: () => setIsDeleteDialogOpen(false),
                onConfirm: confirmDelete,
                title: "Eliminar documento",
                itemName: deletingDocument.file_name,
              }
            : undefined
        }
        detailsModal={
          detailsDocument
            ? {
                isOpen: isDetailsDialogOpen,
                onClose: () => setIsDetailsDialogOpen(false),
                title: "Detalles del documento",
                subtitle: "Mostrando los detalles del documento",
                metadata: [
                  {
                    label: "Nombre",
                    value: detailsDocument.file_name,
                    icon: <FileText className="h-4 w-4 text-red-500" />,
                  },
                  {
                    label: "Descripción",
                    value: detailsDocument.description,
                    icon: <TextIcon className="h-4 w-4 text-red-500" />,
                  },
                  {
                    label: "Tipo",
                    value: detailsDocument.file_type,
                    icon: <FileIcon className="h-4 w-4 text-red-500" />,
                  },
                  {
                    label: "Fecha de subida",
                    value: formatLongDate(
                      detailsDocument.created_at.toString()
                    ),
                    icon: <Calendar className="h-4 w-4 text-red-500" />,
                  },
                  {
                    label: "Tamaño",
                    value: detailsDocument.fileSize
                      ? formatFileSize(detailsDocument.fileSize)
                      : "-",
                    icon: <HardDriveIcon className="h-4 w-4 text-red-500" />,
                  },
                ],
                actions: [
                  {
                    label: "Descargar",
                    icon: <Download className="h-4 w-4" />,
                    variant: "outline",
                    disabled: detailsDocument.path === "",
                    onClick: () =>
                      handleDownload(detailsDocument as UserDocument),
                  },
                ],
                onEdit: () => handleEdit(detailsDocument as UserDocument),
                onDelete: () => handleDelete(detailsDocument as UserDocument),
              }
            : undefined
        }
        emptyState={{
          icon: <FileText className="h-12 w-12 text-zinc-400 mx-auto mb-4" />,
          title: "No se encontraron documentos",
          description: "Intenta cambiar tus criterios de búsqueda o filtro.",
          action: clearAndReload,
          actionLabel: "Recargar",
          actionIcon: <RefreshCcwIcon className="h-4 w-4" />,
        }}
        itemLabel="documento/s"
        totalItems={documents.total}
        page={page}
        totalPages={documents.totalPages}
        setPage={setPage}
        pagesize={pageSize}
      />
    </>
  );
}
