import { Router } from "express";
import { register, login, refresh, logout } from '../controllers/auth.controller.js';
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema } from "../validations/user.validation.js";
import { refreshTokenSchema, registerSchema } from "../validations/auth.validation.js";

const authRoutes = Router();

authRoutes.post('/register', validate(registerSchema), register);
authRoutes.post('/login', validate(loginSchema), login);
authRoutes.post('/refresh', validate(refreshTokenSchema), refresh);
authRoutes.post('/logout', validate(refreshTokenSchema), logout);

export default authRoutes;