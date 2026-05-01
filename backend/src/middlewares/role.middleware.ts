import type { Request, Response, NextFunction } from "express";
import { Perfil } from "../prisma.js";

// recebe valores tipados como Perfil
export const roleMiddleware = (...allowedRoles: Perfil[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!allowedRoles.includes(req.user.perfil)) { // verifica se o perfil do usuário logado não está na lista de perfis permitidos
            return res.status(403).json({ error: "Sem permissão" });
        }
        next();
    };
};