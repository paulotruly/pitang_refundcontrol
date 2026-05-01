import { Router } from "express";
import { createUser, getUsers, getUserById, deleteUser, updateUser } from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createUserSchema } from "../validations/user.validation.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { validateParams } from "../middlewares/validate-params.middleware.js";
import { idParamsSchema } from "../validations/params.validation.js";

const userRoutes = Router();

userRoutes.get('/', roleMiddleware("ADMIN"), getUsers);
userRoutes.get('/:id', validateParams(idParamsSchema), getUserById);
userRoutes.post('/', roleMiddleware("ADMIN"), validate(createUserSchema), createUser);
userRoutes.put('/:id', validateParams(idParamsSchema), updateUser);
userRoutes.delete('/:id', validateParams(idParamsSchema), deleteUser);

export default userRoutes;