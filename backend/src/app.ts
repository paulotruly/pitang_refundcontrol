import express from 'express';
import cors from "cors";
import userRoutes from './routes/users.routes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use("/users", userRoutes)

app.get("/", (_req, res) => {
    res.json({message: "API rodando"})
});

export default app;