import { Router } from "express";
import { createUser, getUsers, getUserById, deleteUser, updateUser } from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createUserSchema } from "../validations/user.validation.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { validateParams } from "../middlewares/validate-params.middleware.js";
import { idParamsSchema } from "../validations/params.validation.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const userRoutes = Router();

userRoutes.get('/', authMiddleware, roleMiddleware("ADMIN"), getUsers);
userRoutes.get('/:id', authMiddleware, validateParams(idParamsSchema), getUserById);
userRoutes.post('/', validate(createUserSchema), createUser);
userRoutes.put('/:id', authMiddleware, validateParams(idParamsSchema), updateUser);
userRoutes.delete('/:id', authMiddleware, validateParams(idParamsSchema), deleteUser);

export default userRoutes;