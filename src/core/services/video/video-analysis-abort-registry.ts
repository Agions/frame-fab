/**
 * 视频分析 AbortController 注册表
 * @module core/services/video/video-analysis-abort-registry
 *
 * 提取自原 VideoAnalysisService.abortControllers 内部 Map + cancelAnalysis 私有方法。
 * 独立为可复用注册表，便于在多个分析任务间共享生命周期管理。
 */

export class AbortControllerRegistry {
  private controllers: Map<string, AbortController> = new Map();

  /**
   * 注册一个 AbortController 并返回它（供 fetch / 异步任务使用其 signal）
   */
  register(id: string): AbortController {
    const controller = new AbortController();
    this.controllers.set(id, controller);
    return controller;
  }

  /**
   * 取消并移除指定 id 的 controller
   *
   * @returns 是否找到并取消了
   */
  cancel(id: string): boolean {
    const controller = this.controllers.get(id);
    if (!controller) return false;
    controller.abort();
    this.controllers.delete(id);
    return true;
  }

  /** 获取指定 id 的 controller（如不存在返回 undefined） */
  get(id: string): AbortController | undefined {
    return this.controllers.get(id);
  }

  /** 当前活跃的 controller 数量 */
  get size(): number {
    return this.controllers.size;
  }

  /** 清空所有 controller（不触发 abort） */
  clear(): void {
    this.controllers.clear();
  }
}
