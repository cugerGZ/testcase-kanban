import { FileText, Search, BarChart3, Clock, XCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Select, Button } from '../common';
import { useAppStore } from '../../store/useAppStore';

interface PageSelectorProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function PageSelector({ searchQuery, onSearchChange }: PageSelectorProps) {
  const navigate = useNavigate();
  const { pages, currentPageId, setCurrentPage, getStatistics, getColumnVisibility, setColumnVisibility } = useAppStore();

  const stats = getStatistics(currentPageId || undefined);
  const columnVisibility = currentPageId ? getColumnVisibility(currentPageId) : null;

  const pageOptions = pages.map((page) => ({
    value: page.id,
    label: `${page.displayName} (${page.name})`,
  }));

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center gap-4">
        {/* Page Selector */}
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-600">页面:</span>
          {pages.length > 0 ? (
            <Select
              value={currentPageId || ''}
              onChange={(pageId) => {
                setCurrentPage(pageId || null);
                const targetPage = pages.find((page) => page.id === pageId);
                if (targetPage?.name) {
                  navigate(`/${targetPage.name}`);
                }
              }}
              options={pageOptions}
              placeholder="选择页面"
              className="w-64"
            />
          ) : (
            <span className="text-sm text-gray-400">暂无页面，请先导入文档</span>
          )}
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="搜索用例编号或标题..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Statistics */}
        {currentPageId && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <BarChart3 size={16} className="text-gray-400" />
              <span className="text-gray-600">统计:</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                待测试 {stats.pending}
              </span>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                有问题 {stats.failed}
              </span>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                已通过 {stats.passed}
              </span>
              <span className="text-gray-500">
                共 {stats.total} 个
              </span>
            </div>
          </div>
        )}

        {/* Column Visibility Toggles */}
        {currentPageId && columnVisibility && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">看板显示:</span>
            <Button
              variant={columnVisibility.pending ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setColumnVisibility(currentPageId, { pending: !columnVisibility.pending })}
            >
              <Clock size={14} />
              待测试
            </Button>
            <Button
              variant={columnVisibility.failed ? 'danger' : 'secondary'}
              size="sm"
              onClick={() => setColumnVisibility(currentPageId, { failed: !columnVisibility.failed })}
            >
              <XCircle size={14} />
              有问题
            </Button>
            <Button
              variant={columnVisibility.passed ? 'success' : 'secondary'}
              size="sm"
              onClick={() => setColumnVisibility(currentPageId, { passed: !columnVisibility.passed })}
            >
              <CheckCircle size={14} />
              已通过
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
