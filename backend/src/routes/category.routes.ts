import { Router } from "express";
import { createCategory, getCategory, getCategoryById, deleteCategory, updateCategory } from "../controllers/category.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createCategorySchema, updateCategorySchema } from "../validations/category.validation.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { validateParams } from "../middlewares/validate-params.middleware.js";
import { idParamsSchema } from "../validations/params.validation.js";

const categoryRoutes = Router();

categoryRoutes.get('/', getCategory);
categoryRoutes.get('/:id', validateParams(idParamsSchema), getCategoryById);
categoryRoutes.post('/', roleMiddleware("ADMIN"), validate(createCategorySchema), createCategory);
categoryRoutes.put('/:id', validateParams(idParamsSchema), roleMiddleware("ADMIN"), validate(updateCategorySchema), updateCategory);
categoryRoutes.delete('/:id', validateParams(idParamsSchema), roleMiddleware("ADMIN"), deleteCategory);

export default categoryRoutes;