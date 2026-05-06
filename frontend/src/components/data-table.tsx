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
import { FileText, PencilIcon, Settings2, Send, Check, X, Ban, DollarSign } from "lucide-react"
import { approveReimbursement, cancelReimbursement, getReimbursementsWithTotal, payReimbursement, sendReimbursement } from '@/api/reimbursements'
import dayjs from 'dayjs'
import { StatusBadge } from './status-badge'
import JustificationForm from './justification-form'

import { useAuth } from '@/context/AuthContext'
import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { Button } from './ui/button'
import ReimbursementDetails from './reimbursement-details'
import CreateReimbursement from './create-reimbursement'
import EditReimbursement from './edit-reimbursement'
import { createReimbursementRoute, editReimbursementRoute } from '@/router'

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

  const {user} = useAuth()
  const navigate = useNavigate()

  // estados para controlar o modal de justificativa
  const [isJustificationModalOpen, setIsJustificationModalOpen] = useState(false)
  const [selectedReimbursementId, setSelectedReimbursementId] = useState<string | null>(null)

  const [isReimbursementDetailsOpen, setIsReimbursementDetailsOpen] = useState(false)
  const [selectedReimbursementDetailsId, setSelectedReimbursementDetailsId] = useState<string | null>(null)

  const handleCreated = () => {
    fetchReimbursements(); // recarrega a lista]

    setSuccess("Operação efetuada com sucesso!")

    setTimeout(() => {
      setSuccess("")
    }, 5000)
  };

  const openCreatedDetails = () => {
    fetchReimbursements(); // recarrega a lista]

    setSuccess("Operação efetuada com sucesso!")

    if (reimbursements.length > 0) {
      const lastCreated = reimbursements[0] // o último criado é o primeiro da lista
      setSelectedReimbursementDetailsId(lastCreated.id);
      setIsReimbursementDetailsOpen(true);
    }

    setTimeout(() => {
      setSuccess("")
    }, 5000)

  };

  const REIMBURSEMENT_PER_PAGE = 15

  const search = useSearch({ from: '/interface' })
  const page = search.page ?? 1
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([])
  const [totalReimbursements, setTotalReimbursements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const totalPages = Math.ceil(totalReimbursements / REIMBURSEMENT_PER_PAGE)

  const fetchReimbursements = async () => {
    setLoading(true)
    try {
      const data = await getReimbursementsWithTotal(page, REIMBURSEMENT_PER_PAGE)
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
  }, [page])

  return (
    <div className="space-y-6">
      {/* header */}

      <div className="flex items-center justify-between">

        {user?.perfil === "ADMIN" && (
          <button
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            onClick={async (e) => {
              navigate({ to: '/interface/categorias/' })
            }}
          >
            <Plus size={16} />
            Visualizar categorias
          </button>
        )}

        {user?.perfil === "COLABORADOR" && (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            onClick={async (e) => {
              navigate({ to: '/interface/solicitacoes/create' })
            }}
          >
            <Plus size={16} />
            Nova solicitação
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

      
      {success ? (
        <div className="flex flex-col items-center gap-3 text-green-700 bg-green-300 rounded">
          <p>{success}</p>
        </div>
      ) : null}

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
                <TableRow
                onClick={async (e) => {
                  e.stopPropagation();
                  setSelectedReimbursementDetailsId(reimbursement.id);
                  setIsReimbursementDetailsOpen(true);
                }}
                key={reimbursement.id}
                className="border-slate-800/30 hover:bg-slate-800/20 transition-colors">
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
                        
                        {/* submeter - apenas COLABORADOR com status RASCUNHO */}
                        {(user?.perfil === 'COLABORADOR') && reimbursement.status === 'RASCUNHO' && (
                          <DropdownMenuItem
                          className="focus:bg-slate-700 focus:text-slate-100 cursor-pointer"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await sendReimbursement(reimbursement.id);
                              fetchReimbursements();
                            } catch (err) {
                              setError("Erro ao submeter solicitação de reembolso.") 
                              console.error(err)
                            }
                          }}
                          >
                            <Send size={15} className="mr-2 text-white" />
                            Submeter
                          </DropdownMenuItem>
                        )}

                        {/* aprovar - apenas GESTOR ou ADMIN com status ENVIADO */}
                        {(user?.perfil === 'GESTOR' || user?.perfil === 'ADMIN') && reimbursement.status === 'ENVIADO' && (
                          <DropdownMenuItem
                          className="focus:bg-slate-700 focus:text-slate-100 cursor-pointer"
                          onClick={async (e) => {
                            e.stopPropagation(); // evita que os onclick dos elementos pais ativem
                            try {
                              await approveReimbursement(reimbursement.id); // id vem do map
                              fetchReimbursements(); // atualiza a tabela com o novo status
                            } catch (err) {
                              setError("Erro ao aprovar reembolso.")
                            }
                          }}
                          >
                            <Check size={15} className="mr-2 text-green-400" />
                            Aprovar
                          </DropdownMenuItem>
                        )}

                        {/* rejeitar - apenas GESTOR ou ADMIN com status ENVIADO */}
                        {(user?.perfil === 'GESTOR' || user?.perfil === 'ADMIN') && reimbursement.status === 'ENVIADO' && (
                          <DropdownMenuItem
                          className="focus:bg-slate-700 focus:text-slate-100 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            // abre o modal de justificativa passando o ID do reembolso
                            setSelectedReimbursementId(reimbursement.id);
                            setIsJustificationModalOpen(true);
                          }}
                          >
                            <X size={15} className="mr-2 text-red-400" />
                            Rejeitar
                          </DropdownMenuItem>
                        )}

                        {/* pagar - apenas FINANCEIRO ou ADMIN status APROVADO */}
                        {(user?.perfil === 'FINANCEIRO' || user?.perfil === 'ADMIN') && reimbursement.status === 'APROVADO' && (
                          <DropdownMenuItem
                          className="focus:bg-slate-700 focus:text-slate-100 cursor-pointer"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await payReimbursement(reimbursement.id);
                              fetchReimbursements();
                            } catch (err) {
                              setError("Erro ao pagar reembolso.")
                              console.error(err)
                            }
                          }}
                          >
                            <DollarSign size={15} className="mr-2 text-emerald-400" />
                            Pagar
                          </DropdownMenuItem>
                        )}

                        {/* cancelar - todos, menos se status for PAGO */}
                        {reimbursement.status !== 'PAGO' && reimbursement.status !== 'CANCELADO' && reimbursement.status !== 'REJEITADO' && (
                          <DropdownMenuItem
                          className="focus:bg-red-900/30 focus:text-red-400 cursor-pointer text-red-400"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await cancelReimbursement(reimbursement.id);
                              fetchReimbursements();
                            } catch (err) {
                              setError("Erro ao cancelar reembolso.")
                              console.error(err)
                            }
                          }}
                          >
                            <Ban size={15} className="mr-2" />
                            Cancelar
                          </DropdownMenuItem>
                        )}


                        {/* editar - apenas COLABORADOR com status RASCUNHO */}
                        {(user?.perfil === 'COLABORADOR') && reimbursement.status === 'RASCUNHO' && (
                          <DropdownMenuItem
                          className="focus:bg-slate-700 focus:text-slate-100 cursor-pointer"
                          onClick={async (e) => {
                            e.stopPropagation();
                            navigate({
                              to: '/interface/solicitacoes/edit/$id',
                              params: { id: reimbursement.id }
                            })
                            try {
                              navigate({
                                to: '/interface/solicitacoes/edit/$id',
                                params: { id: reimbursement.id }
                              })
                              setSelectedReimbursementDetailsId(reimbursement.id);
                            } catch (err) {
                              setError("Erro ao tentar editar reembolso.") 
                              console.error(err)
                            }
                          }}
                          >
                            <PencilIcon size={15} className="mr-2 text-white" />
                            Editar
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

      <JustificationForm
        isOpen={isJustificationModalOpen}
        onClose={() => {
          setIsJustificationModalOpen(false);
          setSelectedReimbursementId(null);
        }}
        reimbursementId={selectedReimbursementId || ''}
        onSuccess={() => {
          fetchReimbursements(); // recarrega a lista após rejeição
        }}
      />

      <ReimbursementDetails
        isOpen={isReimbursementDetailsOpen}
        onClose={() => {
          setIsReimbursementDetailsOpen(false);
          setSelectedReimbursementDetailsId(null);
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