// Mock for @tauri-apps/api/notification module
export const sendNotification = jest.fn().mockResolvedValue(undefined);
export const isPermissionGranted = jest.fn().mockResolvedValue(true);
export const requestPermission = jest.fn().mockResolvedValue('granted');
export const onPermissionGranted = jest.fn();
export const onPermissionDenied = jest.fn();
export const onNotificationActionPerformed = jest.fn();

export default {
  sendNotification,
  isPermissionGranted,
  requestPermission,
};