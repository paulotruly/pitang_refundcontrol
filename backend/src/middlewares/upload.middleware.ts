import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";

// onde salvar os arquivos
const storage = multer.diskStorage({
    destination: "uploads/", // destino da pasta
    filename: (_req, file, cb) => { // função que é aplicada toda vez que precisar salvar um arquivo: _req -> o objeto da requisição que vem de fora, file -> o arquivo, cb -> o nome do arquivo
        // renomeia com UUID para evitar conflitos entre arquivos com o mesmo nome
        const ext = path.extname(file.originalname); // extrai a extensão do arquivo ex: ".png" e renomeia mantendo a mesma extensão
        cb(null, `${randomUUID()}${ext}`); // define o nome final
    },
});

// validação de tipos
// cb -> aqui ele serve pra dizer se aceita ou rejeita o arquivo que tá sendo enviado
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png"]; // são os tipos que ele vai aceitar
    
    if (allowed.includes(file.mimetype)) { // verifica se o arquivo está alinhado com os tipos "allowed"
        cb(null, true); // se sim, aceita
    } else {
        cb(new Error("Tipo de arquivo não permitido. Aceitos: PDF, JPG, PNG")); // se não, rejeita
    }
};

// configuração completa
export const upload = multer({
    storage, // onde salvar o arquivo
    fileFilter, // quais tipos aceitar
    limits: { fileSize: 5 * 1024 * 1024 }, // limite 5MB
});