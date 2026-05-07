import { useState } from 'react';
import { X } from 'lucide-react';
import { rejectReimbursement } from '@/api/reimbursements';
import { useAuth } from '@/context/AuthContext';

interface JustificationFormProps {
  isOpen: boolean; // controla se o modal está visível (true) ou oculto (false)
  onClose: () => void; // função de callback chamada quando o modal deve ser fechado
  reimbursementId: string; // ID do reembolso que será rejeitado
  onSuccess?: () => void; // callback opcional executado após rejeição bem-sucedida (ex: recarregar lista)
}

function JustificationForm({ isOpen, onClose, reimbursementId, onSuccess }: JustificationFormProps) {
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!justification.trim()) {
      setError('Por favor, forneça uma justificativa para a rejeição.');
      return; 
    }

    setIsSubmitting(true);
    setError('');

    try {
      await rejectReimbursement(reimbursementId, justification);
      setJustification('');
      onClose();

      if (onSuccess) {
        onSuccess();
      }

    } catch (err) {
      setError('Erro ao rejeitar reembolso.');
      console.error(err)

    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/95 shadow-2xl">

        {/* header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">

          <div>
            <h2 className="text-lg font-semibold text-white">
              Justificativa de rejeição
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Explique o motivo da rejeição deste reembolso.
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700/50 bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">

          <div className="space-y-2">
            <label 
              htmlFor="justification" 
              className="block text-sm font-medium text-zinc-300"
            >
              Justificativa
            </label>

            <textarea
              id="justification"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Digite a justificativa para rejeitar este reembolso..."
              className="
                w-full
                h-32
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
              disabled={isSubmitting}
            />

            {error && (
              <p className="text-sm text-red-400">
                {error}
              </p>
            )}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-zinc-800 pt-5">

            <button
              type="button"
              onClick={onClose}
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
              disabled={isSubmitting}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="
                rounded-lg
                bg-red-500
                px-4
                py-2
                text-sm
                font-medium
                text-white
                transition-colors
                hover:bg-red-400
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Rejeitando...' : 'Rejeitar'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default JustificationForm;