import type {
  AIProviderConfig,
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamChunk,
  ImageGenOptions,
} from '@/core/ai/providers/ai-provider.interface';
import { OpenAICompatibleProvider } from '@/core/ai/providers/openai-compatible.provider';

describe('OpenAICompatibleProvider', () => {
  const createMockConfig = (overrides: Partial<AIProviderConfig> = {}): AIProviderConfig => ({
    baseURL: 'https://api.example.com/v1',
    apiKey: 'test-api-key',
    defaultModel: 'gpt-4',
    timeout: 30000,
    maxRetries: 3,
    ...overrides,
  });

  const mockChatResponse: ChatCompletionResponse = {
    id: 'chatcmpl-123',
    object: 'chat.completion',
    created: 1677652288,
    model: 'gpt-4',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: 'Hello, how can I help you?',
        },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: 10,
      completion_tokens: 20,
      total_tokens: 30,
    },
  };

  const createReadableStream = (chunks: string[]): ReadableStream => {
    let index = 0;
    return {
      getReader() {
        const encoder = new TextEncoder();
        return {
          read: async () => {
            if (index >= chunks.length) {
              return { done: true, value: undefined };
            }
            const value = encoder.encode(chunks[index]);
            index++;
            return { done: false, value };
          },
          releaseLock() {},
        };
      },
    } as unknown as ReadableStream;
  };

  let mockFetch: jest.Mock;
  let provider: OpenAICompatibleProvider;

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should set the provider name', () => {
      const config = createMockConfig();
      provider = new OpenAICompatibleProvider(config);
      expect(provider.name).toBe('openai-compatible');
    });

    it('should merge config with defaults', () => {
      const config = createMockConfig({ timeout: 60000 });
      provider = new OpenAICompatibleProvider(config);
      expect(provider.config.timeout).toBe(60000);
    });

    it('should use provided timeout and maxRetries when given', () => {
      const config = createMockConfig({ timeout: 60000, maxRetries: 5 });
      provider = new OpenAICompatibleProvider(config);
      expect(provider.config.timeout).toBe(60000);
      expect(provider.config.maxRetries).toBe(5);
    });

    it('should default timeout and maxRetries when not explicitly provided', () => {
      const config = createMockConfig();
      provider = new OpenAICompatibleProvider(config);
      expect(provider.config.timeout).toBe(30000);
      expect(provider.config.maxRetries).toBe(3);
    });
  });

  describe('chat', () => {
    const createChatRequest = (): ChatCompletionRequest => ({
      model: 'gpt-4',
      messages: [
        { role: 'user', content: 'Hello' },
      ],
      temperature: 0.7,
    });

    it('should make a POST request to the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChatResponse),
      });

      provider = new OpenAICompatibleProvider(createMockConfig());
      const request = createChatRequest();

      await provider.chat(request);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key',
          },
          body: JSON.stringify(request),
        })
      );
    });

    it('should return parsed response on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChatResponse),
      });

      provider = new OpenAICompatibleProvider(createMockConfig());
      const result = await provider.chat(createChatRequest());

      expect(result).toEqual(mockChatResponse);
    });

    it('should throw error on non-200 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
      });

      provider = new OpenAICompatibleProvider(createMockConfig());

      await expect(provider.chat(createChatRequest())).rejects.toThrow(
        'AI API Error: 401 - Unauthorized'
      );
    });

    it('should use configured baseURL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChatResponse),
      });

      const config = createMockConfig({ baseURL: 'https://custom.api.com/custom' });
      provider = new OpenAICompatibleProvider(config);

      await provider.chat(createChatRequest());

      expect(mockFetch).toHaveBeenCalledWith(
        'https://custom.api.com/custom/chat/completions',
        expect.any(Object)
      );
    });
  });

  describe('streamChat', () => {
    const createChatRequest = (): ChatCompletionRequest => ({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Hello' }],
    });

    it('should send stream: true in request', async () => {
      const mockResponse = {
        ok: true,
        body: createReadableStream([]),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      provider = new OpenAICompatibleProvider(createMockConfig());
      const onChunk = jest.fn();

      await provider.streamChat(createChatRequest(), onChunk);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ ...createChatRequest(), stream: true }),
        })
      );
    });

    it('should parse SSE data lines and call onChunk', async () => {
      const chunk1 = JSON.stringify({ id: '1', choices: [{ delta: { content: 'Hello' } }] });
      const chunk2 = JSON.stringify({ id: '2', choices: [{ delta: { content: ' world' } }] });
      const mockResponse = {
        ok: true,
        body: createReadableStream([
          `data: ${chunk1}\n`,
          `data: ${chunk2}\n`,
          'data: [DONE]\n',
        ]),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      provider = new OpenAICompatibleProvider(createMockConfig());
      const onChunk = jest.fn();

      await provider.streamChat(createChatRequest(), onChunk);

      expect(onChunk).toHaveBeenCalledTimes(2);
      expect(onChunk).toHaveBeenNthCalledWith(1, JSON.parse(chunk1));
      expect(onChunk).toHaveBeenNthCalledWith(2, JSON.parse(chunk2));
    });

    it('should handle JSON parse errors gracefully', async () => {
      const validChunk = JSON.stringify({ id: '1', choices: [{ delta: { content: 'Hello' } }] });
      const mockResponse = {
        ok: true,
        body: createReadableStream([
          `data: ${validChunk}\n`,
          'data: invalid-json\n',
          'data: [DONE]\n',
        ]),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      provider = new OpenAICompatibleProvider(createMockConfig());
      const onChunk = jest.fn();

      await provider.streamChat(createChatRequest(), onChunk);

      // Should still call onChunk for valid data
      expect(onChunk).toHaveBeenCalledTimes(1);
    });

    it('should throw error on non-200 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      provider = new OpenAICompatibleProvider(createMockConfig());
      const onChunk = jest.fn();

      await expect(
        provider.streamChat(createChatRequest(), onChunk)
      ).rejects.toThrow('AI API Error: 500');
    });

    it('should throw error when response body is null', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: null,
      });

      provider = new OpenAICompatibleProvider(createMockConfig());
      const onChunk = jest.fn();

      await expect(
        provider.streamChat(createChatRequest(), onChunk)
      ).rejects.toThrow('No response body');
    });
  });

  describe('generateImage', () => {
    const defaultImageResponse = {
      data: [
        {
          url: 'https://example.com/image.png',
          revised_prompt: 'A beautiful sunset over the ocean',
        },
      ],
    };

    it('should make a POST request to images/generations endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(defaultImageResponse),
      });

      provider = new OpenAICompatibleProvider(createMockConfig());

      await provider.generateImage('A sunset over the ocean');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/v1/images/generations',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key',
          },
        })
      );
    });

    it('should send correct image generation payload', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(defaultImageResponse),
      });

      provider = new OpenAICompatibleProvider(createMockConfig());
      const options: ImageGenOptions = {
        model: 'dall-e-3',
        width: 1024,
        height: 1024,
        quality: 'hd',
      };

      await provider.generateImage('A sunset', options);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody).toEqual({
        model: 'dall-e-3',
        prompt: 'A sunset',
        n: 1,
        size: '1024x1024',
        quality: 'hd',
      });
    });

    it('should use default values for optional fields', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(defaultImageResponse),
      });

      provider = new OpenAICompatibleProvider(createMockConfig());

      await provider.generateImage('A sunset');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.model).toBe('dall-e-3');
      expect(callBody.size).toBe('1024x1024');
      expect(callBody.quality).toBe('standard');
    });

    it('should return image response on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(defaultImageResponse),
      });

      provider = new OpenAICompatibleProvider(createMockConfig());

      const result = await provider.generateImage('A sunset');

      expect(result).toEqual({
        image_url: 'https://example.com/image.png',
        revised_prompt: 'A beautiful sunset over the ocean',
        model: 'dall-e-3',
      });
    });

    it('should throw error on non-200 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      provider = new OpenAICompatibleProvider(createMockConfig());

      await expect(provider.generateImage('A sunset')).rejects.toThrow(
        'Image generation failed: 400'
      );
    });
  });

  describe('healthCheck', () => {
    it('should return true when /models endpoint returns 200', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      provider = new OpenAICompatibleProvider(createMockConfig());

      const result = await provider.healthCheck();

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/v1/models',
        {
          headers: { 'Authorization': 'Bearer test-api-key' },
        }
      );
    });

    it('should return false when /models endpoint returns non-200', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      provider = new OpenAICompatibleProvider(createMockConfig());

      const result = await provider.healthCheck();

      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      provider = new OpenAICompatibleProvider(createMockConfig());

      const result = await provider.healthCheck();

      expect(result).toBe(false);
    });
  });
});
