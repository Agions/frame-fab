// Mock for @tauri-apps/api/tauri module
const invoke = jest.fn();
const convertFileSrc = jest.fn((path: string) => `file://mock/${path}`);
const isTauri = jest.fn(() => false);
const checkPermissions = jest.fn();
const requestPermissions = jest.fn();
const addPluginListener = jest.fn();
const transformCallback = jest.fn();
const Channel = jest.fn();
const PermissionState = jest.fn();

export { invoke, convertFileSrc, isTauri, checkPermissions, requestPermissions, addPluginListener, transformCallback, Channel, PermissionState };