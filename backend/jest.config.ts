import type { Config } from "jest";

// Configuração do Jest para ESM + TypeScript + Prisma
// - maxWorkers: 1 força execução sequencial (evita locks de SQLite)
// - setupFilesAfterEnv: prepara banco de teste antes de cada arquivo
const config: Config = {
  preset: "ts-jest/presets/default-esm", // Preset para ESM e TypeScript
  testEnvironment: "node", // Ambiente Node.js (não browser)
  extensionsToTreatAsEsm: [".ts"], // Trata arquivos .ts como ESM
  globals: {"ts-jest": { useESM: true }}, // Configura ts-jest para ESM
  moduleNameMapper: {"^(\\.{1,2}/.*)\\.js$": "$1"}, // Corrige importações com .js no ESM
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"], // Executa setup antes de cada teste
  maxWorkers: 1 // Executa testes sequencialmente (evita conflitos de SQLite)
};

export default config;