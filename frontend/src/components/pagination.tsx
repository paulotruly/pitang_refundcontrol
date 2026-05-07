import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function getPageNumbers(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 1) { return [] }
  if (totalPages <= 7) { return Array.from({ length: totalPages }, (_, i) => i + 1)}
  if (currentPage <= 3) { return [1, 2, 3, 4, "ellipsis", totalPages] }
  if (currentPage >= totalPages - 2) { return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages] }
  
  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages]
}

export default function PaginationComponent({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = getPageNumbers(currentPage, totalPages)
    
  const goToPage = (page: number) => {
    onPageChange(page)
  }

  // if (pages.length === 0) { return null }

  return (
    <Pagination className="text-zinc-400 select-none">
      <PaginationContent className="gap-1">

        <PaginationItem>
          <PaginationPrevious
            onClick={(e) => {
              e.preventDefault()
              if (currentPage > 1) {
                goToPage(currentPage - 1)
              }
            }}
            href="#"
            className={`border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white hover:border-zinc-700 transition-colors ${
              currentPage === 1 ? "opacity-50 pointer-events-none" : ""
            }`}
          />
        </PaginationItem>

        {pages.map((page, index) => (
          <PaginationItem key={index}>
            {page === "ellipsis" ? (
              <PaginationEllipsis className="text-zinc-600" />
            ) : (
              <PaginationLink
                onClick={(e) => {
                  e.preventDefault()
                  goToPage(page as number)
                }}
                isActive={page === currentPage}
                href="#"
                className={page === currentPage 
                  ? "bg-white text-zinc-950 border border-white hover:bg-zinc-100 font-medium" 
                  : "border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white hover:border-zinc-700 transition-colors"
                }
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            onClick={(e) => {
              e.preventDefault()
              if (currentPage < totalPages) {
                goToPage(currentPage + 1)
              }
            }}
            href="#"
            className={`border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white hover:border-zinc-700 transition-colors ${
              currentPage === totalPages ? "opacity-50 pointer-events-none" : ""
            }`}
          />
        </PaginationItem>

      </PaginationContent>
    </Pagination>
  )
}