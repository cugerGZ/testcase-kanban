import { useState, useMemo } from 'react';
import type { TestCase, Category, ColumnVisibility, TestStatus } from '../../types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  testCases: TestCase[];
  categories: Category[];
  searchQuery: string;
  onCardClick: (testCase: TestCase) => void;
  onDeleteCase: (id: string) => void;
  columnVisibility: ColumnVisibility;
}

export function KanbanBoard({
  testCases,
  categories,
  searchQuery,
  onCardClick,
  onDeleteCase,
  columnVisibility,
}: KanbanBoardProps) {
  const [allExpanded, setAllExpanded] = useState(true);

  // 过滤搜索
  const filteredCases = useMemo(() => {
    if (!searchQuery.trim()) return testCases;

    const query = searchQuery.toLowerCase();
    return testCases.filter(
      (tc) =>
        tc.code.toLowerCase().includes(query) ||
        tc.title.toLowerCase().includes(query)
    );
  }, [testCases, searchQuery]);

  // 按状态分组
  const pendingCases = useMemo(
    () => filteredCases.filter((tc) => tc.status === 'pending'),
    [filteredCases]
  );

  const failedCases = useMemo(
    () => filteredCases.filter((tc) => tc.status === 'failed'),
    [filteredCases]
  );

  const passedCases = useMemo(
    () => filteredCases.filter((tc) => tc.status === 'passed'),
    [filteredCases]
  );

  const handleToggleAll = () => {
    setAllExpanded(!allExpanded);
  };

  const visibleStatuses = useMemo(() => {
    const statuses: TestStatus[] = [];
    if (columnVisibility.pending) statuses.push('pending');
    if (columnVisibility.failed) statuses.push('failed');
    if (columnVisibility.passed) statuses.push('passed');
    return statuses;
  }, [columnVisibility]);

  const gridColsClass = visibleStatuses.length === 1
    ? 'grid-cols-1'
    : visibleStatuses.length === 2
    ? 'grid-cols-2'
    : 'grid-cols-3';

  return (
    <div className="flex-1 p-4 overflow-hidden">
      {visibleStatuses.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-gray-500">
          已隐藏全部看板列，请在标头中重新开启
        </div>
      ) : (
        <div className={`grid ${gridColsClass} gap-4 h-full`}>
          {visibleStatuses.includes('pending') && (
            <KanbanColumn
              status="pending"
              testCases={pendingCases}
              categories={categories}
              onCardClick={onCardClick}
              onDeleteCase={onDeleteCase}
              allExpanded={allExpanded}
              onToggleAll={handleToggleAll}
            />
          )}

          {visibleStatuses.includes('failed') && (
            <KanbanColumn
              status="failed"
              testCases={failedCases}
              categories={categories}
              onCardClick={onCardClick}
              onDeleteCase={onDeleteCase}
              allExpanded={allExpanded}
              onToggleAll={handleToggleAll}
            />
          )}

          {visibleStatuses.includes('passed') && (
            <KanbanColumn
              status="passed"
              testCases={passedCases}
              categories={categories}
              onCardClick={onCardClick}
              onDeleteCase={onDeleteCase}
              allExpanded={allExpanded}
              onToggleAll={handleToggleAll}
            />
          )}
        </div>
      )}
    </div>
  );
}
