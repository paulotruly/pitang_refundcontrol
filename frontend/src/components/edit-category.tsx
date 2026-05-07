import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

import {
  getCategoryById,
  updateCategory,
} from '@/api/reimbursements';

import type {
  Category,
  CreateCategoryInput,
} from '@/types';

import { useNavigate } from '@tanstack/react-router';
import router from '@/router';
import { FormSkeleton } from '@/components/ui/skeleton';

interface EditCategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  onSuccess?: (id: string) => void;
}

function EditCategory({
  isOpen,
  onClose,
  onSuccess,
  categoryId,
}: EditCategoryFormProps) {

  const [category, setCategory] = useState<Category | null>(null);
  const [nome, setNome] = useState('');

  const [loading, setLoading] = useState(true);
  const [loadingCategories] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // ============================================================================
  // LOAD DATA
  // ============================================================================

  useEffect(() => {
    if (!isOpen || !categoryId) return;

    async function fetchData() {
      setLoading(true);
      setError('');

      try {
        const data = await getCategoryById(categoryId);

        setCategory(data);
        setNome(data.nome);

      } catch (err) {
        setError('Erro ao carregar categoria.');
        console.error(err);

      } finally {
        setLoading(false);
      }
    }

    fetchData();

  }, [isOpen, categoryId]);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateForm = (): boolean => {
    if (!nome.trim()) {
      setError('O nome da categoria é obrigatório.');
      return false;
    }
    return true;
  };

  // ============================================================================
  // SUBMIT
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const input: CreateCategoryInput = {
        nome,
      };

      const updatedCategory = await updateCategory(categoryId, input);

      setNome('');

      onClose();

      if (onSuccess) {
        onSuccess(updatedCategory.id);
      } else {
        router.invalidate({
          filter: (route) =>
            route.id === '/interface/categorias',
        });

        navigate({ to: '/interface' });
      }

    } catch (err: any) {

      const errorMessage =
        err.response?.data?.message ||
        'Erro ao editar categoria.';

      setError(errorMessage);
      console.error(err);

    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* FormSkeleton substitui o loading simples */}
        <div className="relative z-10 bg-zinc-900 p-6 rounded-xl border border-zinc-800 w-full max-w-md">
          <FormSkeleton />
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4">

      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* modal */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/95 shadow-2xl">

        {/* header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">

          <div>
            <h2 className="text-lg font-semibold text-white">
              Editar categoria
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Atualize as informações da categoria
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700/50 bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} className="p-6">

          <div className="space-y-2">

            <label
              htmlFor="nome"
              className="text-sm font-medium text-zinc-300"
            >
              Nome
            </label>

            <textarea
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite o nome da categoria"
              disabled={isSubmitting}
              className="
                w-full
                h-24
                resize-none
                rounded-xl
                border
                border-zinc-700/50
                bg-zinc-800/50
                px-4
                py-3
                text-sm
                text-zinc-200
                placeholder:text-zinc-500
                outline-none
                transition-colors
                focus:border-zinc-600
                focus:bg-zinc-800
              "
            />

          </div>

          {/* error */}
          {error && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* footer */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-zinc-800 pt-5">

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="
                rounded-lg
                border
                border-zinc-700/50
                bg-zinc-800/50
                px-4
                py-2
                text-sm
                font-medium
                text-zinc-300
                transition-colors
                hover:bg-zinc-800
                hover:text-white
              "
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="
                rounded-lg
                bg-blue-500
                px-4
                py-2
                text-sm
                font-medium
                text-white
                transition-colors
                hover:bg-blue-400
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {isSubmitting ? 'Editando...' : 'Confirmar'}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCategory;