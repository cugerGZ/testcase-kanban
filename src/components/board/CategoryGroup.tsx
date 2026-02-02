import { useState, memo, useEffect } from 'react';
import { ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react';
import type { TestCase } from '../../types';
import { TestCaseCard } from './TestCaseCard';

interface CategoryGroupProps {
  name: string;
  testCases: TestCase[];
  onCardClick: (testCase: TestCase) => void;
  onDeleteCase: (id: string) => void;
  defaultExpanded?: boolean;
}

export const CategoryGroup = memo(function CategoryGroup({
  name,
  testCases,
  onCardClick,
  onDeleteCase,
  defaultExpanded = true,
}: CategoryGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // 响应父组件的 allExpanded 变化
  useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);

  return (
    <div className="mb-3">
      {/* Header */}
      <div
        className="
          flex items-center gap-2 px-2 py-2
          bg-gray-50 hover:bg-gray-100
          rounded-lg cursor-pointer
          transition-colors select-none
        "
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Expand Icon */}
        {isExpanded ? (
          <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
        )}

        {/* Folder Icon */}
        {isExpanded ? (
          <FolderOpen size={16} className="text-amber-500 flex-shrink-0" />
        ) : (
          <Folder size={16} className="text-amber-500 flex-shrink-0" />
        )}

        {/* Category Name */}
        <span className="flex-1 text-sm font-medium text-gray-700 truncate">
          {name}
        </span>

        {/* Count */}
        <span className="text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-full">
          {testCases.length}
        </span>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="mt-2 pl-4 space-y-2">
          {testCases.map((testCase) => (
            <TestCaseCard
              key={testCase.id}
              testCase={testCase}
              onClick={() => onCardClick(testCase)}
              onDelete={() => onDeleteCase(testCase.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
});
