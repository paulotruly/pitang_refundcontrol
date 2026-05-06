import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createCategory, createReimbursement, getCategories, uploadAttachment } from '@/api/reimbursements';
import type { Category, CreateCategoryInput, CreateReimbursementInput } from '@/types';
import { useNavigate } from '@tanstack/react-router';
import router from '@/router';

interface CreateReimbursementFormProps {
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess?: (id: string) => void;
}

function CreateCategory({ isOpen, onClose, onSuccess }: CreateReimbursementFormProps) {
  const [nome, setNome] = useState('');
  const [ativa, setAtiva] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    if (!nome) {
      setError('É obrigatório por um nome na categoria.');
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
      const input: CreateCategoryInput = {
        nome,
        ativo: ativa
      };

      const novaCategoria = await createCategory(input);

      setNome('');
      onClose();
      if (onSuccess) {
        onSuccess(novaCategoria.id);
      } else {
        router.invalidate({ filter: (route) => route.id === '/interface' });
        navigate({ to: '/interface'});
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao criar categoria.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative z-10 w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-100">
            Nova categoria
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label 
              htmlFor="nome" 
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Nome
            </label>
            <textarea
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite o nome da categoria"
              className="w-full h-24 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 p-3 text-sm placeholder:text-slate-500 focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-600 resize-none"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-800/50">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
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
              {isSubmitting ? 'Criando...' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCategory;
