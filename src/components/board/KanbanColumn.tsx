import { useMemo } from 'react';
import { Clock, XCircle, CheckCircle, FoldVertical, UnfoldVertical } from 'lucide-react';
import type { TestCase, TestStatus, Category } from '../../types';
import { CategoryGroup } from './CategoryGroup';

interface KanbanColumnProps {
  status: TestStatus;
  testCases: TestCase[];
  categories: Category[];
  onCardClick: (testCase: TestCase) => void;
  onDeleteCase: (id: string) => void;
  allExpanded: boolean;
  onToggleAll: () => void;
}

const statusConfig: Record<TestStatus, {
  title: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  iconBg: string;
}> = {
  pending: {
    title: '待测试',
    icon: <Clock size={20} />,
    bgColor: 'bg-blue-50',
    borderColor: 'border-t-blue-500',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  failed: {
    title: '有问题',
    icon: <XCircle size={20} />,
    bgColor: 'bg-red-50',
    borderColor: 'border-t-red-500',
    iconBg: 'bg-red-100 text-red-600',
  },
  passed: {
    title: '已通过',
    icon: <CheckCircle size={20} />,
    bgColor: 'bg-green-50',
    borderColor: 'border-t-green-500',
    iconBg: 'bg-green-100 text-green-600',
  },
};

export function KanbanColumn({
  status,
  testCases,
  categories,
  onCardClick,
  onDeleteCase,
  allExpanded,
  onToggleAll,
}: KanbanColumnProps) {
  const config = statusConfig[status];

  // 按分类分组
  const groupedByCategory = useMemo(() => {
    const groups = new Map<string, { category: Category | null; cases: TestCase[] }>();

    for (const tc of testCases) {
      const category = categories.find((c) => c.id === tc.categoryId);
      const key = category?.id || 'uncategorized';

      if (!groups.has(key)) {
        groups.set(key, { category: category || null, cases: [] });
      }
      groups.get(key)!.cases.push(tc);
    }

    // 排序：按分类顺序
    return Array.from(groups.entries()).sort((a, b) => {
      const orderA = a[1].category?.order ?? 999;
      const orderB = b[1].category?.order ?? 999;
      return orderA - orderB;
    });
  }, [testCases, categories]);

  return (
    <div className={`flex flex-col min-h-0 ${config.bgColor} rounded-xl border-t-4 ${config.borderColor}`}>
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/50">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${config.iconBg}`}>
            {config.icon}
          </div>
          <span className="font-semibold text-gray-800">{config.title}</span>
          <span className="text-sm text-gray-500 bg-white/80 px-2 py-0.5 rounded-full">
            {testCases.length}
          </span>
        </div>

        {/* Toggle All Button */}
        <button
          onClick={onToggleAll}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-colors"
          title={allExpanded ? '全部折叠' : '全部展开'}
        >
          {allExpanded ? <FoldVertical size={18} /> : <UnfoldVertical size={18} />}
        </button>
      </div>

      {/* Column Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {testCases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <div className={`p-3 rounded-full ${config.iconBg} opacity-50 mb-3`}>
              {config.icon}
            </div>
            <p className="text-sm">暂无用例</p>
          </div>
        ) : (
          groupedByCategory.map(([key, { category, cases }]) => (
            <CategoryGroup
              key={key}
              name={category?.fullPath || '未分类'}
              testCases={cases}
              onCardClick={onCardClick}
              onDeleteCase={onDeleteCase}
              defaultExpanded={allExpanded}
            />
          ))
        )}
      </div>
    </div>
  );
}
