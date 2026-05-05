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
      
      <div className="relative z-10 w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-100">
            Justificativa de rejeição
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
              htmlFor="justification" 
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Justificativa
            </label>
            <textarea
              id="justification"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Digite a justificativa para rejeitar este reembolso..."
              className="w-full h-32 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 p-3 text-sm placeholder:text-slate-500 focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-600 resize-none"
              disabled={isSubmitting}
            />
            {error && (
              <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
          </div>

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
              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
