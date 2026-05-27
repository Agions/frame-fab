// Mock for @tauri-apps/api/core module (Tauri 2.x)
const mockInvoke = jest.fn();
const mockConvertFileSrc = jest.fn((path: string) => `asset://localhost/${path}`);
const mockIsTauri = jest.fn(() => false);

export const invoke = mockInvoke;
export const convertFileSrc = mockConvertFileSrc;
export const isTauri = mockIsTauri;
export const checkPermissions = jest.fn().mockResolvedValue({ result: 'granted' });
export const requestPermissions = jest.fn().mockResolvedValue({ result: 'granted' });
export const addPluginListener = jest.fn();
export const transformCallback = jest.fn();
export const Channel = jest.fn();
export const PermissionState = jest.fn();
export const emit = jest.fn();
export const listen = jest.fn().mockResolvedValue(undefined);
export const once = jest.fn();
export { mockInvoke, mockConvertFileSrc, mockIsTauri };
