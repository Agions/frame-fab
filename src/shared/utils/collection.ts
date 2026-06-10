/**
 * 集合工具：数组分块/去重/排序、对象过滤/映射
 */

/** 数组分块 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/** 数组去重 */
export function uniqueArray<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/** 按字段排序 */
export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/** 对象过滤 */
export function filterObject<T extends Record<string, unknown>>(
  obj: T,
  predicate: (key: string, value: unknown) => boolean
): Partial<T> {
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (predicate(key, value)) {
      (result as Record<string, unknown>)[key as string] = value;
    }
  }
  return result;
}

/** 对象映射 */
export function mapObject<T, U>(
  obj: Record<string, T>,
  mapper: (key: string, value: T) => U
): Record<string, U> {
  const result: Record<string, U> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = mapper(key, value);
  }
  return result;
}
