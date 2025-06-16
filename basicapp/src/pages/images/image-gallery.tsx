import { useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Calendar } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useImages } from "@/context/ImagesContext"

export default function ImageGallery() {
  const { getAllImages, images, isLoading } = useImages();

  useEffect(() => {
    const loadImages = async () => {
      await getAllImages();
    }

    loadImages()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Galeria de imagenes</h1>
            <p className="text-zinc-400">Descubre las imagenes wachin</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="bg-zinc-800/50 border-zinc-700 animate-pulse rounded-none">
                <div className="aspect-square bg-zinc-700 rounded-none"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Galeria de imagenes</h1>
            <p className="text-zinc-400">Descubre las imagenes wachin</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <Card key={image.id} className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800/70 transition-colors rounded-none">
              <div className="relative">
                <img
                  src={image.path || "/placeholder.svg"}
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
                    <DropdownMenuContent className="bg-zinc-800 border-zinc-700 text-zinc-100" align="end">
                      <DropdownMenuItem className="hover:bg-zinc-700 focus:bg-zinc-700 cursor-pointer">
                        Save
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {images.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-zinc-800 mb-4">
              <Calendar className="h-6 w-6 text-zinc-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No hay imagenes</h3>
            <p className="text-zinc-400">Se el primero en subir una imagen!</p>
          </div>
        )}

        <div className="text-center mt-8">
          <Button
            variant="outline"
            className="border-zinc-600 bg-zinc-700/30 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors rounded-none"
          >
            Cargar mas imagenes
          </Button>
        </div>
      </div>
    </div>
  )
}
