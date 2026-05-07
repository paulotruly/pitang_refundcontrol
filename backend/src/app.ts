import express from 'express';
import cors from "cors";
import userRoutes from './routes/users.routes.js';
import categoryRoutes from './routes/category.routes.js';
import reimbursementRoutes from './routes/reimbursement.routes.js';
import authRoutes from './routes/auth.routes.js';
import { authMiddleware } from './middlewares/auth.middleware.js';
import { errorHandler } from './middlewares/error-handler.middleware.js';
import path from 'path';

const app = express();

// serve pra tornar a pasta uploads/ acessível na url "/uploads/arquivo.extensao"
const uploadsAbsolutePath = path.resolve(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsAbsolutePath));

app.use(cors());
app.use(express.json());
app.use("/users", userRoutes)
app.use("/categories", authMiddleware, categoryRoutes)
app.use("/reimbursement", authMiddleware, reimbursementRoutes)
app.use('/auth', authRoutes);

app.get("/", (_req, res) => {
    res.json({message: "API rodando"})
});

// middleware global de erro — ÚLTIMO de tudo, captura erros não tratados
app.use(errorHandler);

export default app;