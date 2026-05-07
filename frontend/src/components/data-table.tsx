"use client"

import { useEffect, useState } from 'react'
import { useMatch, useSearch } from '@tanstack/react-router'
import type { Reimbursement } from "../types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  FileText, 
  PencilIcon, 
  Settings2, 
  Send, 
  Check, 
  X, 
  Ban, 
  DollarSign, 
  Plus, 
  Search, 
  ChevronDown,
  LogOut,
  Menu,
  User,
  FolderOpen
} from "lucide-react"
import { approveReimbursement, cancelReimbursement, getReimbursementsWithTotal, payReimbursement, sendReimbursement } from '@/api/reimbursements'
import dayjs from 'dayjs'
import { StatusBadge } from './status-badge'
import JustificationForm from './justification-form'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from '@tanstack/react-router'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { Button } from './ui/button'
import ReimbursementDetails from './reimbursement-details'
import CreateReimbursement from './create-reimbursement'
import EditReimbursement from './edit-reimbursement'
import { createReimbursementRoute, editReimbursementRoute } from '@/router'
import Pagination from './pagination'

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

// ============================================
// DATA TABLE COMPONENT
// ============================================
const REIMBURSEMENT_PER_PAGE = 15

function DataTable() {
  // removi o open dos modals e agora ele usa o useMatch pra verificar se a rota atual corresponde ao create ou edit
  // se a rota for /create ou /edit/:id, o useMatch retorna um objeto (truthy) e o modal abre
  // se não for, ele retorna undefined e o modal fica fechado.
  // o shouldThrow: false é pra evitar erro quando a rota não bate, deixando o retorno seguro
  // no caso do edit, eu também pego o id direto da URL (editMatch.params.id),
  // então não preciso mais guardar isso em state
  // basicamente agora o estado do modal vem da rota, não mais de variáveis locais
  const createMatch = useMatch({
    from: createReimbursementRoute.id,
    shouldThrow: false,
  })

  const editMatch = useMatch({
    from: editReimbursementRoute.id,
    shouldThrow: false,
  })

  const { user } = useAuth()
  const navigate = useNavigate()

  // estados para controlar o modal de justificativa
  const [isJustificationModalOpen, setIsJustificationModalOpen] = useState(false)
  const [selectedReimbursementId, setSelectedReimbursementId] = useState<string | null>(null)

  const [isReimbursementDetailsOpen, setIsReimbursementDetailsOpen] = useState(false)
  const [selectedReimbursementDetailsId, setSelectedReimbursementDetailsId] = useState<string | null>(null)

  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([])
  const [totalReimbursements, setTotalReimbursements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const search = useSearch({ from: '/interface' })
  const page = Math.max(1, Number(search.page) || 1)

  // pegando os filtros da URL, se tiver
  const status = search.status || ''
  const categoria = search.categoria || ''
  const busca = search.busca || ''
  const ordenarPor = search.ordenarPor || 'criadoEm'
  const ordem = search.ordem || 'desc'

  const totalPages = Math.ceil(totalReimbursements / REIMBURSEMENT_PER_PAGE)

  const fetchReimbursements = async () => {
    setLoading(true)
    try {
      // a função getReimbursementsWithTotal agora aceita um objeto com
      // todos os parâmetros de filtro, paginação e ordenação que são extraídos da URL
      const data = await getReimbursementsWithTotal({
        pagina: page,
        limite: REIMBURSEMENT_PER_PAGE,
        ordenarPor,
        ordem,
        ...(status && { status }), // só inclui nos parâmetros se tiver um valor
        ...(categoria && { categoria }),
        ...(busca && { busca }),
      })
      setReimbursements(data?.dados || [])
      setTotalReimbursements(data?.paginacao?.totalItens || 0)
    } catch (err) {
      setError("Erro ao carregar reembolsos.")
      setReimbursements([])
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReimbursements()
  }, [page, status, categoria, busca, ordenarPor, ordem])

  const handleCreated = () => {
    fetchReimbursements() // recarrega a lista

    setSuccess("Operacao efetuada com sucesso!")

    setTimeout(() => {
      setSuccess("")
    }, 5000)
  }

  const handlePageChange = (newPage: number) => {
    const currentUrl = new URL(window.location.href)
    currentUrl.searchParams.set('page', String(newPage))
    navigate({ to: currentUrl.pathname + currentUrl.search })
  }

  const openCreatedDetails = () => {
    fetchReimbursements() // recarrega a lista

    setSuccess("Operacao efetuada com sucesso!")

    if (reimbursements.length > 0) {
      const lastCreated = reimbursements[0] // o último criado é o primeiro da lista
      setSelectedReimbursementDetailsId(lastCreated.id)
      setIsReimbursementDetailsOpen(true)
    }

    setTimeout(() => {
      setSuccess("")
    }, 5000)
  }

  // helper para atualizar parametros na URL
  const updateUrlParam = (key: string, value: string, resetPage = true) => {
    const currentUrl = new URL(window.location.href)
    currentUrl.searchParams.set(key, value)
    if (resetPage) currentUrl.searchParams.set('page', '1')
    navigate({ to: currentUrl.pathname + currentUrl.search })
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <DashboardHeader/>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800">
              <FileText size={20} className="text-zinc-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Reembolsos</h1>
              <p className="text-sm text-zinc-500">
                {totalReimbursements} {totalReimbursements === 1 ? 'solicitacão' : 'solicitações'}
              </p>
            </div>
          </div>

          {user?.perfil === "COLABORADOR" && (
            <button
              onClick={() => navigate({ to: '/interface/solicitacoes/create' })}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-100 text-zinc-950 text-sm font-medium rounded-lg transition-colors"
            >
              <Plus size={16} />
              Nova solicitacao
            </button>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            {success}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar colaborador..."
                value={busca}
                onChange={(e) => updateUrlParam('busca', e.target.value)}
                className="w-full h-10 pl-9 pr-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-zinc-700 transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={status}
                onChange={(e) => { // ao mudar o filtro, atualiza a URL com o novo status e reseta para a página 1
                  updateUrlParam('status', e.target.value)
                }}
                className="w-full h-10 px-3 pr-8 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-zinc-700 transition-colors cursor-pointer"
              >
                <option value="">Todos status</option>
                <option value="RASCUNHO">Rascunho</option>
                <option value="ENVIADO">Enviado</option>
                <option value="APROVADO">Aprovado</option>
                <option value="PAGO">Pago</option>
                <option value="REJEITADO">Rejeitado</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>

            {/* Sort By */}
            <div className="relative">
              <select
                value={ordenarPor}
                onChange={(e) => { // mantém os outros parâmetros e só atualiza o campo de ordenação
                  updateUrlParam('ordenarPor', e.target.value, false)
                }}
                className="w-full h-10 px-3 pr-8 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-zinc-700 transition-colors cursor-pointer"
              >
                <option value="criadoEm">Mais recentes</option>
                <option value="valor">Valor</option>
                <option value="dataDespesa">Data despesa</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>

            {/* Order */}
            <div className="relative">
              <select
                value={ordem}
                onChange={(e) => { // mantém os outros parâmetros e só atualiza a ordem
                  updateUrlParam('ordem', e.target.value, false)
                }}
                className="w-full h-10 px-3 pr-8 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-zinc-700 transition-colors cursor-pointer"
              >
                <option value="desc">Decrescente</option>
                <option value="asc">Crescente</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto min-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wider">ID</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Categoria</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Descricao</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wider hidden xl:table-cell">Data</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">Valor</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wider w-12"></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
                          <X size={20} className="text-red-400" />
                        </div>
                        <p className="text-sm text-red-400">{error}</p>
                        <button
                          onClick={() => fetchReimbursements()}
                          className="text-xs text-zinc-400 hover:text-white underline underline-offset-2 transition-colors"
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
                        <div className="h-6 w-6 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
                        <p className="text-sm text-zinc-500">Carregando reembolsos...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : reimbursements.length > 0 ? (
                  reimbursements.map((reimbursement) => (
                    <TableRow
                      key={reimbursement.id}
                      onClick={() => {
                        setSelectedReimbursementDetailsId(reimbursement.id)
                        setIsReimbursementDetailsOpen(true)
                      }}
                      className="border-zinc-800/50 hover:bg-zinc-800/30 transition-colors cursor-pointer"
                    >
                      <TableCell className="font-mono text-xs text-zinc-500">
                        {reimbursement.id.slice(0, 8)}...
                      </TableCell>

                      <TableCell className="font-medium text-sm text-zinc-200 max-w-[180px] truncate">
                        {reimbursement.categoria.nome.length > 25
                          ? reimbursement.categoria.nome.slice(0, 25) + '...'
                          : reimbursement.categoria.nome}
                      </TableCell>

                      <TableCell className="text-sm text-zinc-400 max-w-[200px] truncate hidden lg:table-cell">
                        {reimbursement.descricao.length > 30
                          ? reimbursement.descricao.slice(0, 30) + '...'
                          : reimbursement.descricao}
                      </TableCell>

                      <TableCell className="text-sm text-zinc-500 hidden xl:table-cell">
                        {dayjs(reimbursement.dataDespesa).format('DD/MM/YYYY')}
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={reimbursement.status} />
                      </TableCell>

                      <TableCell className="text-sm font-medium text-zinc-300 hidden md:table-cell">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(reimbursement.valor)}
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Settings2 size={16} />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent
                            className="min-w-[180px] p-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl"
                            align="end"
                          >
                            {/* submeter - apenas COLABORADOR com status RASCUNHO */}
                            {user?.perfil === 'COLABORADOR' && reimbursement.status === 'RASCUNHO' && (
                              <DropdownMenuItem
                                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors"
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  try {
                                    await sendReimbursement(reimbursement.id)
                                    fetchReimbursements()
                                  } catch (err) {
                                    setError("Erro ao submeter solicitacao de reembolso.")
                                    console.error(err)
                                  }
                                }}
                              >
                                <Send size={14} className="text-blue-400" />
                                Submeter
                              </DropdownMenuItem>
                            )}

                            {/* aprovar - apenas GESTOR ou ADMIN com status ENVIADO */}
                            {(user?.perfil === 'GESTOR' || user?.perfil === 'ADMIN') && reimbursement.status === 'ENVIADO' && (
                              <DropdownMenuItem
                                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors"
                                onClick={async (e) => {
                                  e.stopPropagation() // evita que os onclick dos elementos pais ativem
                                  try {
                                    await approveReimbursement(reimbursement.id) // id vem do map
                                    fetchReimbursements() // atualiza a tabela com o novo status
                                  } catch (err) {
                                    setError("Erro ao aprovar reembolso.")
                                  }
                                }}
                              >
                                <Check size={14} className="text-emerald-400" />
                                Aprovar
                              </DropdownMenuItem>
                            )}

                            {/* rejeitar - apenas GESTOR ou ADMIN com status ENVIADO */}
                            {(user?.perfil === 'GESTOR' || user?.perfil === 'ADMIN') && reimbursement.status === 'ENVIADO' && (
                              <DropdownMenuItem
                                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // abre o modal de justificativa passando o ID do reembolso
                                  setSelectedReimbursementId(reimbursement.id)
                                  setIsJustificationModalOpen(true)
                                }}
                              >
                                <X size={14} className="text-red-400" />
                                Rejeitar
                              </DropdownMenuItem>
                            )}

                            {/* pagar - apenas FINANCEIRO ou ADMIN status APROVADO */}
                            {(user?.perfil === 'FINANCEIRO' || user?.perfil === 'ADMIN') && reimbursement.status === 'APROVADO' && (
                              <DropdownMenuItem
                                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors"
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  try {
                                    await payReimbursement(reimbursement.id)
                                    fetchReimbursements()
                                  } catch (err) {
                                    setError("Erro ao pagar reembolso.")
                                    console.error(err)
                                  }
                                }}
                              >
                                <DollarSign size={14} className="text-emerald-400" />
                                Pagar
                              </DropdownMenuItem>
                            )}

                            {/* editar - apenas COLABORADOR com status RASCUNHO */}
                            {user?.perfil === 'COLABORADOR' && reimbursement.status === 'RASCUNHO' && (
                              <DropdownMenuItem
                                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigate({
                                    to: '/interface/solicitacoes/edit/$id',
                                    params: { id: reimbursement.id }
                                  })
                                  setSelectedReimbursementDetailsId(reimbursement.id)
                                }}
                              >
                                <PencilIcon size={14} className="text-zinc-400" />
                                Editar
                              </DropdownMenuItem>
                            )}

                            {/* cancelar - todos, menos se status for PAGO, CANCELADO ou REJEITADO */}
                            {!['PAGO', 'CANCELADO', 'REJEITADO'].includes(reimbursement.status) && (
                              <>
                                <div className="h-px bg-zinc-800 my-1" />
                                <DropdownMenuItem
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors"
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    try {
                                      await cancelReimbursement(reimbursement.id)
                                      fetchReimbursements()
                                    } catch (err) {
                                      setError("Erro ao cancelar reembolso.")
                                      console.error(err)
                                    }
                                  }}
                                >
                                  <Ban size={14} />
                                  Cancelar
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <div className="flex flex-col items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800/50 border border-zinc-700/50">
                          <FileText size={24} className="text-zinc-600" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-zinc-400">Nenhum reembolso encontrado</p>
                          <p className="text-xs text-zinc-600 mt-1">Crie uma nova solicitacao para comecar</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <JustificationForm
        isOpen={isJustificationModalOpen}
        onClose={() => {
          setIsJustificationModalOpen(false)
          setSelectedReimbursementId(null)
        }}
        reimbursementId={selectedReimbursementId || ''}
        onSuccess={() => {
          fetchReimbursements() // recarrega a lista após rejeição
        }}
      />

      <ReimbursementDetails
        isOpen={isReimbursementDetailsOpen}
        onClose={() => {
          setIsReimbursementDetailsOpen(false)
          setSelectedReimbursementDetailsId(null)
        }}
        reimbursementId={selectedReimbursementDetailsId || ''}
      />

      <CreateReimbursement
        isOpen={!!createMatch}
        onSuccess={openCreatedDetails}
        onClose={() => navigate({ to: '/interface/solicitacoes' })}
      />

      <EditReimbursement
        isOpen={!!editMatch}
        onSuccess={openCreatedDetails}
        onClose={() => navigate({ to: '/interface/solicitacoes' })}
        reimbursementId={selectedReimbursementDetailsId || ''}
      />
    </div>
  )
}

export default DataTable
