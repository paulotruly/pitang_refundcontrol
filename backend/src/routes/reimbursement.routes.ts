import { Router } from "express";
import { createReimbursement, getReimbursement, getReimbursementById, updateReimbursement, submitReimbursement, approveReimbursement, rejectReimbursement, payReimbursement, cancelReimbursement, getReimbursementHistory } from "../controllers/reimbursement.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createReimbursementSchema, updateReimbursementSchema, rejectSchema } from "../validations/reimbursement.validation.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { createAttachment, listAttachments } from "../controllers/attachment.controller.js";
import { validateParams } from "../middlewares/validate-params.middleware.js";
import { idParamsSchema } from "../validations/params.validation.js";
import { reembolsoQuerySchema } from "../validations/query.validation.js";
import { validateQuery } from "../middlewares/validate-query.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const reimbursementRoutes = Router();

reimbursementRoutes.post('/', validate(createReimbursementSchema), createReimbursement);
reimbursementRoutes.get('/', validateQuery(reembolsoQuerySchema), getReimbursement);
reimbursementRoutes.get('/:id/history', validateParams(idParamsSchema), getReimbursementHistory);
reimbursementRoutes.get('/:id', validateParams(idParamsSchema), getReimbursementById);
reimbursementRoutes.put('/:id', validateParams(idParamsSchema), validate(updateReimbursementSchema), updateReimbursement);

reimbursementRoutes.post('/:id/submit', validateParams(idParamsSchema), submitReimbursement);
reimbursementRoutes.post('/:id/approve', validateParams(idParamsSchema), roleMiddleware("GESTOR"), approveReimbursement);
reimbursementRoutes.post('/:id/reject', validateParams(idParamsSchema), roleMiddleware("GESTOR"), validate(rejectSchema), rejectReimbursement);
reimbursementRoutes.post('/:id/pay', validateParams(idParamsSchema), roleMiddleware("FINANCEIRO"), payReimbursement);
reimbursementRoutes.post('/:id/cancel', validateParams(idParamsSchema), cancelReimbursement);

                                                                            // espera um arquivo chamado
reimbursementRoutes.post('/:id/attachments', validateParams(idParamsSchema), upload.single("comprovante"), createAttachment);
reimbursementRoutes.get('/:id/attachments', validateParams(idParamsSchema), listAttachments);

export default reimbursementRoutes;