import { useState, useMemo } from 'react';
import type { TestCase, Category } from '../../types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  testCases: TestCase[];
  categories: Category[];
  searchQuery: string;
  onCardClick: (testCase: TestCase) => void;
  onDeleteCase: (id: string) => void;
}

export function KanbanBoard({
  testCases,
  categories,
  searchQuery,
  onCardClick,
  onDeleteCase,
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

  return (
    <div className="flex-1 p-4 overflow-hidden">
      <div className="grid grid-cols-3 gap-4 h-full">
        <KanbanColumn
          status="pending"
          testCases={pendingCases}
          categories={categories}
          onCardClick={onCardClick}
          onDeleteCase={onDeleteCase}
          allExpanded={allExpanded}
          onToggleAll={handleToggleAll}
        />

        <KanbanColumn
          status="failed"
          testCases={failedCases}
          categories={categories}
          onCardClick={onCardClick}
          onDeleteCase={onDeleteCase}
          allExpanded={allExpanded}
          onToggleAll={handleToggleAll}
        />

        <KanbanColumn
          status="passed"
          testCases={passedCases}
          categories={categories}
          onCardClick={onCardClick}
          onDeleteCase={onDeleteCase}
          allExpanded={allExpanded}
          onToggleAll={handleToggleAll}
        />
      </div>
    </div>
  );
}
