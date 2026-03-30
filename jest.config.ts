import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^@/(.*)$':        '<rootDir>/src/$1',
    '^@services/(.*)$':'<rootDir>/src/services/$1',
    '^@lib/(.*)$':     '<rootDir>/src/lib/$1',
    '^@types/(.*)$':   '<rootDir>/src/types/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  collectCoverageFrom: [
    'src/services/**/*.ts',
    '!src/services/**/__tests__/**',
    '!src/**/*.d.ts',
  ],
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: { branches: 60, functions: 70, lines: 70, statements: 70 },
  },
  transform: {
    '^.+\.tsx?$': ['ts-jest', { tsconfig: { module: 'commonjs' } }],
  },
};

export default config;
