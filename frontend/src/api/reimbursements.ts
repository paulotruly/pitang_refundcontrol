import api from "@/lib/api";
import type { Reimbursement, Category, ReimbursementStatus, ReimbursementResponse } from "@/types";

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

