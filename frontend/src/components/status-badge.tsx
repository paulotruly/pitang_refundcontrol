import type { ReimbursementStatus } from "@/types"

const statusConfig = {
  RASCUNHO: { label: "Rascunho", className: "bg-slate-600 text-slate-200" },
  ENVIADO: { label: "Enviado", className: "bg-blue-600 text-blue-100" },
  APROVADO: { label: "Aprovado", className: "bg-green-600 text-green-100" },
  REJEITADO: { label: "Rejeitado", className: "bg-orange-600 text-orange-100" },
  CANCELADO: { label: "Cancelado", className: "bg-slate-800 text-slate-400" },
  PAGO: { label: "Pago", className: "bg-emerald-600 text-emerald-100" },
} as const

interface StatusBadgeProps {
  status: ReimbursementStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}