import { FileQuestion } from "lucide-react"

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-200 dark:bg-zinc-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center ">
            <FileQuestion className="h-10 w-10 text-red-400" />
          </div>
          <h2 className="mt-6 text-4xl font-bold tracking-tight text-white">404</h2>
          <p className="mt-2 text-xl text-zinc-400">Page Not Found</p>
        </div>

        <div className="shadow-2xl border border-zinc-800 bg-zinc-800/50 backdrop-blur-sm p-10">
          <div className="space-y-1 pb-4">
            <h2 className="text-2xl font-semibold text-center text-white">Oops! Donde te metiste?</h2>
            <p className="text-center text-zinc-400">
              La pagina que estas buscando no existe o ha sido movida
            </p>
          </div>

          <div className="text-center text-zinc-300 space-y-4">
            <p>
              No pudimos encontrar la pagina que estabas buscando. Puede que haya sido eliminada, renombrada o no exista.
            </p>
          </div>

          <div className="flex flex-col space-y-4 pt-4 mt-2">
            <a href="/" className="w-full">
              <button className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium transition-colors shadow-lg shadow-red-600/20">
                Volver al inicio
              </button>
            </a>
          </div>
        </div>

        <p className="text-center text-sm text-zinc-400">
          Si crees que esto es un error, por favor{" "}
          <a href="#" className="font-medium text-red-400 hover:text-red-300 transition-colors">
            contactanos
          </a>
        </p>
      </div>
    </div>
  )
}
