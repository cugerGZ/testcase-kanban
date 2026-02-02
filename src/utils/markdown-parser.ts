import type { ParseResult, ParsedTestCase, Priority } from '../types';

/**
 * 解析 Markdown 测试用例文档
 * @param content Markdown 文本内容
 * @returns 解析结果
 */
export function parseMarkdownTestCases(content: string): ParseResult {
  const lines = content.split('\n');
  const categories: string[][] = [];
  const testCases: ParsedTestCase[] = [];

  let currentCategory: string[] = [];
  let currentTestCase: Partial<ParsedTestCase> | null = null;
  let currentField: string | null = null;
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 跳过代码块
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    // 匹配二级标题（大分类）- 跳过测试概述等非测试分类
    if (line.startsWith('## ')) {
      const categoryName = line.replace('## ', '').replace(/^\d+\.\s*/, '').trim();
      // 跳过概述类标题
      if (categoryName &&
          !categoryName.includes('测试概述') &&
          !categoryName.includes('概述') &&
          !categoryName.includes('附录')) {
        currentCategory = [categoryName];
      }
      continue;
    }

    // 匹配测试用例标题（三级或四级）- 支持多种格式
    // 格式1: ### TC-001: 用例标题
    // 格式2: #### TC-SL-001：用例标题 (中文冒号)
    // 格式3: ### TC-017A: 用例标题
    const testCaseMatch = line.match(/^#{3,4}\s+(TC-(?:[A-Z]+-)?\d+[A-Z]?)[：:]\s*(.+)$/);
    if (testCaseMatch) {
      // 保存上一个用例
      if (currentTestCase && currentTestCase.code) {
        testCases.push(normalizeTestCase(currentTestCase));
      }

      currentTestCase = {
        code: testCaseMatch[1],
        title: testCaseMatch[2].trim(),
        categoryPath: [...currentCategory],
        priority: 'P1' as Priority,
        steps: [],
        expectedResults: [],
      };
      currentField = null;
      continue;
    }

    // 匹配三级标题（子分类）
    if (line.startsWith('### ')) {
      const subCategoryName = line.replace('### ', '').replace(/^\d+\.\d+\s*/, '').trim();
      // 跳过概述类标题
      if (subCategoryName &&
          currentCategory.length > 0 &&
          !subCategoryName.includes('测试范围') &&
          !subCategoryName.includes('测试环境') &&
          !subCategoryName.includes('优先级说明') &&
          !subCategoryName.includes('前置条件') &&
          !subCategoryName.includes('测试数据准备')) {
        currentCategory = [currentCategory[0], subCategoryName];
        const categoryPath = currentCategory.join(' > ');
        if (!categories.some(c => c.join(' > ') === categoryPath)) {
          categories.push([...currentCategory]);
        }
      }
      continue;
    }

    // 解析用例字段
    if (currentTestCase) {
      const trimmedLine = line.trim();

      // 优先级
      if (trimmedLine.includes('**优先级**') || trimmedLine.includes('- **优先级**')) {
        const priorityMatch = trimmedLine.match(/P[012]/);
        if (priorityMatch) {
          currentTestCase.priority = priorityMatch[0] as Priority;
        }
        currentField = null;
        continue;
      }

      // 前置条件
      if (trimmedLine.includes('**前置条件**')) {
        const colonIndex = trimmedLine.indexOf(':') !== -1 ? trimmedLine.indexOf(':') : trimmedLine.indexOf('：');
        if (colonIndex !== -1) {
          const value = trimmedLine.substring(colonIndex + 1).trim();
          if (value) {
            currentTestCase.preconditions = value;
          }
        }
        currentField = 'preconditions';
        continue;
      }

      // 测试步骤
      if (trimmedLine.includes('**测试步骤**') || trimmedLine.includes('**步骤**')) {
        currentField = 'steps';
        continue;
      }

      // 预期结果
      if (trimmedLine.includes('**预期结果**')) {
        currentField = 'expectedResults';
        continue;
      }

      // 测试数据
      if (trimmedLine.includes('**测试数据**')) {
        const colonIndex = trimmedLine.indexOf(':') !== -1 ? trimmedLine.indexOf(':') : trimmedLine.indexOf('：');
        if (colonIndex !== -1) {
          const value = trimmedLine.substring(colonIndex + 1).trim();
          if (value) {
            currentTestCase.testData = value;
          }
        }
        currentField = 'testData';
        continue;
      }

      // 检测到新字段开始
      if (trimmedLine.startsWith('- **') && trimmedLine.includes('**')) {
        currentField = null;
        continue;
      }

      // 解析列表项 - 支持多种格式
      // 格式: 1. xxx, - xxx, * xxx, 1) xxx
      const listItemMatch = trimmedLine.match(/^[\s]*(\d+[.)]|-|\*)\s*(.+)$/);
      if (listItemMatch && currentField) {
        let value = listItemMatch[2].trim();
        value = value.replace(/^\[\s?[xX]?\]\s*/, '');
        if (value && currentField === 'steps') {
          currentTestCase.steps = currentTestCase.steps || [];
          currentTestCase.steps.push(value);
        } else if (value && currentField === 'expectedResults') {
          currentTestCase.expectedResults = currentTestCase.expectedResults || [];
          currentTestCase.expectedResults.push(value);
        }
      }
    }
  }

  // 保存最后一个用例
  if (currentTestCase && currentTestCase.code) {
    testCases.push(normalizeTestCase(currentTestCase));
  }

  return { categories, testCases };
}

/**
 * 标准化测试用例数据
 */
function normalizeTestCase(testCase: Partial<ParsedTestCase>): ParsedTestCase {
  return {
    code: testCase.code || '',
    title: testCase.title || '',
    categoryPath: testCase.categoryPath || [],
    priority: testCase.priority || 'P1',
    preconditions: testCase.preconditions,
    steps: testCase.steps || [],
    expectedResults: testCase.expectedResults || [],
    testData: testCase.testData,
  };
}

/**
 * 从文件名提取页面名称
 * 例如: "ScriptPage/测试用例文档.md" => "ScriptPage"
 */
export function extractPageNameFromPath(filePath: string): string | null {
  // 尝试匹配 docs/XXXPage/ 或 XXXPage/ 格式
  const match = filePath.match(/(?:docs\/)?([A-Za-z]+Page)\//i);
  if (match) {
    return match[1];
  }
  return null;
}

/**
 * 从文档内容提取页面显示名称
 */
export function extractPageDisplayName(content: string): string | null {
  // 尝试匹配一级标题
  const h1Match = content.match(/^#\s+(.+?)(?:测试用例文档)?$/m);
  if (h1Match) {
    return h1Match[1].trim().replace(/测试用例文档?$/, '').trim() || null;
  }
  return null;
}
