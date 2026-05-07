import { useEffect, useState } from 'react'
import { useMatch, useSearch } from '@tanstack/react-router'
import type { Category } from "../types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Check, ChevronDown, FileText, FolderOpen, LogOut, Menu, Pencil, Settings2, User, X } from "lucide-react" 
import { deleteCategory, getCategoriesWithTotal, updateCategory } from '@/api/reimbursements'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { Button } from './ui/button'
import { createCategoryRoute, editCategoryRoute } from '@/router'
import CreateCategory from './create-category.'
import EditCategory from './edit-category'
import Pagination from './pagination'
import { TableRowSkeleton } from "@/components/ui/skeleton"

// ============================================================================
// HEADER COMPONENT
// ============================================================================

interface DashboardHeaderProps {
  onLogout: () => void
  userName?: string
}

// ============================================
// HEADER COMPONENT
// ============================================
function DashboardHeader() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate({ to: '/' })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-white hidden sm:block">
              refund control
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => navigate({ to: '/interface/solicitacoes' })}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
            >
              solicitações
            </button>
            {user?.perfil === 'ADMIN' && (
              <button
                onClick={() => navigate({ to: '/interface/categorias/' })}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
              >
                categorias
              </button>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {/* User Info - Desktop */}
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-700 border border-zinc-600">
                <User size={14} className="text-zinc-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-white leading-tight">
                  {user?.nome || 'Usuario'}
                </span>
                <span className="text-[10px] text-zinc-500 leading-tight">
                  {user?.perfil || 'Perfil'}
                </span>
              </div>
            </div>

            {/* Logout Button - Desktop */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-lg transition-colors"
            >
              <LogOut size={14} />
              <span>Sair</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-zinc-800">
            <div className="flex flex-col gap-2">
              {/* User Info - Mobile */}
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-800/30">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 border border-zinc-600">
                  <User size={16} className="text-zinc-300" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">
                    {user?.nome || 'Usuario'}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {user?.perfil || 'Perfil'}
                  </span>
                </div>
              </div>

              <div className="h-px bg-zinc-800 my-2" />

              <button
                onClick={() => {
                  navigate({ to: '/interface' })
                  setMobileMenuOpen(false)
                }}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
              >
                <Settings2 size={16} />
                Dashboard
              </button>

              <button
                onClick={() => {
                  navigate({ to: '/interface/solicitacoes' })
                  setMobileMenuOpen(false)
                }}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
              >
                <FileText size={16} />
                Solicitacoes
              </button>

              {user?.perfil === 'ADMIN' && (
                <button
                  onClick={() => {
                    navigate({ to: '/interface/categorias/' })
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
                >
                  <FolderOpen size={16} />
                  Categorias
                </button>
              )}

              <div className="h-px bg-zinc-800 my-2" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut size={16} />
                Sair da conta
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

// ============================================================================
// CATEGORIES TABLE COMPONENT
// ============================================================================

function CategoriesTable() {
  const createMatch = useMatch({
  from: createCategoryRoute.id,
  shouldThrow: false,
  })

  const editMatch = useMatch({
  from: editCategoryRoute.id,
  shouldThrow: false,
  })

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  const navigate = useNavigate()
  const [success, setSuccess] = useState("")

  const handlePageChange = (newPage: number) => {
    const currentUrl = new URL(window.location.href) // obtém a URL atual
    currentUrl.searchParams.set('page', String(newPage)) // atualiza o parâmetro de página na URL
    navigate({ to: currentUrl.pathname + currentUrl.search }) // navega para a nova URL com o parâmetro atualizado
  };

  const handleCreated = () => {
    fetchCategories(); // recarrega a lista]

    setSuccess("Operação efetuada com sucesso!")

    setTimeout(() => {
      setSuccess("")
    }, 5000)
  };

  const CATEGORIES_PER_PAGE = 15

  const search = useSearch({ from: '/interface' })
  const page = search.page ?? 1

  const [categories, setCategories] = useState<Category[]>([])
  const [totalCategories, setTotalCategories] = useState(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const totalPages = Math.ceil(totalCategories / CATEGORIES_PER_PAGE)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const data = await getCategoriesWithTotal(page, CATEGORIES_PER_PAGE)
      setCategories(data?.dados || [])
      setTotalCategories(data?.paginacao?.totalItens || 0)
    } catch (err) {
      setError("Erro ao carregar categorias.")
      setCategories([])
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [page])

  return (
    <div className="min-h-screen bg-zinc-950">
      <DashboardHeader/>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* header */}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                <FolderOpen size={20} className="text-zinc-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Categorias</h1>
                <p className="text-sm text-zinc-500">{totalCategories} categorias encontradas</p>
              </div>
            </div>

            <button
              className="bg-white hover:bg-zinc-200 text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
              onClick={async (e) => {
                navigate({ to: '/interface/categorias/create' })
              }}
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Nova categoria</span>
            </button>
          </div>

          {/* success message */}
          {success ? (
            <div className="flex items-center gap-3 px-4 py-3 text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl">
              <Check size={18} />
              <p className="text-sm">{success}</p>
            </div>
          ) : null}

          {/* table */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-500 font-medium text-xs uppercase tracking-wider">ID</TableHead>
                  <TableHead className="text-zinc-500 font-medium text-xs uppercase tracking-wider">Nome</TableHead>
                  <TableHead className="text-zinc-500 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-zinc-500 font-medium text-xs uppercase tracking-wider w-[60px]">Acoes</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {error ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3 text-red-400">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                          <X size={24} className="text-red-400" />
                        </div>
                        <p className="text-sm">{error}</p>
                        <button 
                          onClick={() => fetchCategories()} 
                          className="text-sm text-zinc-400 hover:text-white underline underline-offset-4 transition-colors"
                        >
                          Tentar novamente
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : loading ? (
                  // Skeleton loader para categorias (3 linhas simuladas)
                  <>
                    {[...Array(3)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={4}>
                          <TableRowSkeleton />
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : categories.length > 0 ? (
                  categories.map((category) => (
                    <TableRow
                      key={category.id}
                      className="border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                    >
                      <TableCell className="font-mono text-xs text-zinc-500">{category.id}</TableCell>

                      {/* editar */}
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[200px]">
                            {category.nome.length > 30 
                              ? category.nome.slice(0, 30) + '...' 
                              : category.nome}
                          </span>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              navigate({
                                to: '/interface/categorias/edit/$id',
                                params: { id: category.id }
                              })
                              try {
                                navigate({
                                  to: '/interface/categorias/edit/$id',
                                  params: { id: category.id }
                                })
                                setSelectedCategoryId(category.id);
                              } catch (err) {
                                setError("Erro ao tentar editar categoria.") 
                                console.error(err)
                              }
                            }}
                            className="p-1 rounded hover:bg-zinc-700/50 text-zinc-500 hover:text-white transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                        </div>
                      </TableCell>
                    
                      <TableCell className="hidden md:table-cell">
                        {category.ativo ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                            Inativo
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800">
                              <Settings2 size={16} />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent className="bg-zinc-900 border border-zinc-800 text-zinc-200 w-48 rounded-xl shadow-xl p-1" align="end">
                            
                            {/* desativar */}
                            {(category.ativo === true) && (
                              <DropdownMenuItem
                                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white transition-colors"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    await deleteCategory(category.id);
                                    fetchCategories();
                                  } catch (err) {
                                    setError("Erro ao tentar desativar categoria.") 
                                    console.error(err)
                                  }
                                }}
                              >
                                <X size={15} className="text-red-400" />
                                <span>Desativar</span>
                              </DropdownMenuItem>
                            )}
                            
                            {(category.ativo === false) && (
                              <DropdownMenuItem
                                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white transition-colors"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    await updateCategory(category.id, {
                                      ativo: true,
                                      deletadoEm: null
                                    });
                                    fetchCategories();
                                  } catch (err) {
                                    setError("Erro ao tentar ativar categoria.") 
                                    console.error(err)
                                  }
                                }}
                              >
                                <Check size={15} className="text-emerald-400" />
                                <span>Ativar</span>
                              </DropdownMenuItem>
                            )}

                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>

                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center">
                          <FolderOpen size={24} className="text-zinc-600" />
                        </div>
                        <p className="text-zinc-500 text-sm">Nenhuma categoria encontrada</p>
                        <button
                          onClick={() => navigate({ to: '/interface/categorias/create' })}
                          className="text-sm text-zinc-400 hover:text-white underline underline-offset-4 transition-colors"
                        >
                          Criar primeira categoria
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <Pagination
            currentPage={Number(page)}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />

          <CreateCategory
            isOpen={!!createMatch}
            onSuccess={handleCreated}
            onClose={() => navigate({ to: '/interface/categorias' })}
          />

          <EditCategory
            isOpen={!!editMatch}
            onSuccess={handleCreated}
            onClose={() => navigate({ to: '/interface/categorias' })}
            categoryId={selectedCategoryId || ''}
          />
        </div>
      </main>
    </div>
  )
}

export default CategoriesTable
