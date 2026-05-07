import { cn } from "@/lib/utils";

// Componente base de Skeleton - cria uma caixa animada que simula conteúdo carregando
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800", className)}
      {...props}
    />
  )
}

// Skeleton para linhas de tabela (usado em data-table e categories-table)
export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-zinc-200 dark:border-zinc-800">
      {/* Checkbox placeholder */}
      <Skeleton className="h-4 w-4 rounded" />
      
      {/* Células da tabela - simulando colunas */}
      <Skeleton className="h-4 w-[100px]" /> {/* Coluna ID */}
      <Skeleton className="h-4 w-[150px]" /> {/* Coluna Descrição */}
      <Skeleton className="h-4 w-[100px]" /> {/* Coluna Valor */}
      <Skeleton className="h-4 w-[80px]" /> {/* Coluna Status */}
      <Skeleton className="h-4 w-[120px]" /> {/* Coluna Data */}
      <Skeleton className="h-4 w-[100px]" /> {/* Coluna Solicitante */}
      
      {/* Botões de ação */}
      <div className="flex gap-2 ml-auto">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>
  )
}

// Skeleton para detalhes do reembolso (usado em reimbursement-details)
export function ReimbursementDetailsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header com título e botão voltar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-md" /> {/* Botão voltar */}
          <Skeleton className="h-8 w-[200px]" /> {/* Título */}
        </div>
        <Skeleton className="h-9 w-[120px] rounded-md" /> {/* Badge de status */}
      </div>

      {/* Grid de informações */}
      <div className="grid grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-[80px]" /> {/* Label */}
            <Skeleton className="h-6 w-[150px]" /> {/* Valor */}
          </div>
        ))}
      </div>

      {/* Seção de anexos */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-[100px]" /> {/* Título anexos */}
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded-xl">
              <Skeleton className="h-10 w-10 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
              <Skeleton className="h-8 w-[80px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Skeleton para formulários (usado em edit-reimbursement e edit-category)
export function FormSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Título */}
      <Skeleton className="h-8 w-[250px]" />
      
      {/* Campos do formulário */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-[100px]" /> {/* Label */}
          <Skeleton className="h-10 w-full rounded-md" /> {/* Input */}
        </div>
      ))}
      
      {/* Botões */}
      <div className="flex gap-4 pt-4">
        <Skeleton className="h-10 w-[100px] rounded-md" />
        <Skeleton className="h-10 w-[100px] rounded-md" />
      </div>
    </div>
  )
}

export default Skeleton