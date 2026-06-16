/**
 * Domain Events — 领域事件基类与预定义事件
 * 所有领域事件均实现 IEvent 接口，通过 EventBus 异步传播
 */

/**
 * 事件基类 — 所有领域事件的父类
 * @version 1.0 初始版本，未来可能演进需注意兼容性
 */
export abstract class DomainEvent {
  readonly id: string;
  readonly timestamp: number;
  readonly correlationId?: string;
  /** 事件版本，用于前向兼容的事件演进 */
  readonly version: string;

  constructor(
    public readonly type: string,
    public readonly source: string,
    correlationId?: string,
    version: string = '1.0'
  ) {
    this.id = crypto.randomUUID();
    this.timestamp = Date.now();
    this.correlationId = correlationId ?? this.id;
    this.version = version;
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      type: this.type,
      source: this.source,
      timestamp: this.timestamp,
      correlationId: this.correlationId,
      version: this.version,
    };
  }
}

// ========== Pipeline 事件 ==========

export class StepStartedEvent extends DomainEvent {
  constructor(
    source: string,
    public readonly stepId: string,
    public readonly stepName: string
  ) {
    super('pipeline.step.started', source);
  }
}

export class StepProgressEvent extends DomainEvent {
  constructor(
    source: string,
    public readonly stepId: string,
    public readonly progress: number,
    public readonly message: string
  ) {
    super('pipeline.step.progress', source);
  }
}

export class StepCompletedEvent extends DomainEvent {
  constructor(
    source: string,
    public readonly stepId: string,
    public readonly durationMs: number,
    public readonly metrics?: Record<string, unknown>
  ) {
    super('pipeline.step.completed', source);
  }
}

// ========== Event Factory ==========
