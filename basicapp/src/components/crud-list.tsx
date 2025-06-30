import type React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, SquareX } from "lucide-react";
import BulkActions from "./bulk-actions";
import EditModal from "./edit-modal";
import DeleteModal from "./delete-modal";
import SearchFilter from "./search-filter";
import type { SortOption } from "./sortSelectInput";
import Pagination from "./paginationComponent";
import ItemDetailsModal from "./items-detail-modal";

interface CrudListProps<T> {
  title: string;
  description: string;
  items: T[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  onClearSearch?: () => void;
  filters?: Array<{
    key: string;
    label: string;
    options: Array<{ value: string; label: string }>;
    value: string;
    onChange: (value: string) => void;
  }>;
  sortOptions?: SortOption[];
  sortBy?: SortOption;
  onSortChange?: (value: SortOption) => void;
  selectedItems: number[];
  onSelectItem: (id: number) => void;
  onSelectAll: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  onAdd?: () => void;
  useModalToAdd?: boolean;
  addButtonLabel?: string;
  renderItem: (
    item: T,
    isSelected: boolean,
    onSelect: (id: number) => void,
    onEdit: () => void,
    onDelete: () => void
  ) => React.ReactNode;
  editModal?: {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    isLoading?: boolean;
    isValid?: boolean;
  };
  deleteModal?: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    itemName?: string;
    isLoading?: boolean;
  };
  detailsModal?: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children?: React.ReactNode;
    actions?: Array<{
      label: string;
      icon?: React.ReactNode;
      onClick: () => void;
      variant?: "default" | "destructive" | "outline" | "secondary";
      disabled?: boolean;
    }>;
    badges?: Array<{
      label: string;
      variant?: "default" | "secondary" | "destructive" | "outline";
      className?: string;
    }>;
    metadata?: Array<{
      label: string;
      value: string | React.ReactNode;
      icon?: React.ReactNode;
    }>;
    onEdit?: () => void;
    onDelete?: () => void;
  };
  addModal?: {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    onOpenAddModal: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    isLoading?: boolean;
    isValid?: boolean;
  };
  emptyState?: {
    icon?: React.ReactNode;
    title: string;
    description: string;
    action?: () => void;
    actionLabel?: string;
    actionIcon?: React.ReactNode;
  };
  getItemId: (item: T) => number;
  itemLabel?: string;
  totalItems?: number;
  page?: number;
  totalPages?: number;
  pagesize?: number;
  setPage?: (page: number) => void;
}

export default function CrudList<T>({
  title,
  description,
  items,
  isLoading,
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  onClearSearch,
  /* filters, */
  sortOptions,
  sortBy,
  onSortChange,
  selectedItems,
  onSelectItem,
  onSelectAll,
  onBulkDelete,
  onClearSelection,
  onAdd,
  useModalToAdd = false,
  addButtonLabel = "Agregar item",
  renderItem,
  editModal,
  deleteModal,
  detailsModal,
  addModal,
  emptyState = {
    icon: <SquareX className="h-12 w-12 text-zinc-400 mx-auto mb-4" />,
    title: "No se encontraron items",
    description:
      "Intente cambiar tus criterios de búsqueda o intentar recargar la página.",
  },
  getItemId,
  itemLabel = "item",
  totalItems,
  page,
  totalPages,
  setPage,
  pagesize = 5,
}: CrudListProps<T>) {
  const renderList = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-zinc-700 rounded"></div>
          ))}
        </div>
      );
    } else if (items.length === 0) {
      return (
        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardContent className="p-12 text-center space-y-4">
            {emptyState.icon}
            <h3 className="text-lg font-medium text-white mb-2">
              {emptyState.title}
            </h3>
            <p className="text-zinc-400">{emptyState.description}</p>
            {emptyState.action && emptyState.actionLabel && (
              <Button
                variant="outline"
                className="border-zinc-800 bg-zinc-700/30 shadow-md shadow-zinc-900/20 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                onClick={() => emptyState.action?.()}
              >
                {emptyState.actionIcon}
                {emptyState.actionLabel}
              </Button>
            )}
          </CardContent>
        </Card>
      );
    } else {
      return (
        <>
          {/* Bulk Actions */}
          <BulkActions
            selectedCount={selectedItems.length}
            onBulkDelete={onBulkDelete}
            onClearSelection={onClearSelection}
          />

          {/* Items Grid */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={
                    selectedItems.length === items.length && items.length > 0
                  }
                  onCheckedChange={onSelectAll}
                  className="border-zinc-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                />
                <span className="text-sm text-zinc-400">
                  Seleccionar todo ({items.length} {itemLabel})
                </span>
              </div>
              {page && totalPages && totalItems && (
                <div className="text-sm text-zinc-400">
                  Mostrando {Math.min(page * pagesize, totalItems)} de {totalItems}{" "}
                  {itemLabel}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => {
                const itemId = getItemId(item);
                return renderItem(
                  item,
                  selectedItems.includes(itemId),
                  onSelectItem,
                  () => {},
                  () => {}
                );
              })}
            </div>
          </div>

          {/* Pagination */}
          {page && totalPages && setPage && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              showFirstLast={true}
            />
          )}
        </>
      );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            <p className="text-zinc-400">{description}</p>
          </div>
          {!useModalToAdd && onAdd && (
            <div className="flex items-center gap-2">
              <Button
                onClick={onAdd}
                className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                {addButtonLabel}
              </Button>
            </div>
          )}
          {addModal && useModalToAdd && (
            <div className="flex items-center gap-2">
              <Button
                onClick={addModal.onOpenAddModal}
                className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                {addButtonLabel}
              </Button>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          onClearSearch={onClearSearch}
          /* filters={filters} */
          sortOptions={sortOptions}
          sortBy={sortBy}
          onSortChange={onSortChange}
        />

        {renderList()}

        {/* Edit Modal */}
        {editModal && (
          <EditModal
            isOpen={editModal.isOpen}
            onClose={editModal.onClose}
            onSave={editModal.onSave}
            title={editModal.title}
            description={editModal.description}
            isLoading={editModal.isLoading}
            isValid={editModal.isValid}
          >
            {editModal.children}
          </EditModal>
        )}

        {/* Delete Modal */}
        {deleteModal && (
          <DeleteModal
            isOpen={deleteModal.isOpen}
            onClose={deleteModal.onClose}
            onConfirm={deleteModal.onConfirm}
            title={deleteModal.title}
            description={deleteModal.description}
            itemName={deleteModal.itemName}
            isLoading={deleteModal.isLoading}
          />
        )}

        {/* Details Modal */}
        {detailsModal && (
          <ItemDetailsModal
            isOpen={detailsModal.isOpen}
            onClose={detailsModal.onClose}
            title={detailsModal.title}
            subtitle={detailsModal.subtitle}
            actions={detailsModal.actions}
            badges={detailsModal.badges}
            metadata={detailsModal.metadata}
            onEdit={detailsModal.onEdit}
            onDelete={detailsModal.onDelete}
          >
            {detailsModal.children}
          </ItemDetailsModal>
        )}

        {/* Add item Modal */}
        {addModal && useModalToAdd && (
          <EditModal
            isOpen={addModal.isOpen}
            onClose={addModal.onClose}
            onSave={addModal.onSave}
            title={addModal.title}
            description={addModal.description}
            isLoading={addModal.isLoading}
            isValid={addModal.isValid}
          >
            {addModal.children}
          </EditModal>
        )}
      </div>
    </div>
  );
}
