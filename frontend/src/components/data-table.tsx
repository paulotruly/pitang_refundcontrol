import { useEffect, useState } from 'react'
import { useSearch } from '@tanstack/react-router'
import type { Reimbursement } from "../types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FileText, PencilIcon, Settings2, TrashIcon, Send, Check, X, Ban, DollarSign } from "lucide-react"
import { getReimbursementsWithTotal } from '@/api/reimbursements'
import dayjs from 'dayjs'
import { StatusBadge } from './status-badge'

import { useAuth } from '@/context/AuthContext'
import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { Button } from './ui/button'

function DataTable() {
  const {user} = useAuth()
  const navigate = useNavigate()

  const REIMBURSEMENT_PER_PAGE = 15

  const search = useSearch({ from: '/interface' }) // pra q serve isso mesmo? 
  const page = search.page ?? 1
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([])
  const [totalReimbursements, setTotalReimbursements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const totalPages = Math.ceil(totalReimbursements / REIMBURSEMENT_PER_PAGE)

  const fetchReimbursements = async () => {
    setLoading(true)
    try {
      const data = await getReimbursementsWithTotal(page, REIMBURSEMENT_PER_PAGE)
      setReimbursements(data?.dados || [])
      setTotalReimbursements(data?.paginacao?.totalItens || 0)
    } catch (err) {
      setError("Erro ao carregar reembolsos. Tente novamente.")
      setReimbursements([])
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReimbursements()
  }, [page])

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">...</div>
        {user?.perfil === "COLABORADOR" && (
          <button
            onClick={() => navigate({ to: '/interface/solicitacoes/novo' })}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Plus size={16} />
            Nova Solicitação
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800 border border-slate-700/50">
            <FileText size={20} className="text-slate-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-100">Reembolsos</h1>
          </div>
        </div>
      </div>

      {/* table */}
      <div className="rounded-xl border border-slate-800/50 bg-slate-900/30 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800/50 hover:bg-transparent">
              <TableHead className="text-slate-400 font-medium">ID</TableHead>
              <TableHead className="text-slate-400 font-medium">Categoria</TableHead>
              <TableHead className="text-slate-400 font-medium hidden lg:table-cell">Descrição</TableHead>
              <TableHead className="text-slate-400 font-medium hidden xl:table-cell">DataDespesa</TableHead>
              <TableHead className="text-slate-400 font-medium">Status</TableHead>
              <TableHead className="text-slate-400 font-medium hidden md:table-cell">Valor</TableHead>
              <TableHead className="text-slate-400 font-medium">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {error ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3 text-red-500">
                    <p>{error}</p>
                    <button 
                      onClick={() => fetchReimbursements()} 
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
            ) : reimbursements.length > 0 ? (
              reimbursements.map((reimbursement) => (
                <TableRow key={reimbursement.id} className="border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                  <TableCell className="font-mono text-slate-500">{reimbursement.id}</TableCell>

                  <TableCell className="font-medium text-slate-200 max-w-[200px] truncate">
                    {reimbursement.categoria.nome.length > 30 
                      ? reimbursement.categoria.nome.slice(0, 30) + '...' 
                      : reimbursement.categoria.nome}
                  </TableCell>

                  <TableCell className="text-slate-400 max-w-[200px] truncate hidden lg:table-cell">
                    {reimbursement.descricao.length > 35 
                      ? reimbursement.descricao.slice(0, 35) + '...' 
                      : reimbursement.descricao}
                  </TableCell>
                  
                  <TableCell className="text-slate-500 hidden md:table-cell">
                    {dayjs(reimbursement.dataDespesa).format('DD/MM/YYYY')}
                  </TableCell>

                  <TableCell className="text-slate-500 hidden md:table-cell">
                    <StatusBadge status={reimbursement.status}/>
                  </TableCell>

                  <TableCell className="text-slate-500 hidden md:table-cell">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(reimbursement.valor)}
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-200 hover:bg-slate-800">
                          <Settings2 size={16} />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent className="bg-slate-800 border-slate-700 text-slate-200 w-48" align="end">
                        {/* aprovar - apenas GESTOR ou ADMIN com status ENVIADO */}
                        {(user?.perfil === 'GESTOR' || user?.perfil === 'ADMIN') && reimbursement.status === 'ENVIADO' && (
                          <DropdownMenuItem className="focus:bg-slate-700 focus:text-slate-100 cursor-pointer">
                            <Check size={15} className="mr-2 text-green-400" />
                            Aprovar
                          </DropdownMenuItem>
                        )}

                        {/* rejeitar - apenas GESTOR ou ADMIN com status ENVIADO */}
                        {(user?.perfil === 'GESTOR' || user?.perfil === 'ADMIN') && reimbursement.status === 'ENVIADO' && (
                          <DropdownMenuItem className="focus:bg-slate-700 focus:text-slate-100 cursor-pointer">
                            <X size={15} className="mr-2 text-red-400" />
                            Rejeitar
                          </DropdownMenuItem>
                        )}

                        {/* pagar - apenas FINANCEIRO ou ADMIN status APROVADO */}
                        {(user?.perfil === 'FINANCEIRO' || user?.perfil === 'ADMIN') && reimbursement.status === 'APROVADO' && (
                          <DropdownMenuItem className="focus:bg-slate-700 focus:text-slate-100 cursor-pointer">
                            <DollarSign size={15} className="mr-2 text-emerald-400" />
                            Pagar
                          </DropdownMenuItem>
                        )}

                        {/* Enviar - apenas COLABORADOR com status RASCUNHO */}
                        {user?.perfil === 'COLABORADOR' && reimbursement.status === 'RASCUNHO' && (
                          <DropdownMenuItem className="focus:bg-slate-700 focus:text-slate-100 cursor-pointer">
                            <Send size={15} className="mr-2 text-blue-400" />
                            Enviar
                          </DropdownMenuItem>
                        )}

                        {/* Cancelar - todos, menos se status for PAGO */}
                        {reimbursement.status !== 'PAGO' && (
                          <DropdownMenuItem className="focus:bg-red-900/30 focus:text-red-400 cursor-pointer text-red-400">
                            <Ban size={15} className="mr-2" />
                            Cancelar
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
                    <p className="text-slate-500">Não há nenhum reembolso.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default DataTable