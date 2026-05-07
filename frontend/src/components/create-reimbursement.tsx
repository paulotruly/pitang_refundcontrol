import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createReimbursement, getCategories, getCategoriesWithTotal, uploadAttachment } from '@/api/reimbursements';
import type { Category, CreateReimbursementInput } from '@/types';
import { useNavigate } from '@tanstack/react-router';
import router from '@/router';

interface CreateReimbursementFormProps {
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess?: (id: string) => void;
}

function CreateReimbursement({ isOpen, onClose, onSuccess }: CreateReimbursementFormProps) {
  const [categoriaId, setCategoriaId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [dataDespesa, setDataDespesa] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);

  const [categorias, setCategorias] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;

    async function fetchCategories() {
      setLoadingCategories(true);
      try {
        const data = await getCategoriesWithTotal();
        setCategorias(data.dados);
      } catch (err) {
        setError('Erro ao carregar categorias');
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, [isOpen]);

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
    if (parseFloat(valor || '0') > 100 && !attachment) {
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

      const novoReembolso = await createReimbursement(input);

      if (attachment) {
        await uploadAttachment(novoReembolso.id, attachment);
      }

      setCategoriaId('');
      setDescricao('');
      setValor('');
      setDataDespesa('');
      onClose();
      if (onSuccess) {
        onSuccess(novoReembolso.id);
      } else {
        router.invalidate({ filter: (route) => route.id === '/interface' });
        navigate({ to: '/interface'});
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao criar solicitação de reembolso.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
      {/* overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* modal - agora segue o padrão zinc dos outros modais */}
      <div className="relative z-10 w-full max-w-md border border-zinc-800 bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
        
        {/* header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
          <h2 className="text-lg font-semibold text-white">
            Nova solicitação de reembolso
          </h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700/50 bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {/* form content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Categoria */}
          <div>
            <label 
              htmlFor="categoria" 
              className="block text-sm font-medium text-zinc-300 mb-2"
            >
              Categoria
            </label>
            <select
              id="categoria"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="w-full h-11 rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3 text-sm focus:border-zinc-600 focus:bg-zinc-800 focus:outline-none"
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

          {/* Descrição */}
          <div>
            <label 
              htmlFor="descricao" 
              className="block text-sm font-medium text-zinc-300 mb-2"
            >
              Descrição
            </label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o motivo do reembolso..."
              className="w-full h-24 rounded-xl bg-zinc-950 border border-zinc-800 text-white p-3 text-sm placeholder:text-zinc-500 focus:border-zinc-600 focus:bg-zinc-800 focus:outline-none resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Valor */}
          <div>
            <label 
              htmlFor="valor" 
              className="block text-sm font-medium text-zinc-300 mb-2"
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
              className="w-full h-11 rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3 text-sm placeholder:text-zinc-500 focus:border-zinc-600 focus:bg-zinc-800 focus:outline-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Data da despesa */}
          <div>
            <label 
              htmlFor="dataDespesa" 
              className="block text-sm font-medium text-zinc-300 mb-2"
            >
              Data da despesa
            </label>
            <input
              id="dataDespesa"
              type="date"
              value={dataDespesa}
              onChange={(e) => setDataDespesa(e.target.value)}
              className="w-full h-11 rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3 text-sm focus:border-zinc-600 focus:bg-zinc-800 focus:outline-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Comprovante */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Comprovante 
              {parseFloat(valor || '0') > 100 && (
                <span className="text-red-400">*</span>
              )}
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setAttachment(e.target.files?.[0] || null)}
              className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-zinc-800 file:text-zinc-100 file:text-sm hover:file:bg-zinc-700 transition-colors"
              disabled={isSubmitting}
            />
            {parseFloat(valor || '0') > 100 && (
              <p className="mt-1 text-xs text-zinc-500">
                Obrigatório para valores acima de R$ 100,00
              </p>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar como rascunho'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default CreateReimbursement;
