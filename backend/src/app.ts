import express from 'express';
import cors from "cors";
import userRoutes from './routes/users.routes.js';
import categoryRoutes from './routes/category.routes.js';
import reimbursementRoutes from './routes/reimbursement.routes.js';
import authRoutes from './routes/auth.routes.js';
import { authMiddleware } from './middlewares/auth.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use("/users", authMiddleware, userRoutes)
app.use("/category", authMiddleware, categoryRoutes)
app.use("/reimbursement", authMiddleware, reimbursementRoutes)
app.use('/auth', authRoutes);

app.get("/", (_req, res) => {
    res.json({message: "API rodando"})
});

export default app;