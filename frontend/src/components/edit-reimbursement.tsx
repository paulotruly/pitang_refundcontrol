import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { editAttachment, editReimbursement, getAttachments, getCategories, getReimbursementById, uploadAttachment } from '@/api/reimbursements';
import type { Category, CreateReimbursementInput, Reimbursement } from '@/types';
import { useNavigate } from '@tanstack/react-router';
import router from '@/router';

interface EditReimbursementFormProps {
  isOpen: boolean; 
  onClose: () => void; 
  reimbursementId: string;
  onSuccess?: (id: string) => void;
}

function EditReimbursement({ isOpen, onClose, onSuccess, reimbursementId }: EditReimbursementFormProps) {
  const [reimbursement, setReimbursement] = useState<Reimbursement | null>(null);

  const [categoriaId, setCategoriaId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [dataDespesa, setDataDespesa] = useState('');

  const [attachment, setAttachment] = useState<any[]>([]);
  const [newAttachmentFile, setNewAttachmentFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);

  const [categorias, setCategorias] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen || !reimbursementId) return;

    async function fetchData() {
      setLoadingCategories(true);
      setLoading(true);
      try {
        const [reimbData, attachmentsData, categoriesData] = await Promise.all([
                  getReimbursementById(reimbursementId),
                  getAttachments(reimbursementId),
                  getCategories()
        ]);
        setReimbursement(reimbData);
        setAttachment(attachmentsData)
        setCategorias(categoriesData);

        setCategoriaId(reimbData.categoria.id)
        setDescricao(reimbData.descricao)
        setValor(String(reimbData.valor))
        setDataDespesa(new Date(reimbData.dataDespesa).toISOString().split('T')[0])
      } catch (err) {
        setError('Erro ao carregar reembolso.');
        console.error(err);
      } finally {
        setLoadingCategories(false);
        setLoading(false);
      }
    }
    fetchData();
  }, [isOpen, reimbursementId]);

  const validateForm = (): boolean => {
    if (!categoriaId) {
      setError('Selecione uma categoria.');
      return false;
    }
    if (!descricao.trim()) {
      setError('A descrição é obrigatória.');
      return false;
    }
    if (!valor || parseFloat(valor) <= 0) {
      setError('O valor deve ser maior que zero.');
      return false;
    }
    if (!dataDespesa) {
      setError('A data da despesa é obrigatória.');
      return false;
    }
    if (parseFloat(valor || '0') > 100 && attachment.length === 0 && !newAttachmentFile) {
      setError('Para valores acima de R$ 100,00, o comprovante é obrigatório.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const input: CreateReimbursementInput = {
        categoriaId,
        descricao,
        valor: parseFloat(valor),
        dataDespesa,
      };

      const atualizarReembolso = await editReimbursement(reimbursementId, input);

      if (newAttachmentFile) {
        try {
          if (attachment.length > 0) {
            // edita anexo existente
            const existingAttachmentId = attachment[0].id;
            await editAttachment(reimbursementId, existingAttachmentId, newAttachmentFile);
          } else {
            // cria novo anexo (usa a função createAttachment já importada)
            await uploadAttachment(reimbursementId, newAttachmentFile);
          }
        } catch (err) {
          setError('Erro ao processar comprovante.');
          console.error(err);
          return;
        }
      }

      setCategoriaId('');
      setDescricao('');
      setValor('');
      setDataDespesa('');
      setAttachment([]);
      onClose();
      if (onSuccess) {
        onSuccess(atualizarReembolso.id);
      } else {
        router.invalidate({ filter: (route) => route.id === '/interface' });
        navigate({ to: '/interface'});
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao editar reembolso.';
      setError(errorMessage);
      console.error(err)
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (loading) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 text-slate-200 p-6">Carregando reembolso...</div>
    </div>
  );
}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={() => {
          onClose();
          setError('');
        }}
      />
      
      <div className="relative z-10 w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-100">
            Editar reembolso
          </h2>
          <button
            onClick={() => {
              onClose();
              setError('');
            }}
            className="text-slate-400 hover:text-slate-200 transition-colors"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label 
              htmlFor="categoria" 
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Categoria
            </label>
            <select
              id="categoria"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 text-slate-200 p-2.5 text-sm focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-600"
              disabled={loadingCategories || isSubmitting}
            >
              <option value="">{loadingCategories ? 'Carregando...' : 'Selecione uma categoria'}</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label 
              htmlFor="descricao" 
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Descrição
            </label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o motivo do reembolso..."
              className="w-full h-24 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 p-3 text-sm placeholder:text-slate-500 focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-600 resize-none"
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-4">
            <label 
              htmlFor="valor" 
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Valor (R$)
            </label>
            <input
              id="valor"
              type="number"
              step="0.01"
              min="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 text-slate-200 p-2.5 text-sm placeholder:text-slate-500 focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-600"
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-6">
            <label 
              htmlFor="dataDespesa" 
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Data da despesa
            </label>
            <input
              id="dataDespesa"
              type="date"
              value={dataDespesa}
              onChange={(e) => setDataDespesa(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 text-slate-200 p-2.5 text-sm focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-600"
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Comprovante 
              {parseFloat(valor || '0') > 100 && (
                <span className="text-red-400">*</span>
              )}
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setNewAttachmentFile(e.target.files?.[0] || null)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 text-slate-200 p-2.5 text-sm"
              disabled={isSubmitting}
            />
            {parseFloat(valor || '0') > 100 && (
              <p className="mt-1 text-xs text-slate-400">
                Obrigatório para valores acima de R$ 100,00
              </p>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-800/50">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                setError('');
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Editando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditReimbursement;
