/**
 * Pipeline Controller 基类
 * ========================
 * 消除 manga-pipeline controller 之间的 checkpoint/progress/execute 重复。
 */

import type {
  StepInput,
  StepOutput,
  CheckpointState,
} from '../../../core/pipeline/step.interface';

export abstract class BasePipelineController<T> {
  abstract readonly id: string;
  abstract readonly name: string;

  private _checkpoint: CheckpointState<T> | null = null;
  private _progress: number = 0;
  onProgress?: (event: { stepId: string; progress: number; message: string }) => void;

  setProgressHandler(handler: typeof this.onProgress) {
    this.onProgress = handler;
  }

  protected reportProgress(progress: number, message: string) {
    this._progress = progress;
    this.onProgress?.({ stepId: this.id, progress, message });
  }

  async execute(input: StepInput): Promise<StepOutput> {
    return this.process(input);
  }

  abstract process(input: StepInput): Promise<StepOutput>;

  getCheckpoint() {
    return this._checkpoint;
  }

  restore(state: CheckpointState<T>) {
    this._checkpoint = state;
  }
}
