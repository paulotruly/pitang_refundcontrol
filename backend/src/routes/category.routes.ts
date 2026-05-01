import { Router } from "express";
import { createCategory, getCategory, getCategoryById, deleteCategory, updateCategory } from "../controllers/category.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createCategorySchema } from "../validations/category.validation.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const categoryRoutes = Router();

categoryRoutes.get('/', getCategory);
categoryRoutes.get('/:id', getCategoryById);
categoryRoutes.post('/', roleMiddleware("ADMIN"), validate(createCategorySchema), createCategory);
categoryRoutes.put('/:id', roleMiddleware("ADMIN"), updateCategory);
categoryRoutes.delete('/:id', deleteCategory);

export default categoryRoutes;