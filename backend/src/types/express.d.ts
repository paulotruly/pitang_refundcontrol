import { JwtPayload } from "./auth.js";

// express.d.ts é um "patch" que ensina ao TypeScript que req.user existe e tem o tipo JwtPayload

declare global {
    namespace Express {
        interface Request {
            user: JwtPayload;
        }
    }
}