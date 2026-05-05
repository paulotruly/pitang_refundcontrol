import { useState, useEffect } from 'react';
import { X, FileText, User, Calendar, DollarSign, History } from 'lucide-react';
import { getReimbursementById, getReimbursementHistory } from '@/api/reimbursements';
import type { Reimbursement, ReimbursementHistoryItem } from '@/types';
import { StatusBadge } from './status-badge';
import dayjs from 'dayjs';

interface ReimbursementDetailsProps {
  isOpen: boolean; // controla se o modal está aberto
  onClose: () => void; // função para fechar o modal
  reimbursementId: string; // ID do reembolso a ser exibido
}

function ReimbursementDetails({ isOpen, onClose, reimbursementId }: ReimbursementDetailsProps) {
  const [reimbursement, setReimbursement] = useState<Reimbursement | null>(null);
  const [history, setHistory] = useState<ReimbursementHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !reimbursementId) return;

    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const [reimbData, historyData] = await Promise.all([
          getReimbursementById(reimbursementId),
          getReimbursementHistory(reimbursementId)
        ]);
        setReimbursement(reimbData);
        setHistory(historyData);
      } catch (err) {
        setError('Erro ao carregar detalhes do reembolso.');
        console.error(err)
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isOpen, reimbursementId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative z-10 w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-100">
            Detalhes do reembolso
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="w-6 h-6 border-2 border-slate-600 border-t-slate-400 rounded-full animate-spin" />
            <p className="text-slate-500 text-sm">Carregando detalhes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <p>{error}</p>
          </div>
        ) : reimbursement ? (
          // Detalhes do reembolso
          <div className="space-y-6">
            {/* Informações básicas em grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* ID */}
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <p className="text-sm text-slate-400 mb-1">ID</p>
                <p className="font-mono text-slate-200 text-sm">{reimbursement.id}</p>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-lg">
                <p className="text-sm text-slate-400 mb-1">Status</p>
                <StatusBadge status={reimbursement.status} />
              </div>

              <div className="bg-slate-800/50 p-4 rounded-lg">
                <p className="text-sm text-slate-400 mb-1">Categoria</p>
                <p className="text-slate-200">{reimbursement.categoria.nome}</p>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-lg">
                <p className="text-sm text-slate-400 mb-1">Valor</p>
                <p className="text-slate-200 font-medium">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(reimbursement.valor)}
                </p>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-lg">
                <p className="text-sm text-slate-400 mb-1">Data da despesa</p>
                <p className="text-slate-200">
                  {dayjs(reimbursement.dataDespesa).format('DD/MM/YYYY')}
                </p>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-lg">
                <p className="text-sm text-slate-400 mb-1">Solicitante</p>
                <p className="text-slate-200">
                  {reimbursement.solicitante?.nome || 'N/A'}
                </p>
              </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg">
              <p className="text-sm text-slate-400 mb-2">Descrição</p>
              <p className="text-slate-200 whitespace-pre-wrap">{reimbursement.descricao}</p>
            </div>

            {reimbursement.status === 'REJEITADO' && 'justificativaRejeicao' in reimbursement && (
              <div className="bg-red-900/20 border border-red-800/50 p-4 rounded-lg">
                <p className="text-sm text-red-400 mb-2">Justificativa de rejeição</p>
                <p className="text-slate-200">{(reimbursement as any).justificativaRejeicao}</p>
              </div>
            )}

            {/* histórico de ações */}
            <div>
              <h3 className="text-lg font-medium text-slate-200 mb-3 flex items-center gap-2">
                <History size={18} />
                Histórico
              </h3>
              {history.length > 0 ? (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div key={item.id} className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-slate-200 font-medium">
                            {item.acao === 'CREATED' && 'Criado'}
                            {item.acao === 'UPDATED' && 'Atualizado'}
                            {item.acao === 'SUBMITTED' && 'Enviado'}
                            {item.acao === 'APPROVED' && 'Aprovado'}
                            {item.acao === 'REJECTED' && 'Rejeitado'}
                            {item.acao === 'PAID' && 'Pago'}
                            {item.acao === 'CANCELLED' && 'Cancelado'}
                          </p>
                          <p className="text-sm text-slate-400">
                            Por: {item.usuario?.nome || 'Usuário'}
                          </p>
                        </div>
                        <p className="text-sm text-slate-500">
                          {dayjs(item.criadoEm).format('DD/MM/YYYY HH:mm')}
                        </p>
                      </div>
                      {item.observacao && (
                        <p className="mt-2 text-sm text-slate-300 bg-slate-800/50 p-2 rounded">
                          {item.observacao}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">Nenhum histórico disponível.</p>
              )}
            </div>
          </div>
        ) : (
          // caso não encontre o reembolso
          <div className="text-center py-12 text-slate-500">
            <p>Reembolso não encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReimbursementDetails;
