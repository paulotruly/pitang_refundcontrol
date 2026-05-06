import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/test/polyfills.js"],
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: false, tsconfig: "<rootDir>/tsconfig.test.json" }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  maxWorkers: 1,
};

export default config;