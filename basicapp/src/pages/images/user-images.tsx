import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  ImageIcon,
  Download,
  ArrowUpDownIcon,
} from "lucide-react";
import { useImages } from "@/context/ImagesContext";
import type { ImageData } from "@/interfaces/interfaces";
import { useAuth } from "@/context/AuthContext";

export default function UserImages() {
  const { getAllImages, images, isLoading, deleteImage, editImage, deleteMany } =
    useImages();
  const { tokenDetails } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusSort, setStatusSort] = useState<string>("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [editingImage, setEditingImage] = useState<ImageData | null>(null);
  const [deletingImage, setDeletingImage] = useState<ImageData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const loadImages = async () => {
      await getAllImages(
        "$createdAt",
        statusSort,
        searchTerm,
        tokenDetails?.id as string
      );
    };
    loadImages();
  }, []);

  useEffect(() => {
    
  }, [searchTerm]);

  const handleSelectImage = (imageId: string) => {
    setSelectedImages((prev) =>
      prev.includes(imageId)
        ? prev.filter((id) => id !== imageId)
        : [...prev, imageId]
    );
  };

  const handleSelectAll = () => {
    if (selectedImages.length === images.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(images.map((img) => img.id));
    }
  };

  const handleEdit = (image: ImageData) => {
    setEditingImage(image);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingImage) return;
    const result = await editImage(
      editingImage.id,
      undefined,
      editingImage.description
    );
    await getAllImages();
    if (result) {
      alert("Cambios guardados con exito");
    } else {
      alert("Error al guardar los cambios. Por favor, inténtalo de nuevo.");
    }
  };

  const handleDelete = (image: ImageData) => {
    setDeletingImage(image);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingImage) return;
    const result = await deleteImage(deletingImage.id);
    await getAllImages();
    if (result) {
      alert("Imagen eliminada con exito");
    } else {
      alert("Error al eliminar la imagen. Por favor, inténtalo de nuevo.");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedImages.length === 0) return;
    const result = await deleteMany(selectedImages);
    await getAllImages();
    if (result) {
      alert("Imagen(s) eliminada(s) con exito");
    } else {
      alert("Error al eliminar la imagen. Por favor, inténtalo de nuevo.");
    }
    setSelectedImages([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-zinc-700 w-64"></div>
            <div className="h-10 bg-zinc-700 w-full"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-zinc-700"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Mis imagenes</h1>
            <p className="text-zinc-400">Administra tus imagenes subidas</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => (window.location.href = "/upload-image")}
              className="bg-red-600 hover:bg-red-700 text-white rounded-none"
            >
              <Plus className="h-4 w-4 mr-2" />
              Subir imagen
            </Button>
          </div>
        </div>

        <Card className="bg-zinc-800/50 border-zinc-700 rounded-none">
          <CardContent className="px-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input
                    placeholder="Buscar por descripcion..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-zinc-700/50 border-zinc-600 text-white placeholder:text-zinc-400 rounded-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpDownIcon className="h-4 w-4 text-zinc-400" />
                <select
                  value={statusSort}
                  onChange={(e) => setStatusSort(e.target.value)}
                  className="bg-zinc-700/50 border border-zinc-600 px-3 py-2 text-white text-s"
                >
                  <option value="">Por defecto</option>
                  <option value="asc">Mas recientes</option>
                  <option value="desc">Mas antiguas</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedImages.length > 0 && (
          <Card className="bg-red-900/20 border-red-800/30 rounded-none">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-white">
                  {selectedImages.length} imagen
                  {selectedImages.length !== 1
                    ? "es seleccionadas"
                    : " seleccionada"}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white rounded-none"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Borrar seleccionados
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedImages([])}
                    className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 rounded-none"
                  >
                    Limpiar seleccion
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={
                selectedImages.length === images.length && images.length > 0
              }
              onCheckedChange={handleSelectAll}
              className="border-zinc-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 rounded-none"
            />
            <span className="text-sm text-zinc-400">
              Seleccionar las ({images.length} imagen/es)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <Card
                key={image.id}
                className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800/70 transition-colors rounded-none py-3"
              >
                <CardHeader className="px-4 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedImages.includes(image.id)}
                        onCheckedChange={() => handleSelectImage(image.id)}
                        className="border-zinc-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 rounded-none"
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="bg-zinc-800 border-zinc-700 text-zinc-100 rounded-none"
                        align="end"
                      >
                        <DropdownMenuItem
                          onClick={() => handleEdit(image)}
                          className="hover:bg-zinc-700 focus:bg-zinc-700 cursor-pointer rounded-none"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(image)}
                          className="hover:bg-red-600 focus:bg-red-600 cursor-pointer text-red-400 hover:text-white focus:text-white rounded-none"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Borrar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-zinc-700 focus:bg-zinc-700 cursor-pointer rounded-none">
                          <Download className="mr-2 h-4 w-4" />
                          Descargar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-0">
                  <div className="space-y-3">
                    <img
                      src={image.path || "/placeholder.svg"}
                      alt={image.description}
                      className="w-full h-48 object-cover rounded-lg"
                    />

                    <p className="text-sm text-zinc-300 line-clamp-2">
                      {image.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {images.length === 0 && !isLoading && (
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardContent className="p-12 text-center">
              <ImageIcon className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No se encontraron imágenes
              </h3>
              <p className="text-zinc-400">
                Intenta ajustar tus criterios de búsqueda o filtro.
              </p>
            </CardContent>
          </Card>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-zinc-800 border-zinc-700 text-white max-w-2xl rounded-none">
            <DialogHeader>
              <DialogTitle>Editar imagen</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Actualiza la descripción y la información de la imagen.
              </DialogDescription>
            </DialogHeader>

            {editingImage && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={editingImage.path || "/placeholder.svg"}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-zinc-300">
                    Descripción
                  </Label>
                  <textarea
                    id="description"
                    value={editingImage.description}
                    onChange={(e) =>
                      setEditingImage({
                        ...editingImage,
                        description: e.target.value,
                      })
                    }
                    className="w-full h-24 px-3 py-2 bg-zinc-700/50 border border-zinc-600 text-white placeholder:text-zinc-400 focus:border-red-500 focus:outline-none resize-none"
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 rounded-none"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="bg-red-600 hover:bg-red-700 text-white rounded-none"
              >
                Guardar cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent className="bg-zinc-800 border-zinc-700 text-white rounded-none">
            <AlertDialogHeader>
              <AlertDialogTitle>Borrar imagen</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400">
                Seguro que quieres borrar la imagen? Esta acción no se puede
                deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 rounded-none">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white rounded-none"
              >
                Borrar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
