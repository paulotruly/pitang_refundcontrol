// Polyfills executados ANTES do ambiente de teste ser configurado.
// Necessário porque o TanStack Router usa TextEncoder/TextDecoder
// que não existem no jsdom por padrão.
// Usa CommonJS (require) porque o Jest roda em modo CommonJS.
const { TextEncoder, TextDecoder } = require("node:util");

globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;
