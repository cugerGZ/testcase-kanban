/**
 * 生成简单唯一 ID
 */
export function nanoid(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * 深拷贝
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 按属性分组
 */
export function groupBy<T, K extends keyof T>(
  array: T[],
  key: K
): Map<T[K], T[]> {
  const map = new Map<T[K], T[]>();
  for (const item of array) {
    const groupKey = item[key];
    if (!map.has(groupKey)) {
      map.set(groupKey, []);
    }
    map.get(groupKey)!.push(item);
  }
  return map;
}

/**
 * 数组去重
 */
export function unique<T>(array: T[], key?: keyof T): T[] {
  if (key) {
    const seen = new Set();
    return array.filter((item) => {
      const k = item[key];
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }
  return [...new Set(array)];
}

/**
 * 安全的 JSON 解析
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}
