import { useState } from 'react';
import { X } from 'lucide-react';
import {
  createCategory,
} from '@/api/reimbursements';

import type {
  CreateCategoryInput,
} from '@/types';

import { useNavigate } from '@tanstack/react-router';
import router from '@/router';

interface CreateReimbursementFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (id: string) => void;
}

function CreateCategory({
  isOpen,
  onClose,
  onSuccess,
}: CreateReimbursementFormProps) {

  const [nome, setNome] = useState('');
  const [ativa] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateForm = (): boolean => {
    if (!nome) {
      setError('É obrigatório por um nome na categoria.');
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

      const novaCategoria = await createCategory(input);

      setNome('');

      onClose();

      if (onSuccess) {
        onSuccess(novaCategoria.id);
      } else {
        router.invalidate({
          filter: (route) => route.id === '/interface',
        });

        navigate({ to: '/interface' });
      }

    } catch (err: any) {

      const errorMessage =
        err.response?.data?.message ||
        'Erro ao criar categoria.';

      setError(errorMessage);

    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

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
              Nova categoria
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Crie uma nova categoria para organizar os reembolsos
            </p>
          </div>

          <button
            onClick={onClose}
            type="button"
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
              Nome da categoria
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
                disabled:opacity-50
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
              {isSubmitting ? 'Criando...' : 'Criar'}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCategory;