import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppState,
  Page,
  Category,
  TestCase,
  TestStatus,
  ParsedTestCase
} from '../types';
import { nanoid } from '../utils/helpers';

interface AppStore extends AppState {
  // 页面操作
  addPage: (page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updatePage: (id: string, updates: Partial<Page>) => void;
  deletePage: (id: string) => void;
  setCurrentPage: (pageId: string | null) => void;

  // 分类操作
  addCategory: (category: Omit<Category, 'id'>) => string;
  getCategoriesByPage: (pageId: string) => Category[];

  // 测试用例操作
  addTestCase: (testCase: Omit<TestCase, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTestCase: (id: string, updates: Partial<TestCase>) => void;
  updateTestCaseStatus: (id: string, status: TestStatus, notes?: string) => void;
  deleteTestCase: (id: string) => void;
  getTestCasesByPage: (pageId: string) => TestCase[];
  getTestCasesByStatus: (pageId: string, status: TestStatus) => TestCase[];

  // 批量操作
  importTestCases: (
    pageId: string,
    pageName: string,
    pageDisplayName: string,
    parsedCases: ParsedTestCase[]
  ) => { imported: number; updated: number };

  // 数据导入导出
  exportData: () => string;
  importData: (jsonString: string) => boolean;

  // 统计
  getStatistics: (pageId?: string) => { total: number; pending: number; failed: number; passed: number };

  // 重置
  resetStore: () => void;
}

const initialState: AppState = {
  version: '1.0.0',
  pages: [],
  categories: [],
  testCases: [],
  currentPageId: null,
  lastUpdated: Date.now(),
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ==================== 页面操作 ====================

      addPage: (pageData) => {
        const id = nanoid();
        const now = Date.now();
        const newPage: Page = {
          ...pageData,
          id,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          pages: [...state.pages, newPage],
          lastUpdated: now,
        }));

        return id;
      },

      updatePage: (id, updates) => {
        const now = Date.now();
        set((state) => ({
          pages: state.pages.map((page) =>
            page.id === id ? { ...page, ...updates, updatedAt: now } : page
          ),
          lastUpdated: now,
        }));
      },

      deletePage: (id) => {
        set((state) => ({
          pages: state.pages.filter((page) => page.id !== id),
          categories: state.categories.filter((cat) => cat.pageId !== id),
          testCases: state.testCases.filter((tc) => tc.pageId !== id),
          currentPageId: state.currentPageId === id ? null : state.currentPageId,
          lastUpdated: Date.now(),
        }));
      },

      setCurrentPage: (pageId) => {
        set({ currentPageId: pageId });
      },

      // ==================== 分类操作 ====================

      addCategory: (categoryData) => {
        const id = nanoid();
        const newCategory: Category = {
          ...categoryData,
          id,
        };

        set((state) => ({
          categories: [...state.categories, newCategory],
          lastUpdated: Date.now(),
        }));

        return id;
      },

      getCategoriesByPage: (pageId) => {
        return get().categories.filter((cat) => cat.pageId === pageId);
      },

      // ==================== 测试用例操作 ====================

      addTestCase: (testCaseData) => {
        const id = nanoid();
        const now = Date.now();
        const newTestCase: TestCase = {
          ...testCaseData,
          id,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          testCases: [...state.testCases, newTestCase],
          lastUpdated: now,
        }));
      },

      updateTestCase: (id, updates) => {
        const now = Date.now();
        set((state) => ({
          testCases: state.testCases.map((tc) =>
            tc.id === id ? { ...tc, ...updates, updatedAt: now } : tc
          ),
          lastUpdated: now,
        }));
      },

      updateTestCaseStatus: (id, status, notes) => {
        const now = Date.now();
        set((state) => ({
          testCases: state.testCases.map((tc) =>
            tc.id === id
              ? {
                  ...tc,
                  status,
                  notes: notes !== undefined ? notes : tc.notes,
                  testedAt: status !== 'pending' ? now : tc.testedAt,
                  updatedAt: now,
                }
              : tc
          ),
          lastUpdated: now,
        }));
      },

      deleteTestCase: (id) => {
        set((state) => ({
          testCases: state.testCases.filter((tc) => tc.id !== id),
          lastUpdated: Date.now(),
        }));
      },

      getTestCasesByPage: (pageId) => {
        return get().testCases.filter((tc) => tc.pageId === pageId);
      },

      getTestCasesByStatus: (pageId, status) => {
        return get().testCases.filter(
          (tc) => tc.pageId === pageId && tc.status === status
        );
      },

      // ==================== 批量导入 ====================

      importTestCases: (pageId, pageName, pageDisplayName, parsedCases) => {
        const state = get();
        let imported = 0;
        let updated = 0;

        // 确保页面存在
        let targetPageId = pageId;
        const existingPage = state.pages.find(p => p.id === pageId || p.name === pageName);

        if (!existingPage && !pageId) {
          // 创建新页面
          targetPageId = get().addPage({
            name: pageName,
            displayName: pageDisplayName,
          });
        } else if (existingPage) {
          targetPageId = existingPage.id;
        }

        const now = Date.now();
        const newTestCases: TestCase[] = [];
        const newCategories: Category[] = [];
        const existingCategories = [...state.categories];

        // 处理每个解析的测试用例
        for (const parsed of parsedCases) {
          // 处理分类
          const categoryPath = parsed.categoryPath.join(' > ');
          let category = existingCategories.find(
            (c) => c.pageId === targetPageId && c.fullPath === categoryPath
          );

          if (!category) {
            // 创建新分类
            const newCategory: Category = {
              id: nanoid(),
              pageId: targetPageId,
              name: parsed.categoryPath[parsed.categoryPath.length - 1] || '未分类',
              parentName: parsed.categoryPath.length > 1 ? parsed.categoryPath[0] : undefined,
              fullPath: categoryPath || '未分类',
              order: existingCategories.length + newCategories.length,
            };
            newCategories.push(newCategory);
            existingCategories.push(newCategory);
            category = newCategory;
          }

          // 检查是否存在相同编号的用例
          const existingCase = state.testCases.find(
            (tc) => tc.pageId === targetPageId && tc.code === parsed.code
          );

          if (existingCase) {
            // 更新现有用例（保留状态和备注）
            updated++;
            newTestCases.push({
              ...existingCase,
              title: parsed.title,
              categoryId: category.id,
              priority: parsed.priority,
              preconditions: parsed.preconditions,
              steps: parsed.steps,
              expectedResults: parsed.expectedResults,
              testData: parsed.testData,
              updatedAt: now,
            });
          } else {
            // 创建新用例
            imported++;
            newTestCases.push({
              id: nanoid(),
              code: parsed.code,
              title: parsed.title,
              pageId: targetPageId,
              categoryId: category.id,
              priority: parsed.priority,
              preconditions: parsed.preconditions,
              steps: parsed.steps,
              expectedResults: parsed.expectedResults,
              testData: parsed.testData,
              status: 'pending',
              createdAt: now,
              updatedAt: now,
            });
          }
        }

        // 更新 store
        set((state) => {
          // 合并测试用例（替换更新的，添加新的）
          const updatedCodes = new Set(
            newTestCases.filter((tc) =>
              state.testCases.some((existing) => existing.code === tc.code && existing.pageId === targetPageId)
            ).map((tc) => tc.code)
          );

          const filteredExisting = state.testCases.filter(
            (tc) => !(tc.pageId === targetPageId && updatedCodes.has(tc.code))
          );

          return {
            categories: [...state.categories, ...newCategories],
            testCases: [...filteredExisting, ...newTestCases],
            currentPageId: targetPageId,
            lastUpdated: now,
          };
        });

        return { imported, updated };
      },

      // ==================== 数据导入导出 ====================

      exportData: () => {
        const state = get();
        return JSON.stringify({
          version: state.version,
          pages: state.pages,
          categories: state.categories,
          testCases: state.testCases,
          lastUpdated: state.lastUpdated,
        }, null, 2);
      },

      importData: (jsonString) => {
        try {
          const data = JSON.parse(jsonString);
          if (!data.version || !Array.isArray(data.pages) || !Array.isArray(data.testCases)) {
            return false;
          }

          set({
            version: data.version,
            pages: data.pages,
            categories: data.categories || [],
            testCases: data.testCases,
            currentPageId: data.pages.length > 0 ? data.pages[0].id : null,
            lastUpdated: Date.now(),
          });

          return true;
        } catch {
          return false;
        }
      },

      // ==================== 统计 ====================

      getStatistics: (pageId) => {
        const testCases = pageId
          ? get().testCases.filter((tc) => tc.pageId === pageId)
          : get().testCases;

        return {
          total: testCases.length,
          pending: testCases.filter((tc) => tc.status === 'pending').length,
          failed: testCases.filter((tc) => tc.status === 'failed').length,
          passed: testCases.filter((tc) => tc.status === 'passed').length,
        };
      },

      // ==================== 重置 ====================

      resetStore: () => {
        set(initialState);
      },
    }),
    {
      name: 'test-cases-app-state',
    }
  )
);
