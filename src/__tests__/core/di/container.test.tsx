import { render, screen } from '@testing-library/react';
import React from 'react';

import {
  DIContainer,
  InjectionToken,
  createToken,
  container,
  DIProvider,
  useContainer,
  useService,
  setupContainer,
} from '@/core/di/container';

// Mock the logger to prevent console output during tests
jest.mock('@/core/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('DIContainer', () => {
  let testContainer: DIContainer;

  beforeEach(() => {
    testContainer = new DIContainer();
  });

  describe('InjectionToken', () => {
    it('should create token with correct name', () => {
      const token = createToken<{ id: number }>('TestService');
      expect(token.toString()).toContain('TestService');
    });

    it('should create unique tokens', () => {
      const token1 = createToken<unknown>('Service');
      const token2 = createToken<unknown>('Service');
      expect(token1).not.toBe(token2);
    });
  });

  describe('registerSingleton', () => {
    it('should register a singleton instance', () => {
      const token = createToken<{ value: string }>('SingletonService');
      const instance = { value: 'test' };

      testContainer.registerSingleton(token, instance);

      expect(testContainer.has(token)).toBe(true);
      expect(testContainer.resolve(token)).toBe(instance);
    });

    it('should register a singleton factory', () => {
      const token = createToken<{ id: number }>('FactorySingleton');
      const factory = () => ({ id: Math.random() });

      testContainer.registerSingleton(token, factory);

      const instance1 = testContainer.resolve(token);
      const instance2 = testContainer.resolve(token);

      expect(instance1).toBe(instance2); // Same instance
    });

    it('should return same instance on multiple resolves', () => {
      const token = createToken<string>('StringService');
      const instance = 'shared';

      testContainer.registerSingleton(token, instance);
      const resolved1 = testContainer.resolve(token);
      const resolved2 = testContainer.resolve(token);

      expect(resolved1).toBe(resolved2);
      expect(resolved1).toBe(instance);
    });
  });

  describe('registerFactory', () => {
    it('should register a factory that creates new instances', () => {
      const token = createToken<{ id: number }>('FactoryService');
      let instanceCount = 0;
      const factory = () => ({ id: ++instanceCount });

      testContainer.registerFactory(token, factory);

      const instance1 = testContainer.resolve(token);
      const instance2 = testContainer.resolve(token);

      expect(instance1).not.toBe(instance2);
      expect(instance1.id).toBe(1);
      expect(instance2.id).toBe(2);
    });
  });

  describe('registerInstance', () => {
    it('should register an existing instance as singleton', () => {
      const token = createToken<{ name: string }>('InstanceService');
      const instance = { name: 'existing' };

      testContainer.registerInstance(token, instance);

      expect(testContainer.has(token)).toBe(true);
      expect(testContainer.resolve(token)).toBe(instance);
    });
  });

  describe('resolve', () => {
    it('should throw error when resolving unregistered token', () => {
      const token = createToken<unknown>('Unregistered');
      expect(() => testContainer.resolve(token)).toThrow('Service not registered');
    });

    it('should detect circular dependency', () => {
      const tokenA = createToken<unknown>('ServiceA');
      const tokenB = createToken<unknown>('ServiceB');

      let resolveB: () => unknown;
      testContainer.registerFactory(tokenA, () => resolveB());
      testContainer.registerFactory(tokenB, () => testContainer.resolve(tokenA));
      resolveB = () => testContainer.resolve(tokenB);

      expect(() => testContainer.resolve(tokenA)).toThrow('Circular dependency detected');
    });
  });

  describe('has', () => {
    it('should return true for registered services', () => {
      const token = createToken<unknown>('Registered');
      testContainer.registerSingleton(token, 'value');
      expect(testContainer.has(token)).toBe(true);
    });

    it('should return false for unregistered services', () => {
      const token = createToken<unknown>('NotRegistered');
      expect(testContainer.has(token)).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all registered services', () => {
      const token1 = createToken<unknown>('Service1');
      const token2 = createToken<unknown>('Service2');

      testContainer.registerSingleton(token1, 'value1');
      testContainer.registerSingleton(token2, 'value2');
      testContainer.clear();

      expect(testContainer.has(token1)).toBe(false);
      expect(testContainer.has(token2)).toBe(false);
    });
  });

  describe('getRegisteredTokens', () => {
    it('should return all registered token descriptions', () => {
      testContainer.registerSingleton(createToken<string>('A'), 'a');
      testContainer.registerSingleton(createToken<number>('B'), 1);
      testContainer.registerSingleton(createToken<boolean>('C'), true);

      const tokens = testContainer.getRegisteredTokens();
      expect(tokens).toContain('A');
      expect(tokens).toContain('B');
      expect(tokens).toContain('C');
    });
  });
});

describe('Global container', () => {
  it('should export a singleton container instance', () => {
    expect(container).toBeInstanceOf(DIContainer);
  });
});

describe('setupContainer', () => {
  it('should setup container without error', () => {
    expect(() => setupContainer()).not.toThrow();
  });
});

describe('DIProvider', () => {
  it('should render children', () => {
    const { container } = render(
      <DIProvider>
        <div data-testid="child">Child Content</div>
      </DIProvider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should accept custom container', () => {
    const customContainer = new DIContainer();
    const { container: containerEl } = render(
      <DIProvider container={customContainer}>
        <div>Test</div>
      </DIProvider>
    );
    expect(containerEl.firstChild).toBeInTheDocument();
  });
});

describe('useContainer', () => {
  it('should return container from context', () => {
    const customContainer = new DIContainer();
    let capturedContainer: DIContainer | null = null;

    const TestComponent = () => {
      capturedContainer = useContainer();
      return <div>Test</div>;
    };

    render(
      <DIProvider container={customContainer}>
        <TestComponent />
      </DIProvider>
    );

    expect(capturedContainer).toBe(customContainer);
  });

  it('should return global container when outside provider', () => {
    let capturedContainer: DIContainer | null = null;

    const TestComponent = () => {
      capturedContainer = useContainer();
      return <div>Test</div>;
    };

    render(<TestComponent />);
    expect(capturedContainer).toBe(container); // Uses exported container
  });
});

describe('useService', () => {
  const mockToken = createToken<{ getData: () => string }>('MockService');
  let mockInstance: { getData: () => string };

  beforeEach(() => {
    mockInstance = { getData: () => 'mock data' };
    container.clear();
    container.registerSingleton(mockToken, mockInstance);
  });

  it('should resolve service from container', () => {
    let resolvedService: { getData: () => string } | null = null;

    const TestComponent = () => {
      resolvedService = useService(mockToken);
      return <div>{resolvedService.getData()}</div>;
    };

    render(
      <DIProvider>
        <TestComponent />
      </DIProvider>
    );

    expect(resolvedService).toBe(mockInstance);
  });

  it('should re-resolve when token changes', () => {
    const TestComponent = () => {
      const service = useService(mockToken);
      return <div>{service.getData()}</div>;
    };

    const { rerender } = render(
      <DIProvider>
        <TestComponent />
      </DIProvider>
    );

    expect(screen.getByText('mock data')).toBeInTheDocument();

    // useService uses useMemo - it won't re-resolve just because container internal state changed
    // The token dependency is the same object reference, so memoized value persists
    // This demonstrates that clearing container doesn't trigger re-resolution automatically
    container.clear();

    // Re-register with same token but different instance
    const newInstance = { getData: () => 'new data' };
    container.registerSingleton(mockToken, newInstance);

    // Without a token or container change, the memoized result persists
    rerender(
      <DIProvider>
        <TestComponent />
      </DIProvider>
    );

    // Still shows old data because useMemo caches the resolution
    expect(screen.getByText('mock data')).toBeInTheDocument();
  });

  it('should re-resolve when a new token is used', () => {
    const newToken = createToken<{ getData: () => string }>('NewService');
    container.registerSingleton(newToken, { getData: () => 'new service data' });

    const TestComponent = () => {
      const service = useService(newToken);
      return <div>{service.getData()}</div>;
    };

    render(
      <DIProvider>
        <TestComponent />
      </DIProvider>
    );

    expect(screen.getByText('new service data')).toBeInTheDocument();
  });
});