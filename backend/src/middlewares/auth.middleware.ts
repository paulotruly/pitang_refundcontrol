import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "../types/auth.js";

const SECRET = process.env.JWT_SECRET || "secret";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Token não fornecido", statusCode: 401, error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Formato de token inválido", statusCode: 401, error: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, SECRET) as JwtPayload;
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ message: "Token inválido ou expirado", statusCode: 401, error: "Unauthorized" });
    }
};
