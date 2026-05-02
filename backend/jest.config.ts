import type { Config } from "jest";

// - setupFilesAfterEnv: prepara banco de teste antes de cada arquivo
const config: Config = {
  preset: "ts-jest/presets/default-esm", 
  testEnvironment: "node", 
  extensionsToTreatAsEsm: [".ts"], 
  globals: {"ts-jest": { useESM: true }}, 
  moduleNameMapper: {"^(\\.{1,2}/.*)\\.js$": "$1"}, 
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"], // executa setup antes de cada teste
  maxWorkers: 1 // executa testes sequencialmente (evita conflitos de SQLite)
};

export default config;