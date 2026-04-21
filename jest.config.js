export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  testPathIgnorePatterns: [
    '<rootDir>/src/__tests__/setup.ts',
    '<rootDir>/src/__tests__/utils/test-utils.tsx',
    '<rootDir>/src/__tests__/services/workflow.service.test.ts',
    '<rootDir>/src/__tests__/pages/project-edit.test.tsx',
    '<rootDir>/src/__tests__/pages/project-detail.test.tsx',
    '<rootDir>/src/__tests__/__mocks__/@tauri-apps/api-tauri.ts',
    '<rootDir>/src/__tests__/__mocks__/@tauri-apps/api-core.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '\\.(css|less|scss|sass)$': '<rootDir>/src/__tests__/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/__tests__/__mocks__/fileMock.js',
    '^@tauri-apps/api/notification$': '<rootDir>/src/__mocks__/@tauri-apps/api/notification.ts',
    '^@tauri-apps/api/fs$': '<rootDir>/src/__mocks__/@tauri-apps/api/fs.ts',
    '^@tauri-apps/api/dialog$': '<rootDir>/src/__mocks__/@tauri-apps/api/dialog.ts',
    '^@tauri-apps/api/core$': '<rootDir>/src/__tests__/__mocks__/@tauri-apps/api-core.ts',
    '^@tauri-apps/api/tauri$': '<rootDir>/src/__tests__/__mocks__/@tauri-apps/api-tauri.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  collectCoverageFrom: [
    'src/core/**/*.{ts,tsx}',
    'src/components/business/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/index.ts',
    '!src/**/index.tsx'
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.[jt]sx?$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      }
    }]
  },
  globals: {
    'import.meta': { env: { DEV: false } },
  },
};