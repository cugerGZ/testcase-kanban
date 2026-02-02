import type { AppState } from '../types';

const STORAGE_KEY = 'test-cases-app-state';

/**
 * 存储工具
 */
export const storage = {
  /**
   * 保存数据到 localStorage
   */
  save: (data: AppState): boolean => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  },

  /**
   * 从 localStorage 读取数据
   */
  load: (): AppState | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  },

  /**
   * 清除存储的数据
   */
  clear: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * 导出数据为 JSON 文件
   */
  exportToFile: (data: AppState): void => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-cases-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * 从 JSON 文件导入数据
   */
  importFromFile: (file: File): Promise<AppState> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string) as AppState;
          // 基本验证
          if (!data.version || !Array.isArray(data.pages) || !Array.isArray(data.testCases)) {
            throw new Error('Invalid data format');
          }
          resolve(data);
        } catch {
          reject(new Error('无效的 JSON 文件格式'));
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file);
    });
  },

  /**
   * 读取 Markdown 文件内容
   */
  readMarkdownFile: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.name.endsWith('.md')) {
        reject(new Error('请选择 Markdown (.md) 文件'));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file);
    });
  },
};
