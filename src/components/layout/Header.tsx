import { FlaskConical, Upload, Download, Trash2, BarChart3, Home } from 'lucide-react';
import { Button } from '../common';
import { useAppStore } from '../../store/useAppStore';
import { storage } from '../../utils/storage';

interface HeaderProps {
  onImportClick: () => void;
  showStats: boolean;
  onToggleStats: () => void;
  showHomeButton?: boolean;
  onHomeClick?: () => void;
}

export function Header({ onImportClick, showStats, onToggleStats, showHomeButton, onHomeClick }: HeaderProps) {
  const { pages, testCases, exportData, resetStore } = useAppStore();

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-cases-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (window.confirm('确定要清空所有数据吗？此操作不可恢复！')) {
      resetStore();
      storage.clear();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <FlaskConical size={28} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">测试用例看板</h1>
            <p className="text-xs text-gray-500">
              {pages.length} 个页面 · {testCases.length} 个用例
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* 首页按钮 */}
          {showHomeButton && (
            <Button variant="secondary" size="md" onClick={onHomeClick}>
              <Home size={18} />
              首页
            </Button>
          )}

          {/* 统计按钮 */}
          {testCases.length > 0 && (
            <Button 
              variant={showStats ? 'primary' : 'secondary'} 
              size="md" 
              onClick={onToggleStats}
            >
              <BarChart3 size={18} />
              统计
            </Button>
          )}

          <Button variant="primary" size="md" onClick={onImportClick}>
            <Upload size={18} />
            导入文档
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={handleExport}
            disabled={testCases.length === 0}
          >
            <Download size={18} />
            导出数据
          </Button>

          {testCases.length > 0 && (
            <Button variant="ghost" size="md" onClick={handleReset}>
              <Trash2 size={18} />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
