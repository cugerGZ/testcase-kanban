/** 测试状态 */
export type TestStatus = 'pending' | 'failed' | 'passed';

/** 优先级 */
export type Priority = 'P0' | 'P1' | 'P2';

/** 页面 */
export interface Page {
  id: string;
  name: string;           // 英文标识，如 "ScriptPage"
  displayName: string;    // 中文名称，如 "台词管理页面"
  description?: string;
  createdAt: number;
  updatedAt: number;
}

/** 分类 */
export interface Category {
  id: string;
  pageId: string;
  name: string;           // 分类名称，如 "台词列表测试"
  parentName?: string;    // 父级分类名称
  fullPath: string;       // 完整路径，如 "台词列表测试 > 列表加载"
  order: number;
}

/** 测试用例 */
export interface TestCase {
  id: string;
  code: string;           // 编号，如 "TC-SL-001"
  title: string;          // 标题
  pageId: string;
  categoryId: string;
  priority: Priority;
  preconditions?: string;
  steps: string[];
  expectedResults: string[];
  testData?: string;
  status: TestStatus;
  notes?: string;         // 测试备注
  testedAt?: number;      // 最后测试时间
  createdAt: number;
  updatedAt: number;
}

/** 看板列显示设置 */
export interface ColumnVisibility {
  pending: boolean;
  failed: boolean;
  passed: boolean;
}

/** 应用状态 */
export interface AppState {
  version: string;
  pages: Page[];
  categories: Category[];
  testCases: TestCase[];
  currentPageId: string | null;
  columnVisibility: Record<string, ColumnVisibility>;
  lastUpdated: number;
}

/** 解析后的测试用例（导入时使用） */
export interface ParsedTestCase {
  code: string;
  title: string;
  categoryPath: string[];  // 分类路径，如 ["台词列表测试", "列表加载"]
  priority: Priority;
  preconditions?: string;
  steps: string[];
  expectedResults: string[];
  testData?: string;
}

/** 解析结果 */
export interface ParseResult {
  categories: string[][];      // 分类路径数组
  testCases: ParsedTestCase[];
}

/** 统计数据 */
export interface Statistics {
  total: number;
  pending: number;
  failed: number;
  passed: number;
}
