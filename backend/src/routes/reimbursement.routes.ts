import { Router } from "express";
import { createReimbursement, getReimbursement, getReimbursementById, updateReimbursement, submitReimbursement, approveReimbursement, rejectReimbursement, payReimbursement, cancelReimbursement, getReimbursementHistory } from "../controllers/reimbursement.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createReimbursementSchema, updateReimbursementSchema, rejectSchema } from "../validations/reimbursement.validation.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { createAttachmentSchema } from "../validations/attachment.validation.js";
import { createAttachment, listAttachments } from "../controllers/attachment.controller.js";

const reimbursementRoutes = Router();

reimbursementRoutes.post('/', validate(createReimbursementSchema), createReimbursement);
reimbursementRoutes.get('/', getReimbursement);
reimbursementRoutes.get('/:id/history', getReimbursementHistory);
reimbursementRoutes.get('/:id', getReimbursementById);
reimbursementRoutes.put('/:id', validate(updateReimbursementSchema), updateReimbursement);

reimbursementRoutes.post('/:id/submit', submitReimbursement);
reimbursementRoutes.post('/:id/approve', roleMiddleware("GESTOR"), approveReimbursement);
reimbursementRoutes.post('/:id/reject', roleMiddleware("GESTOR"), validate(rejectSchema), rejectReimbursement);
reimbursementRoutes.post('/:id/pay', roleMiddleware("FINANCEIRO"), payReimbursement);
reimbursementRoutes.post('/:id/cancel', cancelReimbursement);

reimbursementRoutes.post('/:id/attachments', validate(createAttachmentSchema), createAttachment);
reimbursementRoutes.get('/:id/attachments', listAttachments);

export default reimbursementRoutes;