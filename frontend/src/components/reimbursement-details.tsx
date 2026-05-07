import { useEffect, useState } from 'react'
import {
  Calendar,
  DollarSign,
  FileText,
  History,
  User,
  X,
} from 'lucide-react'

import dayjs from 'dayjs'

import {
  getAttachments,
  getReimbursementById,
  getReimbursementHistory,
  downloadAttachment
} from '@/api/reimbursements'

import type {
  Reimbursement,
  ReimbursementHistoryItem,
} from '@/types'

import { StatusBadge } from './status-badge'

interface ReimbursementDetailsProps {
  isOpen: boolean
  onClose: () => void
  reimbursementId: string
}

function ReimbursementDetails({
  isOpen,
  onClose,
  reimbursementId,
}: ReimbursementDetailsProps) {

  const [attachments, setAttachments] = useState<any[]>([])
  const [reimbursement, setReimbursement] = useState<Reimbursement | null>(null)
  const [history, setHistory] = useState<ReimbursementHistoryItem[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ============================================================================
  // FETCH DATA
  // ============================================================================

  useEffect(() => {
    if (!isOpen || !reimbursementId) return

    async function fetchData() {
      setLoading(true)
      setError('')

      try {
        const [
          reimbursementData,
          historyData,
          attachmentsData
        ] = await Promise.all([
          getReimbursementById(reimbursementId),
          getReimbursementHistory(reimbursementId),
          getAttachments(reimbursementId),
        ])

        setReimbursement(reimbursementData)
        setHistory(historyData)
        setAttachments(attachmentsData)

      } catch (err) {
        setError('Erro ao carregar detalhes do reembolso.')
        console.error(err)

      } finally {
        setLoading(false)
      }
    }

    fetchData()

  }, [isOpen, reimbursementId])

  if (!isOpen) return null

  // ============================================================================
  // ACTION LABELS
  // ============================================================================

  const actionLabels: Record<string, string> = {
    CREATED: 'Criado',
    UPDATED: 'Atualizado',
    SUBMITTED: 'Enviado',
    APPROVED: 'Aprovado',
    REJECTED: 'Rejeitado',
    PAID: 'Pago',
    CANCELED: 'Cancelado',
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      {/* overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* modal */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900/95 shadow-2xl">

        {/* header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-xl px-6 py-5">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800/50 border border-zinc-700/50">
              <FileText size={18} className="text-zinc-400" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Detalhes do reembolso
              </h2>

              <p className="text-sm text-zinc-500">
                Informações completas da solicitação
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700/50 bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* content */}
        <div className="p-6">

          {/* loading */}
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <div className="w-6 h-6 rounded-full border-2 border-zinc-700 border-t-zinc-400 animate-spin" />

              <p className="text-sm text-zinc-500">
                Carregando detalhes...
              </p>
            </div>

          ) : error ? (

            /* error */
            <div className="flex flex-col items-center gap-4 py-20">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
                <X size={24} className="text-red-400" />
              </div>

              <div className="text-center">
                <p className="text-sm text-red-400">
                  {error}
                </p>
              </div>
            </div>

          ) : reimbursement ? (

            <div className="space-y-8">

              {/* info cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* id */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={15} className="text-zinc-500" />
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      ID
                    </p>
                  </div>

                  <p className="font-mono text-sm text-zinc-200 break-all">
                    {reimbursement.id}
                  </p>
                </div>

                {/* status */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <History size={15} className="text-zinc-500" />
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      Status
                    </p>
                  </div>

                  <StatusBadge status={reimbursement.status} />
                </div>

                {/* categoria */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={15} className="text-zinc-500" />
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      Categoria
                    </p>
                  </div>

                  <p className="text-sm font-medium text-white">
                    {reimbursement.categoria.nome}
                  </p>
                </div>

                {/* valor */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={15} className="text-zinc-500" />
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      Valor
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-white">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(reimbursement.valor)}
                  </p>
                </div>

                {/* data */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={15} className="text-zinc-500" />
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      Data da despesa
                    </p>
                  </div>

                  <p className="text-sm text-zinc-200">
                    {dayjs(reimbursement.dataDespesa).format('DD/MM/YYYY')}
                  </p>
                </div>

                {/* solicitante */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={15} className="text-zinc-500" />
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      Solicitante
                    </p>
                  </div>

                  <p className="text-sm text-zinc-200">
                    {reimbursement.solicitante?.nome || 'N/A'}
                  </p>
                </div>

              </div>

              {/* descrição */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={16} className="text-zinc-500" />

                  <p className="text-sm font-medium text-white">
                    Descrição
                  </p>
                </div>

                <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">
                  {reimbursement.descricao}
                </p>
              </div>

              {/* anexos */}
              <div className="space-y-4">

                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-zinc-400" />

                  <h3 className="text-base font-semibold text-white">
                    Anexos
                  </h3>

                  <span className="text-sm text-zinc-500">
                    ({attachments.length})
                  </span>
                </div>

                {attachments.length > 0 ? (
                  <div className="space-y-3">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-800/20 p-4 hover:bg-zinc-800/40 transition-colors"
                      >

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700/50">
                            <FileText size={18} className="text-zinc-400" />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-white">
                              {attachment.nomeArquivo}
                            </p>

                            <p className="text-xs text-zinc-500">
                              {attachment.tipoArquivo}
                            </p>
                          </div>
                        </div>

                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href={`http://localhost:3000${attachment.urlArquivo}`}
                          className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                        >
                          Visualizar
                        </a>

                        <a
                        className="text-sm font-medium text-zinc-300 hover:text-white transition-colors bg-white/10 p-3 rounded-full" 
                        onClick={() => {
                          downloadAttachment(attachment.id, reimbursement.id);
                        }}>
                          Baixar
                        </a>
                      </div>
                    ))}
                  </div>

                ) : (
                  <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 py-10 text-center">
                    <p className="text-sm text-zinc-500">
                      Nenhum anexo vinculado.
                    </p>
                  </div>
                )}
              </div>

              {/* rejeição */}
              {reimbursement.status === 'REJEITADO' &&
                'justificativaRejeicao' in reimbursement && (

                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5">

                  <p className="mb-2 text-sm font-medium text-red-400">
                    Justificativa de rejeição
                  </p>

                  <p className="text-sm text-zinc-200">
                    {(reimbursement as any).justificativaRejeicao}
                  </p>
                </div>
              )}

              {/* histórico */}
              <div className="space-y-4">

                <div className="flex items-center gap-2">
                  <History size={18} className="text-zinc-400" />

                  <h3 className="text-base font-semibold text-white">
                    Histórico
                  </h3>
                </div>

                {history.length > 0 ? (

                  <div className="space-y-3">

                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-zinc-800 bg-zinc-800/20 p-4"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div>
                            <p className="font-medium text-white">
                              {actionLabels[item.acao] || item.acao}
                            </p>

                            <p className="text-sm text-zinc-500">
                              Por: {item.usuario?.nome || 'Usuário'}
                            </p>
                          </div>

                          <span className="text-xs text-zinc-500 whitespace-nowrap">
                            {dayjs(item.criadoEm).format('DD/MM/YYYY HH:mm')}
                          </span>
                        </div>

                        {item.observacao && (
                          <div className="mt-3 rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-3">
                            <p className="text-sm text-zinc-300">
                              {item.observacao}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}

                  </div>

                ) : (
                  <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 py-10 text-center">
                    <p className="text-sm text-zinc-500">
                      Nenhum histórico disponível.
                    </p>
                  </div>
                )}
              </div>

            </div>

          ) : (

            /* not found */
            <div className="flex flex-col items-center justify-center gap-4 py-20">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800/50 border border-zinc-700/50">
                <FileText size={24} className="text-zinc-500" />
              </div>

              <p className="text-sm text-zinc-500">
                Reembolso não encontrado.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default ReimbursementDetails