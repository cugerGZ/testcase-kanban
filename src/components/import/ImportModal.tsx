import { useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import { Modal, Button, FileUpload, Select } from '../common';
import { useAppStore } from '../../store/useAppStore';
import { storage } from '../../utils/storage';
import { parseMarkdownTestCases, extractPageDisplayName } from '../../utils/markdown-parser';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ImportStep = 'upload' | 'preview' | 'result';

export function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const { pages, importTestCases, addPage } = useAppStore();

  const [step, setStep] = useState<ImportStep>('upload');
  const [fileContent, setFileContent] = useState<string>('');
  const [parseResult, setParseResult] = useState<{
    categories: string[][];
    testCases: { code: string; title: string; categoryPath: string[] }[];
  } | null>(null);
  const [parseError, setParseError] = useState<string>('');

  const [selectedPageId, setSelectedPageId] = useState<string>('');
  const [newPageName, setNewPageName] = useState<string>('');
  const [newPageDisplayName, setNewPageDisplayName] = useState<string>('');

  const [importResult, setImportResult] = useState<{ imported: number; updated: number } | null>(null);

  // 处理文件选择
  const handleFileSelect = useCallback(async (file: File) => {
    setParseError('');

    try {
      const content = await storage.readMarkdownFile(file);
      setFileContent(content);

      // 解析文档
      const result = parseMarkdownTestCases(content);

      if (result.testCases.length === 0) {
        setParseError('未在文档中找到有效的测试用例。请确保用例格式正确（如 #### TC-XX-001: 用例标题）');
        return;
      }

      setParseResult({
        categories: result.categories,
        testCases: result.testCases.map(tc => ({
          code: tc.code,
          title: tc.title,
          categoryPath: tc.categoryPath,
        })),
      });

      // 尝试提取页面名称
      const displayName = extractPageDisplayName(content);
      if (displayName) {
        setNewPageDisplayName(displayName);
      }

      // 从文件名提取页面名称
      const fileNameMatch = file.name.match(/^([A-Za-z]+Page)/i);
      if (fileNameMatch) {
        setNewPageName(fileNameMatch[1]);
      }

      setStep('preview');
    } catch (error) {
      setParseError(error instanceof Error ? error.message : '文件解析失败');
    }
  }, []);

  // 处理导入
  const handleImport = useCallback(() => {
    if (!parseResult || !fileContent) return;

    // 确定目标页面
    let targetPageId = selectedPageId;
    const pageName = newPageName || 'UnknownPage';
    const pageDisplayName = newPageDisplayName || pageName;

    // 如果选择了新建页面
    if (!selectedPageId && newPageName) {
      // 检查是否已存在同名页面
      const existingPage = pages.find(p => p.name === newPageName);
      if (existingPage) {
        targetPageId = existingPage.id;
      } else {
        // 创建新页面
        targetPageId = addPage({
          name: pageName,
          displayName: pageDisplayName,
        });
      }
    }

    // 重新解析完整数据
    const fullResult = parseMarkdownTestCases(fileContent);

    // 执行导入
    const result = importTestCases(
      targetPageId,
      pageName,
      pageDisplayName,
      fullResult.testCases
    );

    setImportResult(result);
    setStep('result');
  }, [parseResult, fileContent, selectedPageId, newPageName, newPageDisplayName, pages, addPage, importTestCases]);

  // 重置状态
  const handleReset = useCallback(() => {
    setStep('upload');
    setFileContent('');
    setParseResult(null);
    setParseError('');
    setSelectedPageId('');
    setNewPageName('');
    setNewPageDisplayName('');
    setImportResult(null);
  }, []);

  // 关闭弹窗
  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  const pageOptions = pages.map(page => ({
    value: page.id,
    label: `${page.displayName} (${page.name})`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="📥 导入测试用例文档"
      size="lg"
      footer={
        step === 'upload' ? null : step === 'preview' ? (
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={handleReset}>
              重新选择
            </Button>
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={!selectedPageId && !newPageName}
            >
              <Upload size={18} />
              确认导入
            </Button>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button variant="primary" onClick={handleClose}>
              完成
            </Button>
          </div>
        )
      }
    >
      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div className="space-y-4">
          <FileUpload
            accept=".md"
            onFileSelect={handleFileSelect}
            placeholder="点击或拖拽 Markdown 文件到此处"
          />

          {parseError && (
            <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">解析失败</p>
                <p className="text-sm text-red-600 mt-1">{parseError}</p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">📋 支持的文档格式</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• 用例编号格式: <code className="bg-blue-100 px-1 rounded">#### TC-XX-000: 用例标题</code></li>
              <li>• 包含优先级: <code className="bg-blue-100 px-1 rounded">- **优先级**: P0/P1/P2</code></li>
              <li>• 包含测试步骤和预期结果</li>
            </ul>
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 'preview' && parseResult && (
        <div className="space-y-6">
          {/* 解析结果统计 */}
          <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 size={24} className="text-green-500" />
            <div>
              <p className="text-sm font-medium text-green-800">
                解析成功！共发现 {parseResult.testCases.length} 个测试用例
              </p>
              <p className="text-xs text-green-600 mt-1">
                {parseResult.categories.length} 个分类
              </p>
            </div>
          </div>

          {/* 选择目标页面 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">选择目标页面</h4>

            {pages.length > 0 && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">选择已有页面:</label>
                <Select
                  value={selectedPageId}
                  onChange={(value) => {
                    setSelectedPageId(value);
                    if (value) {
                      setNewPageName('');
                      setNewPageDisplayName('');
                    }
                  }}
                  options={[{ value: '', label: '-- 创建新页面 --' }, ...pageOptions]}
                  placeholder="选择页面"
                />
              </div>
            )}

            {!selectedPageId && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">页面标识 (英文):</label>
                  <input
                    type="text"
                    value={newPageName}
                    onChange={(e) => setNewPageName(e.target.value)}
                    placeholder="如 ScriptPage"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">页面名称 (中文):</label>
                  <input
                    type="text"
                    value={newPageDisplayName}
                    onChange={(e) => setNewPageDisplayName(e.target.value)}
                    placeholder="如 台词管理页面"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 用例预览 */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">用例预览 (前 10 个)</h4>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">编号</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">标题</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">分类</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {parseResult.testCases.slice(0, 10).map((tc, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono text-blue-600">{tc.code}</td>
                      <td className="px-3 py-2 text-gray-700">{tc.title}</td>
                      <td className="px-3 py-2 text-gray-500 text-xs">
                        {tc.categoryPath.join(' > ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parseResult.testCases.length > 10 && (
                <div className="px-3 py-2 text-center text-xs text-gray-500 bg-gray-50">
                  ... 还有 {parseResult.testCases.length - 10} 个用例
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Result */}
      {step === 'result' && importResult && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle2 size={32} className="text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">导入完成！</h3>
          <p className="text-sm text-gray-600">
            新增 <span className="font-semibold text-green-600">{importResult.imported}</span> 个用例，
            更新 <span className="font-semibold text-blue-600">{importResult.updated}</span> 个用例
          </p>
        </div>
      )}
    </Modal>
  );
}
