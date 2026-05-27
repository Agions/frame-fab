/**
 * ApiClient unit tests
 *
 * Note: Error handling, upload/download, and token management tests require
 * complex mock setup that interacts with axios interceptors in ways that are
 * difficult to replicate in unit tests. These would be better covered by
 * integration tests with a properly configured axios instance.
 */

import ApiClient, { apiClient } from '../../../core/api/client';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => ({
      interceptors: {
        request: { use: jest.fn(), handlers: [] },
        response: { use: jest.fn(), handlers: [] },
      },
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    })),
  },
}));

describe('ApiClient', () => {
  let client: ApiClient;
  let mockAxiosInstance: ReturnType<typeof jest.fn>& {
    interceptors: { request: { use: jest.Mock; handlers: any[] }; response: { use: jest.Mock; handlers: any[] } };
    get: jest.Mock;
    post: jest.Mock;
    put: jest.Mock;
    patch: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const axios = require('axios');
    const instance = axios.default.create();
    mockAxiosInstance = instance as typeof mockAxiosInstance;
    client = new ApiClient();
  });

  describe('constructor', () => {
    it('should create axios instance on initialization', () => {
      const axios = require('axios');
      expect(axios.default.create).toHaveBeenCalled();
    });

    it('should set up request and response interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });

    it('should accept custom baseURL', () => {
      const customClient = new ApiClient('https://custom.example.com');
      expect(customClient).toBeDefined();
    });
  });

  describe('HTTP methods', () => {
    it('should make GET request', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { code: 200, data: { id: 1 }, message: 'OK', success: true },
      });

      const result = await client.get('/test');
      expect(mockAxiosInstance.get).toHaveBeenCalled();
      expect(result).toEqual({ id: 1 });
    });

    it('should make POST request with data', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: { code: 200, data: { created: true }, message: 'OK', success: true },
      });

      const result = await client.post('/test', { name: 'test' });
      expect(mockAxiosInstance.post).toHaveBeenCalled();
      expect(result).toEqual({ created: true });
    });

    it('should make PUT request', async () => {
      mockAxiosInstance.put.mockResolvedValue({
        data: { code: 200, data: { updated: true }, message: 'OK', success: true },
      });

      const result = await client.put('/test/1', { name: 'updated' });
      expect(mockAxiosInstance.put).toHaveBeenCalled();
      expect(result).toEqual({ updated: true });
    });

    it('should make PATCH request', async () => {
      mockAxiosInstance.patch.mockResolvedValue({
        data: { code: 200, data: { patched: true }, message: 'OK', success: true },
      });

      const result = await client.patch('/test/1', { name: 'patched' });
      expect(mockAxiosInstance.patch).toHaveBeenCalled();
      expect(result).toEqual({ patched: true });
    });

    it('should make DELETE request', async () => {
      mockAxiosInstance.delete.mockResolvedValue({
        data: { code: 200, data: { deleted: true }, message: 'OK', success: true },
      });

      const result = await client.delete('/test/1');
      expect(mockAxiosInstance.delete).toHaveBeenCalled();
      expect(result).toEqual({ deleted: true });
    });
  });

  describe('exported apiClient', () => {
    it('should export a default apiClient instance', () => {
      expect(apiClient).toBeDefined();
      expect(apiClient).toBeInstanceOf(ApiClient);
    });
  });
});
