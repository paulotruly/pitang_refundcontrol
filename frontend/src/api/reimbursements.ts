import api from "@/lib/api";
import type { GetReimbursementsParams, Reimbursement, Category, ReimbursementStatus, ReimbursementResponse, ReimbursementHistoryItem, CreateReimbursementInput, CategoryResponse, CreateCategoryInput, UpdateCategoryInput } from "@/types";

export async function getCategories(): Promise<Category[]> {
  const response = await api.get<CategoryResponse>('/categories');
  return response.data.dados;
}

export async function getCategoryById(id: string): Promise<Category> {
    const response = await api.get(`/categories/${id}`)
    return response.data
}

export async function getCategoriesWithTotal(pagina: number = 1, limite: number = 15): Promise<CategoryResponse> {
    const response = await api.get("/categories", {
        params: { pagina, limite }
    })
    return response.data
}

export async function updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
  const response = await api.put(`/categories/${id}`, input);
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

// export async function getReimbursements(pagina: number = 1, limite: number = 15): Promise<Reimbursement[]> {
//     const data = await getReimbursementsWithTotal(pagina, limite)
//     return data.dados
// }

export async function getReimbursementById(id: string): Promise<Reimbursement> {
    const response = await api.get(`/reimbursement/${id}`)
    return response.data
}

// export async function getReimbursementsWithTotal(pagina: number = 1, limite: number = 15): Promise<ReimbursementResponse> {
//     const response = await api.get("/reimbursement", {
//         params: { pagina, limite }
//     })
//     return response.data
// }

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
  return response.data; // retorna a lista de anexos para o reembolso específico
}

export async function getReimbursements(
  params: GetReimbursementsParams // adicionado para aceitar os parâmetros de filtro, paginação e ordenação
): Promise<Reimbursement[]> { // ajustado para retornar apenas a lista de reembolsos, sem a parte de paginação
  const data = await getReimbursementsWithTotal(params) // chamando a função que retorna os dados completos, incluindo a parte de paginação
  return data.dados // retornando apenas a lista de reembolsos, ignorando a parte de paginação
}

export async function getReimbursementsWithTotal( // nova função para retornar os dados completos, incluindo a parte de paginação
  params: GetReimbursementsParams // adicionado para aceitar os parâmetros de filtro, paginação e ordenação
): Promise<ReimbursementResponse> { // ajustado para retornar o tipo ReimbursementResponse, que inclui tanto a lista de reembolsos quanto a parte de paginação
  const response = await api.get("/reimbursement", { // chamando a API para buscar os reembolsos, passando os parâmetros de filtro, paginação e ordenação
    params,
  })
  return response.data
}

export async function downloadAttachment(attachmentId: string, reimbursementId: string): Promise<void> {
  
  // passo 1 - fazer a requisição GET para baixar o arquivo, usando
  // responseType 'blob' para receber os dados como um Blob
  const response = await api.get(`/reimbursement/${reimbursementId}/attachments/${attachmentId}/download`, {
    responseType: 'blob',
  });

  // passo 2 - extrair o nome do arquivo e o tipo de conteúdo dos headers
  // da resposta, para usar na hora de criar o link de download
  const getHeader = (name: string): string | undefined => {
    const val = response.headers[name];
    if (typeof val === 'string') return val; // se for string, retorna direto
    if (Array.isArray(val) && typeof val[0] === 'string') return val[0]; // se for array, retorna o primeiro elemento
    return undefined;
  };

  // passo 3 - criar um link temporário para o arquivo usando URL.createObjectURL e forçar o download
  const contentDisposition = getHeader('content-disposition');

  // passo 4 - extrair o nome do arquivo do header content-disposition, se disponível, ou usar um nome padrão
  const contentType = getHeader('content-type') || 'application/octet-stream';

  let filename = 'arquivo'; // nome padrão caso o header não contenha o nome do arquivo

  // passo 5 - tentar extrair o nome do arquivo do header content-disposition
  // usando regex, considerando casos com e sem UTF-8
  if (contentDisposition) { 
    const match = contentDisposition.match(/filename\*?=['"]?(?:UTF-8'')?([^'";\n]+)['"]?/i);
    if (match?.[1]) filename = decodeURIComponent(match[1].trim()); // se encontrar o nome do arquivo, decodifica e usa como nome para download
  }

  // passo 6 - criar um link temporário para o arquivo usando URL.createObjectURL e forçar o download
  const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
  const link = document.createElement('a'); // cria um elemento <a> para usar como link de download
  link.href = url; // define o href do link como a URL temporária criada para o arquivo
  link.setAttribute('download', filename); // define o atributo download do link com o nome do arquivo para sugerir o nome no download
  document.body.appendChild(link); // adiciona o link ao corpo do documento para que ele possa ser clicado
  link.click(); // simula um clique no link para iniciar o download
  link.remove(); // remove o link do documento após o clique para limpar o DOM
  window.URL.revokeObjectURL(url); // revoga a URL temporária criada para liberar memória no navegador
}