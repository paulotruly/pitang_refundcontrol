import type { Request, Response } from "express";
import { prisma } from "../prisma.js"

// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------

export const createReimbursement = async (req: Request, res: Response) => {
    const { categoriaId, descricao, valor, dataDespesa } = req.body;

    const category = await prisma.category.findUnique({
        where: {id: categoriaId, deletadoEm: null},
    })
    if (!category) {
        return res.status(400).json({ message: "Categoria inválida", statusCode: 400, error: "Bad Request" });
    }
    if (!category.ativo) {
        return res.status(400).json({ message: "Categoria inativa", statusCode: 400, error: "Bad Request" });
    }

    if (category.valorMaximo && valor > category.valorMaximo) {
        return res.status(400).json({
            message: `Valor excede o limite da categoria ${category.nome} (R$ ${category.valorMaximo.toFixed(2)})`,
            statusCode: 400,
            error: "Bad Request",
        });
    }

    const reimbursement = await prisma.reimbursement.create({
        data: {
            solicitanteId: req.user.sub,
            categoriaId,
            descricao,
            valor,
            dataDespesa,
            status: "RASCUNHO"
         }
    });

    await prisma.history.create({
        data: { solicitacaoId: reimbursement.id, usuarioId: req.user.sub, acao: "CREATED" },
    });

    res.status(201).json(reimbursement);
};

// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------

export const getReimbursement = async (req: Request, res: Response) => {
    const { sub: userId, perfil } = req.user;

    // parâmetros da query que já estão sendo validados pelo middleware (validate-params.middleware.ts)
    const { pagina, limite, status, categoria, busca, ordenarPor, ordem } = (req as any).validatedQuery || {}; 

    const paginaAtual = pagina ?? 1; // se a página for nula, usa o valor 1
    const limitePorPagina = limite ?? 10;
    const skip = (paginaAtual - 1) * limitePorPagina; // calcula quantos registros o banco pula antes de começar a retornar resultados
    // ou seja, se por exemplo, estivermos na pagina 3 com 10 itens por página --> skip = (3-1) * 10 = 20, o banco pula os 20 primeiros registros

    let where: any = { deletadoEm: null }; // um objeto que guarda todos os filtros que serão aplicados na busca, tipo um WHERE do SQL

    switch (perfil) {
        case "COLABORADOR":
            where.solicitanteId = userId;
            break;
        case "GESTOR":
            where = { status: "ENVIADO" };
            break;
        case "FINANCEIRO":
            where = { status: "APROVADO" };
            break;
        case "ADMIN":
        default:
            where = {};
            break;
    }

    if (status) {
        where.status = status; // se houver filtro status, adiciona 
    }
    if (categoria) {
        where.categoriaId = categoria;
    }
    if (busca) { // aqui ele faz uma busca parcial, tipo o LIKE do SQL
        where.solicitante = { // então se busca por "Joao", ele traz todos os dados que tem "Joao", tipo "João", "Maria Joaquina", etc
            nome: { contains: busca }, // tipo um CTRL F, o prisma faz automaticamente
        };
    }

    const orderBy = { // cria um objeto de ordenação com o nome da chave snedo dinamico
        // se não houver valor, ele ordena pela data de criação
        [ordenarPor ?? "criadoEm"]: ordem ?? "desc", // e se não enviar a ordem, ele ordena DESC
    };

    // aqui ele conta quantos registros existem no total pra calcular as páginas
    const totalItens = await prisma.reimbursement.count({ where });

    const reimbursements = await prisma.reimbursement.findMany({
        where, // aplica o filtro
        skip, // pula registros
        take: limitePorPagina, // pega no máximo X registros por página
        orderBy, // define a ordem
        include: { categoria: true, solicitante: { select: { nome: true, email: true } } }, // traz dados relacionados
    });

    res.json({
        dados: reimbursements, // traz os dados
        paginacao: { // e as propriedades para paginação
            paginaAtual: paginaAtual,
            limite: limitePorPagina,
            totalItens,
            totalPaginas: Math.ceil(totalItens / limitePorPagina), // arredonda pra não ter numero quebrado de paginas
        },
    });
};

// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------

export const getReimbursementById = async (req: Request, res: Response) => {
    const { sub: userId, perfil } = req.user;
    const id = req.params.id as string;

    const reimbursement = await prisma.reimbursement.findUnique({
        where: { id, deletadoEm: null },
        include: {
            categoria: true,
            solicitante: { select: { nome: true, email: true } }
        },
    });

    if (!reimbursement) {
        return res.status(404).json({ message: "Solicitação não encontrada", statusCode: 404, error: "Not Found" });
    }

    if (perfil !== "ADMIN" && reimbursement.solicitanteId !== userId) {
        return res.status(403).json({ message: "Sem permissão", statusCode: 403, error: "Forbidden" });
    }
    res.json(reimbursement);
};

// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------

export const updateReimbursement = async (req: Request, res: Response) => {
    const { sub: userId } = req.user;
    const id = req.params.id as string;

    const existing = await prisma.reimbursement.findUnique({ where: { id, deletadoEm: null } });
    if (!existing) return res.status(404).json({ message: "Solicitação não encontrada", statusCode: 404, error: "Not Found" });
    if (existing.solicitanteId !== userId) return res.status(403).json({ message: "Sem permissão", statusCode: 403, error: "Forbidden" });
    if (existing.status !== "RASCUNHO") return res.status(400).json({ message: "Status inválido", statusCode: 400, error: "Bad Request" });

    const { categoriaId, descricao, valor, dataDespesa } = req.body;

    const categoriaFinal = categoriaId
        ? await prisma.category.findUnique({ where: { id: categoriaId, deletadoEm: null } }) // nova se mudou
        : await prisma.category.findUnique({ where: { id: existing.categoriaId, deletadoEm: null } }); // a que já existe se não
    if (!categoriaFinal) return res.status(400).json({ message: "Categoria inválida", statusCode: 400, error: "Bad Request" });

    const data: any = {};
    if (categoriaId !== undefined) data.categoriaId = categoriaId;
    if (descricao !== undefined) data.descricao = descricao;
    if (valor !== undefined) data.valor = valor;
    if (dataDespesa !== undefined) data.dataDespesa = dataDespesa;

    const valorFinal = valor !== undefined ? valor : existing.valor;

    if (categoriaFinal.valorMaximo && valorFinal > categoriaFinal.valorMaximo) {
        return res.status(400).json({
            message: `Valor excede o limite da categoria ${categoriaFinal.nome} (R$ ${categoriaFinal.valorMaximo.toFixed(2)})`,
            statusCode: 400,
            error: "Bad Request",
        });
    }

    const updated = await prisma.reimbursement.update({ where: { id }, data });

    await prisma.history.create({
        data: { solicitacaoId: id, usuarioId: userId, acao: "UPDATED" },
    });

    res.json(updated);
};

// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------

export const submitReimbursement = async (req: Request, res: Response) => {
    const { sub: userId } = req.user;
    const id = req.params.id as string;

    const existing = await prisma.reimbursement.findUnique({ where: { id, deletadoEm: null } });
    if (!existing) return res.status(404).json({ message: "Solicitação não encontrada", statusCode: 404, error: "Not Found" });
    if (existing.solicitanteId !== userId) return res.status(403).json({ message: "Sem permissão", statusCode: 403, error: "Forbidden" });
    if (existing.status !== "RASCUNHO") return res.status(400).json({ message: "Status inválido", statusCode: 400, error: "Bad Request" });

    const category = await prisma.category.findUnique({ where: { id: existing.categoriaId, deletadoEm: null } });
    if (category?.valorMaximo && existing.valor > category.valorMaximo) {
        return res.status(400).json({
            message: `Valor excede o limite da categoria ${category.nome} (R$ ${category.valorMaximo.toFixed(2)})`,
            statusCode: 400,
            error: "Bad Request",
        });
    }

    const attachmentCount = await prisma.attachment.count({
        where: { solicitacaoId: id},
    });
    const VALOR_MAXIMO_SEM_ANEXO = 100;
    if (existing.valor > VALOR_MAXIMO_SEM_ANEXO && attachmentCount === 0) {
        return res.status(400).json({
            message: `Solicitações acima de R$ ${VALOR_MAXIMO_SEM_ANEXO},00 exigem comprovante anexado`,
            statusCode: 400,
            error: "Bad Request",
        });
    }

    const updated = await prisma.reimbursement.update({
        where: { id },
        data: { status: "ENVIADO" },
    });

    await prisma.history.create({
        data: { solicitacaoId: id, usuarioId: userId, acao: "SUBMITTED" },
    });

    res.json(updated);
};

// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------

export const approveReimbursement = async (req: Request, res: Response) => {
    const { perfil } = req.user;
    const id = req.params.id as string;

    if (perfil !== "GESTOR") return res.status(403).json({ message: "Perfil inválido", statusCode: 403, error: "Forbidden" });

    const existing = await prisma.reimbursement.findUnique({ where: { id, deletadoEm: null } });
    if (!existing) return res.status(404).json({ message: "Solicitação não encontrada", statusCode: 404, error: "Not Found" });
    if (existing.status !== "ENVIADO") return res.status(400).json({ message: "Status inválido", statusCode: 400, error: "Bad Request" });

    const updated = await prisma.reimbursement.update({
        where: { id, deletadoEm: null },
        data: { status: "APROVADO" },
    });

    await prisma.history.create({
        data: { solicitacaoId: id, usuarioId: req.user.sub, acao: "APPROVED" },
    });

    res.json(updated);
};

// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------

export const rejectReimbursement = async (req: Request, res: Response) => {
    const { perfil, sub: userId } = req.user;
    const id = req.params.id as string;
    const { justificativaRejeicao } = req.body;

    if (perfil !== "GESTOR") return res.status(403).json({ message: "Perfil inválido", statusCode: 403, error: "Forbidden" });

    const existing = await prisma.reimbursement.findUnique({ where: { id, deletadoEm: null } });
    if (!existing) return res.status(404).json({ message: "Solicitação não encontrada", statusCode: 404, error: "Not Found" });
    if (existing.status !== "ENVIADO") return res.status(400).json({ message: "Status inválido", statusCode: 400, error: "Bad Request" });
    if (!justificativaRejeicao || justificativaRejeicao.trim() === "") {
        return res.status(400).json({ message: "Justificativa obrigatória", statusCode: 400, error: "Bad Request" });
    }

    const updated = await prisma.reimbursement.update({
        where: { id, deletadoEm: null },
        data: { status: "REJEITADO", justificativaRejeicao },
    });

    await prisma.history.create({
        data: { solicitacaoId: id, usuarioId: userId, acao: "REJECTED", observacao: justificativaRejeicao },
    });

    res.json(updated);
};

// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------

export const payReimbursement = async (req: Request, res: Response) => {
    const { perfil } = req.user;
    const id = req.params.id as string;

    if (perfil !== "FINANCEIRO") return res.status(401).json({ message: "Perfil inválido", statusCode: 401, error: "Unauthorized" });

    const existing = await prisma.reimbursement.findUnique({ where: { id, deletadoEm: null } });
    if (!existing) return res.status(404).json({ message: "Solicitação não encontrada", statusCode: 404, error: "Not Found" });
    if (existing.status !== "APROVADO") return res.status(400).json({ message: "Status inválido", statusCode: 400, error: "Bad Request" });

    const updated = await prisma.reimbursement.update({
        where: { id, deletadoEm: null},
        data: { status: "PAGO" },
    });

    await prisma.history.create({
        data: { solicitacaoId: id, usuarioId: req.user.sub, acao: "PAID" },
    });

    res.json(updated);
};

// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------

export const cancelReimbursement = async (req: Request, res: Response) => {
    const { sub: userId } = req.user;
    const id = req.params.id as string;

    const existing = await prisma.reimbursement.findUnique({ where: { id, deletadoEm: null } });
    if (!existing) return res.status(404).json({ message: "Solicitação não encontrada", statusCode: 404, error: "Not Found" });
    if (existing.solicitanteId !== userId) return res.status(403).json({ message: "Sem permissão", statusCode: 403, error: "Forbidden" });
    if (existing.status !== "RASCUNHO") return res.status(400).json({ message: "Status inválido", statusCode: 400, error: "Bad Request" });

    const updated = await prisma.reimbursement.update({
        where: { id, deletadoEm: null },
        data: { status: "CANCELADO" },
    });

    await prisma.history.create({
        data: { solicitacaoId: id, usuarioId: userId, acao: "CANCELED" },
    });

    res.json(updated);
};

// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------

export const getReimbursementHistory = async (req: Request, res: Response) => {
    const { sub: userId, perfil } = req.user;
    const id = req.params.id as string;
    const existing = await prisma.reimbursement.findUnique({ where: { id, deletadoEm: null } });

    if (!existing) return res.status(404).json({ message: "Solicitação não encontrada", statusCode: 404, error: "Not Found" });

    if (perfil !== "ADMIN" && perfil !== "GESTOR" && perfil !== "FINANCEIRO" && existing.solicitanteId !== userId) {
        return res.status(403).json({ message: "Sem permissão", statusCode: 403, error: "Forbidden" });
    }

    const history = await prisma.history.findMany({
        where: { solicitacaoId: id, deletadoEm: null },
        include: { usuario: {select: {nome: true, email: true}} },
        orderBy: { criadoEm: "asc" },
    });

    res.json(history);
}
