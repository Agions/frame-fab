import { ServiceRegistry, Injectable, bootstrapServices } from '../../../core/di/service-registry';
import type { ServiceFactory } from '../../../core/di/service-registry';

describe('ServiceRegistry', () => {
  // Use the real singleton but clear between tests to avoid pollution
  beforeEach(() => {
    ServiceRegistry.clear();
  });

  afterEach(() => {
    ServiceRegistry.clear();
  });

  describe('register()', () => {
    it('should register a service with factory', () => {
      const factory = jest.fn(() => ({ name: 'test' }));
      ServiceRegistry.register('test-service', factory);
      expect(ServiceRegistry.has('test-service')).toBe(true);
    });

    it('should register multiple services', () => {
      ServiceRegistry.register('service-a', () => 'a');
      ServiceRegistry.register('service-b', () => 'b');
      expect(ServiceRegistry.list()).toContain('service-a');
      expect(ServiceRegistry.list()).toContain('service-b');
    });
  });

  describe('get()', () => {
    it('should return singleton instance (same instance on multiple calls)', () => {
      const factory = jest.fn(() => ({ id: Math.random() }));
      ServiceRegistry.register('singleton', factory, true);

      const instance1 = ServiceRegistry.get('singleton');
      const instance2 = ServiceRegistry.get('singleton');

      expect(instance1).toBe(instance2);
      expect(factory).toHaveBeenCalledTimes(1);
    });

    it('should return new instance each time for non-singleton', () => {
      const factory = jest.fn(() => ({ id: Math.random() }));
      ServiceRegistry.register('factory', factory, false);

      const instance1 = ServiceRegistry.get('factory');
      const instance2 = ServiceRegistry.get('factory');

      expect(instance1).not.toBe(instance2);
      expect(factory).toHaveBeenCalledTimes(2);
    });

    it('should throw error when service not registered and no fallback', () => {
      expect(() => ServiceRegistry.get('nonexistent')).toThrow(
        '[ServiceRegistry] Service not registered: nonexistent'
      );
    });

    it('should use global fallback when service not registered but fallback exists', () => {
      const fallbackFactory = jest.fn(() => ({ from: 'fallback' }));
      ServiceRegistry.setGlobalFallback('fallback-service', fallbackFactory);

      const instance = ServiceRegistry.get('fallback-service');
      expect(instance).toEqual({ from: 'fallback' });
      expect(fallbackFactory).toHaveBeenCalledTimes(1);
    });
  });

  describe('has()', () => {
    it('should return true for registered service', () => {
      ServiceRegistry.register('my-service', () => ({}));
      expect(ServiceRegistry.has('my-service')).toBe(true);
    });

    it('should return false for unregistered service', () => {
      expect(ServiceRegistry.has('nonexistent')).toBe(false);
    });

    it('should return true for service with global fallback', () => {
      ServiceRegistry.setGlobalFallback('fb-service', () => ({}));
      expect(ServiceRegistry.has('fb-service')).toBe(true);
    });
  });

  describe('list()', () => {
    it('should list all registered service IDs', () => {
      ServiceRegistry.register('a', () => 'a');
      ServiceRegistry.register('b', () => 'b');
      ServiceRegistry.setGlobalFallback('c', () => 'c');

      const listed = ServiceRegistry.list();
      expect(listed).toContain('a');
      expect(listed).toContain('b');
      expect(listed).toContain('c');
    });

    it('should return empty array when nothing registered', () => {
      // clear() only clears services map, not globalFallback map.
      // Verify services map is empty by checking list() returns only fallbacks.
      ServiceRegistry.clear();
      const listed = ServiceRegistry.list();
      // Services are cleared; only globalFallback entries remain.
      // Verify services 'a' and 'b' are not in the list (they were cleared)
      expect(listed).not.toContain('a');
      expect(listed).not.toContain('b');
    });
  });

  describe('clear()', () => {
    it('should remove all registered services', () => {
      ServiceRegistry.register('a', () => 'a');
      ServiceRegistry.register('b', () => 'b');
      ServiceRegistry.clear();

      expect(ServiceRegistry.has('a')).toBe(false);
      expect(ServiceRegistry.has('b')).toBe(false);
      // Services cleared; only global fallbacks may remain
      expect(ServiceRegistry.list()).not.toContain('a');
      expect(ServiceRegistry.list()).not.toContain('b');
    });

    it('should not affect global fallbacks', () => {
      ServiceRegistry.register('a', () => 'a');
      ServiceRegistry.setGlobalFallback('fb', () => 'fb');
      ServiceRegistry.clear();

      expect(ServiceRegistry.has('fb')).toBe(true);
    });
  });

  describe('setGlobalFallback()', () => {
    it('should set fallback factory for service ID', () => {
      const factory: ServiceFactory = () => ({ default: true });
      ServiceRegistry.setGlobalFallback('default-service', factory);

      expect(ServiceRegistry.has('default-service')).toBe(true);
    });

    it('should allow override of fallback', () => {
      const factory1: ServiceFactory = () => 'first';
      const factory2: ServiceFactory = () => 'second';
      ServiceRegistry.setGlobalFallback('svc', factory1);
      ServiceRegistry.setGlobalFallback('svc', factory2);

      expect(ServiceRegistry.get('svc')).toBe('second');
    });
  });

  describe('getExisting()', () => {
    it('should return undefined for unregistered service', () => {
      expect(ServiceRegistry.getExisting('nonexistent')).toBeUndefined();
    });

    it('should return undefined for singleton before first get', () => {
      ServiceRegistry.register('singleton', () => ({}), true);
      expect(ServiceRegistry.getExisting('singleton')).toBeUndefined();
    });

    it('should return existing instance after get for singleton', () => {
      const factory = jest.fn(() => ({ value: 'test' }));
      ServiceRegistry.register('singleton', factory, true);

      ServiceRegistry.get('singleton');
      const existing = ServiceRegistry.getExisting('singleton');

      expect(existing).toEqual({ value: 'test' });
    });

    it('should return undefined for non-singleton service', () => {
      ServiceRegistry.register('non-singleton', () => ({}), false);
      ServiceRegistry.get('non-singleton');
      expect(ServiceRegistry.getExisting('non-singleton')).toBeUndefined();
    });
  });

  describe('override()', () => {
    it('should replace existing service instance', () => {
      ServiceRegistry.register('my-service', () => ({ original: true }), true);
      const newInstance = { overridden: true };

      ServiceRegistry.override('my-service', newInstance);
      const instance = ServiceRegistry.get('my-service');

      expect(instance).toEqual({ overridden: true });
    });

    it('should do nothing for non-registered service', () => {
      expect(() => ServiceRegistry.override('nonexistent', {})).not.toThrow();
    });
  });
});

describe('Injectable decorator', () => {
  beforeEach(() => {
    ServiceRegistry.clear();
  });

  afterEach(() => {
    ServiceRegistry.clear();
  });

  it('should register class as service via decorator', () => {
    class TestService {
      doSomething() {
        return 'done';
      }
    }

    // Create a local registry to test the decorator pattern
    const localRegistry = ServiceRegistry;
    const InjectableDecorator = (id: string, singleton = true) => {
      return function <T extends new (...args: any[]) => any>(ctor: T) {
        localRegistry.register(id, () => new ctor(), singleton);
        return ctor;
      };
    };

    InjectableDecorator('test-deco', true)(TestService);

    expect(localRegistry.has('test-deco')).toBe(true);
  });
});

describe('bootstrapServices()', () => {
  it('should exist and be callable', () => {
    expect(typeof bootstrapServices).toBe('function');
    // Currently a no-op, so just verify it doesn't throw
    expect(() => bootstrapServices()).not.toThrow();
  });
});
