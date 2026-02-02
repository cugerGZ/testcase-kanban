import { FileText, Upload } from 'lucide-react';
import { Button } from '../common';

interface EmptyStateProps {
  onImportClick: () => void;
}

export function EmptyState({ onImportClick }: EmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md animate-in fade-in duration-500">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mb-6 shadow-lg">
          <FileText size={48} className="text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          欢迎使用测试用例看板
        </h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          导入 Markdown 格式的测试用例文档，<br />
          轻松管理和追踪您的测试进度
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={onImportClick}
          className="shadow-lg shadow-blue-500/25"
        >
          <Upload size={20} />
          导入测试文档
        </Button>

        <div className="mt-8 p-4 bg-gray-50 rounded-xl text-left">
          <h4 className="text-sm font-medium text-gray-700 mb-2">💡 快速开始</h4>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>1. 准备好符合格式的 Markdown 测试用例文档</li>
            <li>2. 点击上方按钮导入文档</li>
            <li>3. 开始管理您的测试用例状态</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
