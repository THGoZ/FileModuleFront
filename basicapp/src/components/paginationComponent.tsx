import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  siblingCount?: number
  className?: string
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  siblingCount = 1,
  className = "",
}: PaginationProps) {
  const generatePageNumbers = () => {
    const pages: (number | string)[] = []

    if (showFirstLast) {
      pages.push(1)
    }

    const startPage = Math.max(showFirstLast ? 2 : 1, currentPage - siblingCount)
    const endPage = Math.min(showFirstLast ? totalPages - 1 : totalPages, currentPage + siblingCount)

    if (showFirstLast && startPage > 2) {
      pages.push("...")
    }

    for (let i = startPage; i <= endPage; i++) {
      if (showFirstLast && i === 1) continue 
      if (showFirstLast && i === totalPages) continue
      pages.push(i)
    }

    if (showFirstLast && endPage < totalPages - 1) {
      pages.push("...")
    }


    if (showFirstLast && totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page)
    }
  }

  const handlePrevious = () => {
    handlePageChange(currentPage - 1)
  }

  const handleNext = () => {
    handlePageChange(currentPage + 1)
  }


  if (totalPages <= 1) {
    return null
  }

  const pageNumbers = generatePageNumbers()

  return (
    <nav className={`flex items-center justify-center space-x-1 ${className}`} aria-label="Pagination">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="border-zinc-600 bg-zinc-700/30 text-zinc-300 hover:bg-zinc-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed
        rounded-none"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <div key={`ellipsis-${index}`} className="px-3 py-2 text-zinc-400" aria-label="More pages">
                <MoreHorizontal className="h-4 w-4" />
              </div>
            )
          }

          const pageNumber = page as number
          const isCurrentPage = pageNumber === currentPage

          return (
            <Button
              key={pageNumber}
              variant={isCurrentPage ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(pageNumber)}
              className={
                isCurrentPage
                  ? "bg-red-600 hover:bg-red-700 text-white border-red-600"
                  : "border-zinc-600 bg-zinc-700/30 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              }
            >
              {pageNumber}
            </Button>
          )
        })}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="border-zinc-600 bg-zinc-700/30 text-zinc-300 hover:bg-zinc-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}
