import CrudItem from "@/components/crud-item";
import CrudList from "@/components/crud-list";
import ErrorDisplay from "@/components/errorDisplay";
import SimpleTextInput from "@/components/simpleTextInput";
import type { SortOption } from "@/components/sortSelectInput";
import { useToast } from "@/context/ToastContext";
import { useUsers } from "@/context/UsersContext";
import type { FieldError, User } from "@/interfaces/interfaces";
import { registerSchema, updateUserSchema } from "@/schemas/accounts.schema";
import { joiResolver } from "@hookform/resolvers/joi";
import { MailIcon, RefreshCcwIcon, UserIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
const sortOptions: SortOption[] = [
  {
    key: "id",
    label: "ID",
    direction: "DESC",
  },
  {
    key: "name",
    label: "Nombre",
    direction: "DESC",
  },
  {
    key: "email",
    label: "Email",
    direction: "DESC",
  },
];

const pageSize = 6;

export default function ManageUsers() {
  const {
    users,
    isLoading,
    getUsers,
    deleteUser,
    updateUser,
    deleteUsersBulk,
    addUser,
  } = useUsers();

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
    register: registerUser,
    handleSubmit: handleSubmitUser,
    formState: { errors: errorsUser },
    resetField: resetFieldUser,
    reset: resetUser,
  } = useForm({
    resolver: joiResolver(registerSchema),
  });

  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>(sortOptions[0]);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [detailsUser, setDetailsUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const loadDocuments = async () => {
    const response = await getUsers(
      page,
      pageSize,
      undefined,
      searchTerm,
      sortBy
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
    (documentId: number) => {
      setSelectedItems((prev) =>
        prev.includes(documentId)
          ? prev.filter((id) => id !== documentId)
          : [...prev, documentId]
      );
    },
    [setSelectedItems]
  );

  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === users.data.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(users.data.map((user) => Number(user.id)));
    }
  }, [selectedItems, users.data]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedItems.length === 0) return;
    try {
      const result = await deleteUsersBulk(selectedItems);
      if (result.statusCode === 200) {
        if (!result.responseData.data.deletedIds) {
          showToast("Usuarios eliminados con éxito", "success");
        } else {
          const message =
            result.responseData.data.deletedIds.length === 1
              ? "Se eliminó un usuario"
              : "Se eliminaron " +
                result.responseData.data.deletedIds.length +
                " usuarios";
          if (result.responseData.data.notDeletedIds.length !== 0) {
            const warningMessage =
              result.responseData.data.notDeletedIds.length === 1
                ? "No se eliminó un usuario"
                : "No se eliminaron " +
                  result.responseData.data.deletedIds.length +
                  " usuarios";
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
  }, [deleteUsersBulk, selectedItems, users.data]);

  const handleEdit = useCallback((user: User) => {
    setEditingUser(user);
    setValue("name", user.name);
    setValue("email", user.email);
    setIsEditDialogOpen(true);
    setIsDetailsDialogOpen(false);
  }, []);

  const handleSaveEdit = async (data: any) => {
    if (!editingUser) return;
    console.log(data);
    if (editingUser.name === data.name && editingUser.email === data.email) {
      showToast("No se han modificado los datos", "warning");
      setError("name", {
        type: "manual",
        message: "No se han modificado los datos",
      });
      setError("email", {
        type: "manual",
        message: "No se han modificado los datos",
      });
      return;
    }
    const result = await updateUser(editingUser.id, data.name, data.email);

    if (result.statusCode === 204) {
      showToast("Cambios guardados con éxito", "success");
      await loadDocuments();
      setIsEditDialogOpen(false);
      setEditingUser(null);
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
  };

  const handleDelete = useCallback((user: User) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
    setIsDetailsDialogOpen(false);
  }, []);

  const confirmDelete = async () => {
    if (!deletingUser) return;
    try {
      const result = await deleteUser(deletingUser.id);
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
      setDeletingUser(null);
    }
  };

  const handleViewDetails = useCallback(async (user: User) => {
    setDetailsUser(user);
    setIsDetailsDialogOpen(true);
  }, []);

  const handleSaveAdd = async (data: any) => {
    const result = await addUser(data.email, data.name, data.password);
    console.log(result);
    if (result.statusCode === 201) {
      showToast("Usuario creado con éxito", "success");
      await loadDocuments();
      setIsAddDialogOpen(false);
      resetFieldUser("name");
      resetFieldUser("email");
      resetFieldUser("password");
      resetFieldUser("confirmPassword");
    } else {
      showToast(
        result.responseData.message ?? "Error al crear usuario",
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
  };

  const renderDocument = useCallback(
    (user: User, isSelected: boolean, onSelect: (id: number) => void) => (
      <CrudItem
        key={user.id}
        id={Number(user.id)}
        isSelected={isSelected}
        onSelect={onSelect}
        onEdit={() => handleEdit(user)}
        onDelete={() => handleDelete(user)}
        onViewDetails={() => handleViewDetails(user)}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12  flex items-center justify-center">
              <UserIcon className="h-10 w-10 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className={`text-lg font-semibold truncate ${
                  user.name?.trim() ? "text-white" : "text-zinc-400"
                }`}
              >
                {user.name?.trim() || "Sin nombre"}
              </h3>
            </div>
          </div>

          <p
            className={`text-sm line-clamp-2 ${
              user.email?.trim() ? "text-zinc-400" : "text-zinc-500"
            }`}
          >
            {user.email?.trim() || "Sin email"}
          </p>
        </div>
      </CrudItem>
    ),
    [handleEdit, handleDelete, handleViewDetails]
  );

  return (
    <CrudList
      title="Administración de usuarios"
      description="Administrar todos los usuarios del sistema"
      items={users.data}
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
      useModalToAdd={true}
      addButtonLabel="Agregar un usuario"
      renderItem={renderDocument}
      getItemId={(user) => Number(user.id)}
      editModal={
        editingUser
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
                      label="Nombre de usuario"
                      isValid={!errors.name}
                      onClear={() => resetField("name")}
                      value={editingUser.name ?? ""}
                      {...register("name")}
                      {...{ autoComplete: "username" }}
                    />
                    {errors.name && (
                      <ErrorDisplay message={errors.name.message as string} />
                    )}
                    <SimpleTextInput
                      label="Email"
                      isValid={!errors.email}
                      onClear={() => resetField("email")}
                      value={editingUser.email ?? ""}
                      {...register("email")}
                      {...{
                        autoComplete: "email",
                      }}
                    />
                    {errors.email && (
                      <ErrorDisplay message={errors.email.message as string} />
                    )}
                    <ul className="text-xs text-zinc-500 space-y-1 mx-1">
                      <li>
                        • Asegurate de que el correo electronico no esté en uso
                      </li>
                    </ul>
                  </div>
                </div>
              ),
            }
          : undefined
      }
      deleteModal={
        deletingUser
          ? {
              isOpen: isDeleteDialogOpen,
              onClose: () => setIsDeleteDialogOpen(false),
              onConfirm: confirmDelete,
              title: "Eliminar documento",
              itemName: deletingUser.name,
            }
          : undefined
      }
      detailsModal={
        detailsUser
          ? {
              isOpen: isDetailsDialogOpen,
              onClose: () => setIsDetailsDialogOpen(false),
              title: "Detalles del usuario",
              subtitle: "Mostrando los detalles del usuario",
              metadata: [
                {
                  label: "Nombre",
                  value: detailsUser.name,
                  icon: <UserIcon className="h-4 w-4 text-red-500" />,
                },
                {
                  label: "Email",
                  value: detailsUser.email,
                  icon: <MailIcon className="h-4 w-4 text-red-500" />,
                },
              ],
              onEdit: () => handleEdit(detailsUser),
              onDelete: () => handleDelete(detailsUser),
            }
          : undefined
      }
      addModal={{
        isOpen: isAddDialogOpen,
        onClose: () => {
          setIsAddDialogOpen(false);
          resetUser();
        },
        onSave: handleSubmitUser(handleSaveAdd),
        onOpenAddModal: () => setIsAddDialogOpen(true),
        title: "Agregar usuario",
        description: "Ingresa los datos del nuevo usuario.",
        children: (
          <div className="space-y-4">
            <div className="space-y-3">
              <SimpleTextInput
                label="Nombre de usuario"
                isValid={!errors.file_name}
                onClear={() => resetFieldUser("name")}
                {...registerUser("name")}
                {...{ autoComplete: "username" }}
              />
              {errorsUser.name && (
                <ErrorDisplay message={errorsUser.name.message as string} />
              )}
              <ul className="text-xs text-zinc-500 space-y-1 mx-1">
                <li>• Minimo 3 caracteres</li>
              </ul>
              <SimpleTextInput
                label="Email"
                isValid={!errors.description}
                onClear={() => resetFieldUser("email")}
                {...registerUser("email")}
                {...{
                  autoComplete: "email",
                }}
              />
              {errorsUser.email && (
                <ErrorDisplay message={errorsUser.email.message as string} />
              )}
              <ul className="text-xs text-zinc-500 space-y-1 mx-1">
                <li>• Debe ser un correo electrónico válido</li>
              </ul>
              <SimpleTextInput
                label="Contraseña"
                isValid={!errorsUser.password}
                type="password"
                onClear={() => resetFieldUser("password")}
                {...registerUser("password")}
                {...{
                  autoComplete: "new-password",
                }}
              />
              {errorsUser.password && (
                <ErrorDisplay message={errorsUser.password.message as string} />
              )}
              <ul className="text-xs text-zinc-500 space-y-1 mx-1">
                <li>• Minimo 8 caracteres</li>
              </ul>
              <SimpleTextInput
                label="Confirmar contraseña"
                isValid={!errorsUser.confirmPassword}
                type="password"
                onClear={() => resetFieldUser("confirmPassword")}
                {...registerUser("confirmPassword")}
                {...{
                  autoComplete: "new-password",
                }}
              />
              {errorsUser.confirmPassword && (
                <ErrorDisplay
                  message={errorsUser.confirmPassword.message as string}
                />
              )}
              <ul className="text-xs text-zinc-500 space-y-1 mx-1">
                <li>• Debe ser igual a la contraseña</li>
              </ul>
            </div>
          </div>
        ),
      }}
      emptyState={{
        icon: <UserIcon className="h-12 w-12 text-zinc-400 mx-auto mb-4" />,
        title: "No se encontraron usuarios",
        description: "Intenta cambiar tus criterios de búsqueda o filtro.",
        action: clearAndReload,
        actionLabel: "Recargar",
        actionIcon: <RefreshCcwIcon className="h-4 w-4" />,
      }}
      itemLabel="usuario/s"
      totalItems={users.total}
      page={page}
      totalPages={users.totalPages}
      setPage={setPage}
    />
  );
}
