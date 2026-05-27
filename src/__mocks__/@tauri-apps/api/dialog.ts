// Mock for @tauri-apps/api/dialog module
export const open = jest.fn();
export const save = jest.fn();
export const message = jest.fn();
export const confirm = jest.fn();
export const ask = jest.fn();

export default {
  open,
  save,
  message,
  confirm,
  ask,
};