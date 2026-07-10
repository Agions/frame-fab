module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  maxWorkers: '50%',
  workerIdleMemoryLimit: '1GB',
  cacheDirectory: '<rootDir>/.jest-cache',
  passWithNoTests: true,
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/src/__tests__/setup.ts',
    '<rootDir>/src/__tests__/utils/test-utils.tsx',
    '<rootDir>/src/__tests__/utils/mock-context.ts',
    '<rootDir>/src/__tests__/fixtures/',
    '<rootDir>/src/__tests__/__mocks__/@tauri-apps/api-tauri.ts',
    '<rootDir>/src/__tests__/__mocks__/@tauri-apps/api-core.ts',
    // Skipped pending form refactor / missing deps:
    '<rootDir>/src/__tests__/pages/project-edit.test.tsx',
    '<rootDir>/src/__tests__/pages/project-detail.test.tsx',
    '<rootDir>/src/__tests__/core/api/client.test.ts',
    '<rootDir>/src/__tests__/e2e/',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': '<rootDir>/src/__tests__/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/__tests__/__mocks__/fileMock.js',
    '^@tauri-apps/api/notification$': '<rootDir>/src/__mocks__/@tauri-apps/api/notification.ts',
    '^@tauri-apps/api/fs$': '<rootDir>/src/__mocks__/@tauri-apps/api/fs.ts',
    '^@tauri-apps/api/dialog$': '<rootDir>/src/__mocks__/@tauri-apps/api/dialog.ts',
    '^@tauri-apps/api/core$': '<rootDir>/src/__tests__/__mocks__/@tauri-apps/api-core.ts',
    '^@tauri-apps/api/tauri$': '<rootDir>/src/__tests__/__mocks__/@tauri-apps/api-tauri.ts',
    '^@tauri-apps/plugin-fs$': '<rootDir>/src/__mocks__/@tauri-apps/api/fs.ts',
    '^@tauri-apps/plugin-dialog$': '<rootDir>/src/__mocks__/@tauri-apps/api/dialog.ts',
    '^@tauri-apps/plugin-notification$': '<rootDir>/src/__mocks__/@tauri-apps/api/notification.ts',
    '^uuid$': '<rootDir>/src/__tests__/__mocks__/uuid.js',
    '^@ffmpeg/ffmpeg$': '<rootDir>/src/__tests__/__mocks__/@ffmpeg/ffmpeg.js',
    '^@ffmpeg/util$': '<rootDir>/src/__tests__/__mocks__/@ffmpeg/util.js',
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
      branches: 60,
      functions: 65,
      lines: 70,
      statements: 70
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
