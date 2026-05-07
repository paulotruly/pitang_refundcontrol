import { useState, useEffect } from "react"
import { X } from "lucide-react"
import {
  editAttachment,
  editReimbursement,
  getAttachments,
  getCategories,
  getReimbursementById,
  uploadAttachment,
} from "@/api/reimbursements"

import type { Category, CreateReimbursementInput, Reimbursement } from "@/types"
import { useNavigate } from "@tanstack/react-router"
import router from "@/router"
import { FormSkeleton } from "@/components/ui/skeleton"

interface EditReimbursementFormProps {
  isOpen: boolean
  onClose: () => void
  reimbursementId: string
  onSuccess?: (id: string) => void
}

function EditReimbursement({
  isOpen,
  onClose,
  onSuccess,
  reimbursementId,
}: EditReimbursementFormProps) {
  const [reimbursement, setReimbursement] = useState<Reimbursement | null>(null)

  const [categoriaId, setCategoriaId] = useState("")
  const [descricao, setDescricao] = useState("")
  const [valor, setValor] = useState("")
  const [dataDespesa, setDataDespesa] = useState("")

  const [attachment, setAttachment] = useState<any[]>([])
  const [newAttachmentFile, setNewAttachmentFile] = useState<File | null>(null)

  const [loading, setLoading] = useState(true)

  const [categorias, setCategorias] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const navigate = useNavigate()

  // ============================================================================
  // FETCH DATA
  // ============================================================================

  useEffect(() => {
    if (!isOpen || !reimbursementId) return

    async function fetchData() {
      setLoading(true)
      setLoadingCategories(true)

      try {
        const [reimbData, attachmentsData, categoriesData] =
          await Promise.all([
            getReimbursementById(reimbursementId),
            getAttachments(reimbursementId),
            getCategories(),
          ])

        setReimbursement(reimbData)
        setAttachment(attachmentsData)
        setCategorias(categoriesData)

        setCategoriaId(reimbData.categoria.id)
        setDescricao(reimbData.descricao)
        setValor(String(reimbData.valor))
        setDataDespesa(
          new Date(reimbData.dataDespesa).toISOString().split("T")[0]
        )
      } catch (err) {
        setError("Erro ao carregar reembolso.")
      } finally {
        setLoading(false)
        setLoadingCategories(false)
      }
    }

    fetchData()
  }, [isOpen, reimbursementId])

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateForm = (): boolean => {
    if (!categoriaId) {
      setError("Selecione uma categoria.")
      return false
    }

    if (!descricao.trim()) {
      setError("A descrição é obrigatória.")
      return false
    }

    if (!valor || parseFloat(valor) <= 0) {
      setError("O valor deve ser maior que zero.")
      return false
    }

    if (!dataDespesa) {
      setError("A data da despesa é obrigatória.")
      return false
    }

    if (
      parseFloat(valor || "0") > 100 &&
      attachment.length === 0 &&
      !newAttachmentFile
    ) {
      setError("Comprovante obrigatório para valores acima de R$ 100,00.")
      return false
    }

    return true
  }

  // ============================================================================
  // SUBMIT
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError("")
    setSuccess("")

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const input: CreateReimbursementInput = {
        categoriaId,
        descricao,
        valor: parseFloat(valor),
        dataDespesa,
      }

      const updated = await editReimbursement(reimbursementId, input)

      if (newAttachmentFile) {
        try {
          if (attachment.length > 0) {
            const existingAttachmentId = attachment[0].id
            await editAttachment(
              reimbursementId,
              existingAttachmentId,
              newAttachmentFile
            )
          } else {
            await uploadAttachment(reimbursementId, newAttachmentFile)
          }
        } catch (err) {
          setError("Erro ao processar comprovante.")
          return
        }
      }

      setSuccess("Reembolso atualizado com sucesso!")

      setTimeout(() => {
        setCategoriaId("")
        setDescricao("")
        setValor("")
        setDataDespesa("")
        setAttachment([])
        onClose()

        if (onSuccess) {
          onSuccess(updated.id)
        } else {
          router.invalidate({
            filter: (route) => route.id === "/interface",
          })
          navigate({ to: "/interface" })
        }
      }, 800)
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao editar reembolso.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ============================================================================
  // UI STATES
  // ============================================================================

  if (!isOpen) return null

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        {/* Usa o FormSkeleton ao invés de um spinner simples */}
        <div className="relative z-10 bg-zinc-900 p-6 rounded-xl border border-zinc-800 w-full max-w-2xl">
          <FormSkeleton />
        </div>
      </div>
    )
  }

  // ============================================================================
  // UI
  // ============================================================================

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* modal */}
      <div className="relative z-10 w-full max-w-md border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-5">

        {/* header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">
            Editar reembolso
          </h2>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* categoria */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Categoria</label>

            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              disabled={loadingCategories || isSubmitting}
              className="w-full h-11 rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3 text-sm"
            >
              <option value="">
                {loadingCategories ? "Carregando..." : "Selecione"}
              </option>

              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          {/* descricao */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Descrição</label>

            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full h-24 rounded-xl bg-zinc-950 border border-zinc-800 text-white p-3 text-sm resize-none"
            />
          </div>

          {/* valor */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Valor</label>

            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full h-11 rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3 text-sm"
            />
          </div>

          {/* data */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Data</label>

            <input
              type="date"
              value={dataDespesa}
              onChange={(e) => setDataDespesa(e.target.value)}
              className="w-full h-11 rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3 text-sm"
            />
          </div>

          {/* file */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">
              Comprovante
            </label>

            <input
              type="file"
              onChange={(e) =>
                setNewAttachmentFile(e.target.files?.[0] || null)
              }
              className="w-full text-sm text-zinc-400"
            />
          </div>

          {/* error */}
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* success */}
          {success && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-300">
              {success}
            </div>
          )}

          {/* actions */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-all"
          >
            {isSubmitting ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EditReimbursement