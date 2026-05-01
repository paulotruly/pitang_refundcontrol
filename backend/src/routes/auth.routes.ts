import { Router } from "express";
import { register, login } from '../controllers/auth.controller.js';
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema } from "../validations/user.validation.js";
import { registerSchema } from "../validations/auth.validation.js";

const authRoutes = Router();

authRoutes.post('/register', validate(registerSchema), register);
authRoutes.post('/login', validate(loginSchema), login);

export default authRoutes;