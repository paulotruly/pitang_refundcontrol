import type { Request, Response, NextFunction } from "express";
import { Perfil } from "../prisma.js";

export const roleMiddleware = (...allowedRoles: Perfil[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!allowedRoles.includes(req.user.perfil)) {
            return res.status(403).json({ message: "Sem permissão", statusCode: 403, error: "Forbidden" });
        }
        next();
    };
};
