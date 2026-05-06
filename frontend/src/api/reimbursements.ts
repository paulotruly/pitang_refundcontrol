import api from "@/lib/api";
import type { Reimbursement, Category, ReimbursementStatus, ReimbursementResponse, ReimbursementHistoryItem, CreateReimbursementInput, CategoryResponse, CreateCategoryInput } from "@/types";

export async function getCategories(): Promise<Category[]> {
  const response = await api.get('/categories');
  return response.data;
}

export async function getCategoriesWithTotal(pagina: number = 1, limite: number = 15): Promise<CategoryResponse> {
    const response = await api.get("/categories", {
        params: { pagina, limite }
    })
    return response.data
}

export async function updateCategory(id: string, data: any) {
  const response = await api.put(`/categories/${id}`, data);
  return response.data;
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const response = await api.post('/categories', input);
  return response.data;
}

export async function deleteCategory(id: string): Promise<any> {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
}

export async function createReimbursement(input: CreateReimbursementInput): Promise<Reimbursement> {
  const response = await api.post('/reimbursement', input);
  return response.data;
}

export async function editReimbursement(id: string, input: CreateReimbursementInput): Promise<Reimbursement> {
  const response = await api.put(`/reimbursement/${id}`, input);
  return response.data;
}

export async function getReimbursements(pagina: number = 1, limite: number = 15): Promise<Reimbursement[]> {
    const data = await getReimbursementsWithTotal(pagina, limite)
    return data.dados
}

export async function getReimbursementById(id: string): Promise<Reimbursement> {
    const response = await api.get(`/reimbursement/${id}`)
    return response.data
}

export async function getReimbursementsWithTotal(pagina: number = 1, limite: number = 15): Promise<ReimbursementResponse> {
    const response = await api.get("/reimbursement", {
        params: { pagina, limite }
    })
    return response.data
}

export async function approveReimbursement(id: string): Promise<Reimbursement> {
  const response = await api.post(`/reimbursement/${id}/approve`)
  return response.data
}

export async function rejectReimbursement(id: string, justificativa?: string): Promise<Reimbursement> {
  const response = await api.post(`/reimbursement/${id}/reject`, 
    justificativa ? { justificativaRejeicao: justificativa } : {}
  )
  return response.data
}

export async function payReimbursement(id: string): Promise<Reimbursement> {
  const response = await api.post(`/reimbursement/${id}/pay`)
  return response.data
}

export async function cancelReimbursement(id: string): Promise<Reimbursement> {
  const response = await api.post(`/reimbursement/${id}/cancel`)
  return response.data
}

export async function sendReimbursement(id: string): Promise<Reimbursement> {
  const response = await api.post(`/reimbursement/${id}/submit`)
  return response.data
}

export async function getReimbursementHistory(id: string): Promise<ReimbursementHistoryItem[]> {
  const response = await api.get(`/reimbursement/${id}/history`)
  return response.data
}

export async function uploadAttachment(id: string, file: File): Promise<any> {
  const formData = new FormData();
  formData.append('comprovante', file, file.name);
  // NÃO definir Content-Type manualmente - o axios faz isso automaticamente com o boundary correto
  const response = await api.post(`/reimbursement/${id}/attachments`, formData);
  return response.data;
}

export async function editAttachment(reimbursementId: string, attachmentId: string, file: File): Promise<any> {
  const formData = new FormData();
  formData.append('comprovante', file, file.name);
  const response = await api.put(`/reimbursement/${reimbursementId}/attachments/${attachmentId}`, formData);
  return response.data;
}

export async function getAttachmentById(reimbursementId: string, attachmentId: string): Promise<any> {
  // GET para buscar um anexo específico pelo ID
  const response = await api.get(`/reimbursement/${reimbursementId}/attachments/${attachmentId}`);
  return response.data;
}

export async function getAttachments(id: string): Promise<any[]> {
  const response = await api.get(`/reimbursement/${id}/attachments`);
  return response.data;
}