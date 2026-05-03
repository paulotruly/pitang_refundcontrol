import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/default-esm", 
  testEnvironment: "node", 
  extensionsToTreatAsEsm: [".ts"], 
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }]
  },
  moduleNameMapper: {"^(\\.{1,2}/.*)\\.js$": "$1"}, 
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
  maxWorkers: 1
};

export default config;