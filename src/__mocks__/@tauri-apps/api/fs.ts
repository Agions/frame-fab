// Mock for @tauri-apps/api/fs module
export const readDir = jest.fn();
export const readFile = jest.fn();
export const readTextFile = jest.fn();
export const writeFile = jest.fn();
export const writeTextFile = jest.fn();
export const mkdir = jest.fn();
export const remove = jest.fn();
export const rename = jest.fn();
export const copyFile = jest.fn();
export const exists = jest.fn().mockResolvedValue(false);

const BaseDirectory = {};

export default {
  readDir,
  readFile,
  readTextFile,
  writeFile,
  writeTextFile,
  mkdir,
  remove,
  rename,
  copyFile,
  exists,
  BaseDirectory,
};