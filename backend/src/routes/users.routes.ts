import { Router } from "express";
import { createUser, getUsers, getUserById, deleteUser, updateUser } from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createUserSchema } from "../validations/user.validation.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const userRoutes = Router();

userRoutes.get('/', roleMiddleware("ADMIN"), getUsers);
userRoutes.get('/:id', getUserById);
userRoutes.post('/', roleMiddleware("ADMIN"), validate(createUserSchema), createUser);
userRoutes.put('/:id', updateUser);
userRoutes.delete('/:id', deleteUser);

export default userRoutes;