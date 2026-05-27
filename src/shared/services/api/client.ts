/**
 * API 客户端基础设施
 * 基于 Fetch API 的 HTTP 客户端
 */

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface RequestInterceptor {
  onFulfilled?: (config: RequestInit) => RequestInit | Promise<RequestInit>;
  onRejected?: (error: unknown) => unknown;
}

export interface ResponseInterceptor {
  onFulfilled?: (response: Response) => Response;
  onRejected?: (error: ApiError) => ApiError;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL.replace(/\/$/, '');
    this.timeout = config.timeout ?? 30000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  /**
   * 添加请求拦截器
   */
  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index > -1) this.requestInterceptors.splice(index, 1);
    };
  }

  /**
   * 添加响应拦截器
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    this.responseInterceptors.push(interceptor);
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor);
      if (index > -1) this.responseInterceptors.splice(index, 1);
    };
  }

  /**
   * 构建完整 URL
   */
  private buildURL(path: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(`${this.baseURL}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    return url.toString();
  }

  /**
   * 处理请求
   */
  private async handleRequest(init: RequestInit): Promise<RequestInit> {
    let modified = { ...init };

    for (const interceptor of this.requestInterceptors) {
      try {
        if (interceptor.onFulfilled) {
          modified = await interceptor.onFulfilled(modified);
        }
      } catch (error) {
        if (interceptor.onRejected) {
          throw interceptor.onRejected(error);
        }
        throw error;
      }
    }

    return modified;
  }

  /**
   * 处理响应
   */
  private async handleResponse(response: Response): Promise<Response> {
    let modified = response;

    for (const interceptor of this.responseInterceptors) {
      try {
        if (interceptor.onFulfilled) {
          modified = interceptor.onFulfilled(modified);
        }
      } catch (error) {
        if (interceptor.onRejected) {
          throw interceptor.onRejected(error as ApiError);
        }
        throw error;
      }
    }

    return modified;
  }

  /**
   * GET 请求
   */
  async get<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
    return this.request<T>(path, { method: 'GET', params });
  }

  /**
   * POST 请求
   */
  async post<T>(path: string, data?: unknown): Promise<T> {
    return this.request<T>(path, { method: 'POST', body: data as BodyInit });
  }

  /**
   * PUT 请求
   */
  async put<T>(path: string, data?: unknown): Promise<T> {
    return this.request<T>(path, { method: 'PUT', body: data as BodyInit });
  }

  /**
   * PATCH 请求
   */
  async patch<T>(path: string, data?: unknown): Promise<T> {
    return this.request<T>(path, { method: 'PATCH', body: data as BodyInit });
  }

  /**
   * DELETE 请求
   */
  async delete<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
    return this.request<T>(path, { method: 'DELETE', params });
  }

  /**
   * 通用请求方法
   */
  async request<T>(path: string, init: RequestInit & { params?: Record<string, string | number | boolean> } = {}): Promise<T> {
    const { params, body, ...rest } = init as RequestInit & { params?: Record<string, string | number | boolean> };

    const url = this.buildURL(path, params);

    const requestInit: RequestInit = {
      ...rest,
      headers: {
        ...this.defaultHeaders,
        ...rest.headers,
      },
      body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
    };

    // 应用请求拦截器
    const processedRequest = await this.handleRequest(requestInit);

    // 发起请求
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    let response: Response;
    try {
      response = await fetch(url, {
        ...processedRequest,
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      if ((error as Error).name === 'AbortError') {
        throw new ApiError('Request timeout', 0, 'Timeout');
      }
      throw new ApiError(
        (error as Error).message || 'Network error',
        0,
        'Network Error'
      );
    } finally {
      clearTimeout(timeoutId);
    }

    // 应用响应拦截器
    const processedResponse = await this.handleResponse(response);

    // 解析响应
    const contentType = processedResponse.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    const responseData = isJson
      ? await processedResponse.json()
      : await processedResponse.text();

    // 处理错误状态
    if (!processedResponse.ok) {
      throw new ApiError(
        (responseData as Record<string, unknown>)?.message as string || processedResponse.statusText,
        processedResponse.status,
        processedResponse.statusText,
        responseData
      );
    }

    return responseData as T;
  }
}

/**
 * 创建 API 客户端实例
 */
export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}

export default ApiClient;
