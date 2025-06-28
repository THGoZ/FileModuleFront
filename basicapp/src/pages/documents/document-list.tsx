import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Download,
  RefreshCwIcon,
  LetterText,
  TextIcon,
  Calendar,
  FileIcon,
  HardDrive,
  UserIcon,
  DownloadIcon,
} from "lucide-react";
import type { UserDocument } from "@/interfaces/interfaces";
import { useDocuments } from "@/context/DocumentsContext";
import { useToast } from "@/context/ToastContext";
import {
  formatFileSize,
  formatLongDate,
  getInitials,
} from "@/utils/formatters";
import SearchBar from "@/components/searchBar";
import type { SortOption } from "@/components/sortSelectInput";
import SortSelectInput from "@/components/sortSelectInput";
import Pagination from "@/components/paginationComponent";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

export default function DocumentList() {
  const { documents, getAllDocuments, isLoading } = useDocuments();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>(sortOptions[0]);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedItem, setSelectedItem] = useState<UserDocument | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const loadDocuments = async () => {
    const response = await getAllDocuments(
      page,
      searchTerm,
      sortBy,
      undefined,
      undefined,
      true
    );
    if (response.statusCode === 200) {
      console.log(response.responseData.data);
    } else {
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

  const handleOpen = async (document: UserDocument) => {
    setSelectedItem(document);
    try {
      const response = await fetch(`${apiUrl}${document.path}`);
      const blob = await response.blob();

      const file = new File([blob], document.file_name, { type: blob.type });
      setSelectedFile(file);
      setIsOpen(true);
    } catch (error) {
      showToast("Error al cargar el archivo:" + error, "error");
    }
  };

  const onClose = () => {
    setSelectedItem(null);
    setIsOpen(false);
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
    }
  };

  const renderList = () => {
    if (isLoading) {
      return (
        <>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-700 rounded"></div>
          ))}
        </>
      );
    } else if (documents.total === 0 || documents.data.length === 0) {
      return (
        <Card className="bg-zinc-800/50 border-zinc-700 rounded-none">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No se encontraron documentos
            </h3>
            <p className="text-zinc-400 mb-4">
              Intente cambiar tus criterios de búsqueda o intentar recargar la página.
            </p>
            <Button
              variant="outline"
              className="border-zinc-600 bg-zinc-700/30 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
              onClick={() => clearAndReload()}
            >
              <RefreshCwIcon className="h-4 w-4" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      );
    } else {
      return (
        <>
          {/* Results Count */}
          <div className="text-sm text-zinc-400">
            Mostrando {Math.min(page * 5, documents.total)} de {documents.total}{" "}
            documentos
          </div>
          {documents.data.map((document) => (
            <Card
              key={document.id}
              className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800/70 transition-colors rounded-none cursor-pointer"
              onClick={() => handleOpen(document)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Document Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-16 flex items-center justify-center">
                      <FileText className="h-10 w-10 text-red-500" />
                    </div>
                  </div>

                  {/* Document Info */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {document.file_name}
                        </h3>
                      </div>
                    </div>

                    {/* Description */}
                    {document.description && (
                      <p className="text-sm text-zinc-400 line-clamp-2">
                        {document.description}
                      </p>
                    )}

                    {/* Date Info */}
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1">
                        <Calendar className="h-3 w-3" />
                        {formatLongDate(document.created_at.toString())}
                      </div>
                    </div>
                  </div>

                  {/* Download Button */}
                  <div className="flex-shrink-0">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(document);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white rounded-none
                      active:scale-90 transition-transform active:bg-red-500"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Biblioteca de documentos
          </h1>
          <p className="text-zinc-400">
            Explore y descarga documentos compartidos por los usuarios.
          </p>
        </div>

        {/* Search and Sorting */}
        <Card className="bg-zinc-800/50 border-zinc-700 rounded-none">
          <CardContent className="py-1 px-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <SearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Buscar archivos..."
                onSearchChange={setSearchTerm}
                onClearSearch={() => setReloadKey(reloadKey + 1)}
              />
              <SortSelectInput
                sortOptions={sortOptions}
                selectedOption={sortBy}
                onSortChange={setSortBy}
              />
            </div>
          </CardContent>
        </Card>

        {/* Document List */}
        <div className="space-y-4">{renderList()}</div>

        {/* File details modal */}
        {selectedItem && selectedFile && (
          <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-zinc-800 border-zinc-700 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Detalles de documento</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Mostrando los detalles del documento
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-start gap-1">
                  <LetterText className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-zinc-400">Nombre</p>
                </div>
                <p className="text-sm text-white m-2">
                  {selectedItem.file_name}
                </p>
                <div className="flex items-center justify-start gap-1">
                  <TextIcon className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-zinc-400">Descripción</p>
                </div>
                <p className="text-sm text-white m-2">
                  {selectedItem.description}
                </p>
                <div className="flex items-center justify-between gap-4">
                  <div className="items-center space-y-2">
                    <div className="flex items-center justify-start gap-1">
                      <FileIcon className="h-4 w-4 text-red-500" />
                      <p className="text-sm text-zinc-400">Tipo</p>
                    </div>
                    <p className="text-sm text-white m-2">
                      {selectedFile.type}
                    </p>
                    <div className="flex items-center justify-start gap-1">
                      <Calendar className="h-4 w-4 text-red-500" />
                      <p className="text-sm text-zinc-400">Fecha de subida</p>
                    </div>
                    <p className="text-sm text-white m-2">
                      {formatLongDate(selectedItem.created_at.toString())}
                    </p>
                  </div>
                  <div className="items-center space-y-2">
                    <div className="flex items-center justify-start gap-1">
                      <HardDrive className="h-4 w-4 text-red-500" />
                      <p className="text-sm text-zinc-400">Tamaño</p>
                    </div>
                    <p className="text-sm text-white m-2">
                      {formatFileSize(selectedFile.size)}
                    </p>
                    <div className="flex items-center justify-start gap-1">
                      <UserIcon className="h-4 w-4 text-red-500" />
                      <p className="text-sm text-zinc-400">
                        Detalles del usuario
                      </p>
                    </div>
                    <div className="flex items-center justify-between mx-2">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 p-4 justify-center items-center border flex border-zinc-600 bg-red-500 rounded-2xl">
                          <p className="m-0 p-0">
                            {getInitials(selectedItem.userData?.name || "")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {selectedItem.userData?.name}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {selectedItem.userData?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="sm:justify-center mt-5">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => handleDownload(selectedItem)}
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={isLoading}
                >
                  <DownloadIcon className="h-4 w-4" />
                  {isLoading ? "Descargando..." : "Descargar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={documents.totalPages}
          onPageChange={setPage}
          showFirstLast={true}
        />
      </div>
    </div>
  );
}
