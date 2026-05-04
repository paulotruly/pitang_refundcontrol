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
import { FileText } from "lucide-react"
import { getReimbursementsWithTotal } from '@/api/reimbursements'
import dayjs from 'dayjs'

function DataTable() {
  const REIMBURSEMENT_PER_PAGE = 15

  const search = useSearch({ from: '/interface' }) // pra q serve isso mesmo? 
  const page = search.page ?? 1
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([])
  const [totalReimbursements, setTotalReimbursements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const totalPages = Math.ceil(totalReimbursements / REIMBURSEMENT_PER_PAGE)

  useEffect(() => {
    async function fetchReimbursements() {
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
    fetchReimbursements()
  }, [page])

  return (
    <div className="space-y-6">
      {/* header */}
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
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
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

                  <TableCell className="text-slate-500 hidden md:table-cell">{reimbursement.status}</TableCell>

                  <TableCell className="text-slate-500 hidden md:table-cell">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(reimbursement.valor)}
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