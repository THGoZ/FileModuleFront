import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  RefreshCwIcon,
  ImageIcon,
  Calendar,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useImages } from "@/context/ImagesContext";
import { useToast } from "@/context/ToastContext";
import type { SortOption } from "@/components/sortSelectInput";
import Pagination from "@/components/paginationComponent";
import SearchBar from "@/components/searchBar";
import SortSelectInput from "@/components/sortSelectInput";
import { formatLongDate, getInitials } from "@/utils/formatters";

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

export default function ImageGallery() {
  const { getAllImages, images, isLoading } = useImages();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>(sortOptions[0]);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const loadDocuments = async () => {
    const response = await getAllImages(
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

  /*   if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Galeria de imagenes
            </h1>
            <p className="text-zinc-400">Descubre las imagenes wachin</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card
                key={index}
                className="bg-zinc-800/50 border-zinc-700 animate-pulse rounded-none"
              >
                <div className="aspect-square bg-zinc-700 rounded-none"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  } */

  const renderList = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card
              key={index}
              className="bg-zinc-800/50 border-zinc-700 animate-pulse"
            >
              <div className="aspect-square bg-zinc-700 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-zinc-700 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-zinc-700 rounded w-24"></div>
                    <div className="h-3 bg-zinc-700 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-zinc-700 rounded w-full"></div>
                  <div className="h-4 bg-zinc-700 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    } else if (images.total === 0 || images.data.length === 0) {
      return (
        <Card className="bg-zinc-800/50 border-zinc-700 rounded-none">
          <CardContent className="p-12 text-center">
            <ImageIcon className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No se encontraron imagenes
            </h3>
            <p className="text-zinc-400 mb-4">
              Intente cambiar tus criterios de búsqueda o intentar recargar la
              página.
            </p>
            <Button
              variant="outline"
              className="border-zinc-600 bg-zinc-700/30 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
              onClick={() => clearAndReload()}
            >
              <RefreshCwIcon className="h-4 w-4" />
              Recargar
            </Button>
          </CardContent>
        </Card>
      );
    } else {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.data.map((image) => (
            <Card
              key={image.id}
              className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800/70 transition-colors rounded-none"
            >
              <div className="relative">
                <img
                  src={`${apiUrl}${image.path}` || "/placeholder.svg"}
                  alt={image.description}
                  className="w-full aspect-square object-cover rounded-t-lg"
                />
                <div className="absolute top-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white rounded-none"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="bg-zinc-800 border-zinc-700 text-zinc-100"
                      align="end"
                    >
                      <DropdownMenuItem className="hover:bg-zinc-700 focus:bg-zinc-700 cursor-pointer">
                        Guardar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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
                  <div className="flex items-center text-xs text-zinc-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatLongDate(image.created_at.toString())}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-zinc-300 leading-relaxed mb-4 line-clamp-3">
                    {image.file_name}
                  </p>
                  <p className="text-xs text-zinc-500">{image.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Galeria de imagenes
          </h1>
          <p className="text-zinc-400">Descubre las imagenes wachin</p>
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

        <div className="mt-8">{renderList()}</div>

        <Pagination
          currentPage={page}
          totalPages={images.totalPages}
          onPageChange={setPage}
          showFirstLast={true}
        />
      </div>
    </div>
  );
}
