/**
 * Reducer Field Updater 共享 Helper
 * ==================================
 * 消除 6 个 reducer 中 12L makeSetter/createFieldUpdater 的跨文件重复。
 */

/** 标准 updater 类型：支持直接值或函数式更新 */
export type FieldUpdater<T> = T | ((prev: T) => T);

/**
 * 创建字段更新器：支持 `setValue(newValue)` 和 `setValue(prev => next)` 两种调用方式。
 * dispatch 用 any 以兼容各 reducer 的字面量 action 类型。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createFieldUpdater(dispatch: (action: any) => void, key: string) {
  return (payload: FieldUpdater<any>) => {
    if (typeof payload === 'function') {
      const updater = payload as unknown as (prev: unknown) => unknown;
      dispatch({ type: 'update', key, updater });
    } else {
      dispatch({ type: 'set', key, value: payload });
    }
  };
}
