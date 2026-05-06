import { useEffect, useState } from 'react'
import { useMatch, useSearch } from '@tanstack/react-router'
import type { Category } from "../types" // Reimbursement removido pois não estava sendo usado
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Check, FileText, Pencil, Settings2, X } from "lucide-react" // PencilIcon removido pois não estava sendo usado
import { deleteCategory, getCategoriesWithTotal, updateCategory } from '@/api/reimbursements'

import { useAuth } from '@/context/AuthContext'
import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { Button } from './ui/button'
// CreateReimbursement e EditReimbursement removidos pois não estavam sendo usados neste componente
import { createCategoryRoute, editCategoryRoute } from '@/router'
import CreateCategory from './create-category.'
import EditCategory from './edit-category'

function CategoriesTable() {
  const createMatch = useMatch({
  from: createCategoryRoute.id,
  shouldThrow: false,
  })

  const editMatch = useMatch({
  from: editCategoryRoute.id,
  shouldThrow: false,
  })

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  const {user} = useAuth() // user pode ser usado para verificações de permissão futuras
  const navigate = useNavigate()


  const handleCreated = () => {
    fetchCategories(); // recarrega a lista
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
    <div className="space-y-6">
      {/* header */}

      <div className="flex items-center justify-between">

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            onClick={async (e) => {
              navigate({ to: '/interface/categorias/create' })
            }}
          >
            <Plus size={16} />
            Nova categoria
          </button>

      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800 border border-slate-700/50">
            <FileText size={20} className="text-slate-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-100">Categorias</h1>
          </div>
        </div>
      </div>

      {/* table */}
      <div className="rounded-xl border border-slate-800/50 bg-slate-900/30 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800/50 hover:bg-transparent">
              <TableHead className="text-slate-400 font-medium">ID</TableHead>
              <TableHead className="text-slate-400 font-medium">Nome</TableHead>
              <TableHead className="text-slate-400 font-medium hidden lg:table-cell">Ativo</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {error ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3 text-red-500">
                    <p>{error}</p>
                    <button 
                      onClick={() => fetchCategories()} 
                      className="text-sm text-slate-400 hover:text-slate-200 underline"
                    >
                      Tentar novamente
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ) : loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-6 h-6 border-2 border-slate-600 border-t-slate-400 rounded-full animate-spin" />
                    <p className="text-slate-500 text-sm">Carregando reembolsos...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : categories.length > 0 ? (
              categories.map((categories) => (
                <TableRow
                key={categories.id}
                className="border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                  <TableCell className="font-mono text-slate-500">{categories.id}</TableCell>

                    {/* editar */}
                    <TableCell className="flex flex-row gap-1 font-medium text-slate-200 max-w-[200px] truncate">
                        {categories.nome.length > 30 
                        ? categories.nome.slice(0, 30) + '...' 
                        : categories.nome}
                        <Pencil
                        onClick={async (e) => {
                            e.stopPropagation();
                            navigate({
                              to: '/interface/categorias/edit/$id',
                              params: { id: categories.id }
                            })
                            try {
                              navigate({
                              to: '/interface/categorias/edit/$id',
                              params: { id: categories.id }
                            })
                            setSelectedCategoryId(categories.id);
                            } catch (err) {
                              setError("Erro ao tentar editar categoria.") 
                              console.error(err)
                            }
                        }}
                        size={15} className="mr-2 text-red-400 hover:text-blue-500"/>
                    </TableCell>
                  
                  <TableCell className="text-slate-500 hidden md:table-cell">
                    {categories.ativo ? 'Ativo' : 'Inativo'}
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-200 hover:bg-slate-800">
                          <Settings2 size={16} />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent className="bg-slate-800 border-slate-700 text-slate-200 w-48" align="end">
                        
                        {/* desativar */}
                        {(categories.ativo === true) && (
                        <DropdownMenuItem
                        className="focus:bg-slate-700 focus:text-slate-100 cursor-pointer"
                        onClick={async (e) => {
                        e.stopPropagation();
                        try {
                            await deleteCategory(categories.id);
                            fetchCategories();
                        } catch (err) {
                            setError("Erro ao tentar desativar categoria.") 
                            console.error(err)
                        }
                        }}
                        >
                        <X size={15} className="mr-2 text-white" />
                            Desativar
                        </DropdownMenuItem>
                        )}
                        
                        {(categories.ativo === false) && (
                        <DropdownMenuItem
                        className="focus:bg-slate-700 focus:text-slate-100 cursor-pointer"
                        onClick={async (e) => {
                        e.stopPropagation();
                        try {
                            await updateCategory(categories.id, {
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
                        <Check size={15} className="mr-2 text-white" />
                            Ativar
                        </DropdownMenuItem>
                        )}


                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>

                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <FileText size={32} className="text-slate-700" />
                    <p className="text-slate-500">Não há nenhuma categoria..</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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
  )
}

export default CategoriesTable