import { memo, useState } from 'react';
import type { TestCase } from '../../types';
import { getPriorityColor } from '../../utils/status';
import { MessageSquare, Trash2 } from 'lucide-react';

interface TestCaseCardProps {
  testCase: TestCase;
  onClick: () => void;
  onDelete: () => void;
}

export const TestCaseCard = memo(function TestCaseCard({
  testCase,
  onClick,
  onDelete,
}: TestCaseCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
    setShowConfirm(false);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(false);
  };

  return (
    <div
      className="
        group relative p-3 bg-white border border-gray-200 rounded-lg
        hover:shadow-md hover:border-blue-300
        cursor-pointer transition-all duration-200
        active:scale-[0.98]
      "
      onClick={onClick}
    >
      {/* 删除确认弹层 */}
      {showConfirm && (
        <div 
          className="absolute inset-0 bg-white/95 rounded-lg flex flex-col items-center justify-center z-10 border-2 border-red-200"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-sm text-gray-600 mb-3">确认删除此用例？</p>
          <div className="flex gap-2">
            <button
              onClick={handleCancelDelete}
              className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-3 py-1.5 text-xs bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
            >
              删除
            </button>
          </div>
        </div>
      )}

      {/* 删除按钮 */}
      <button
        onClick={handleDeleteClick}
        className="
          absolute top-2 right-2 p-1 rounded
          opacity-0 group-hover:opacity-100
          text-gray-400 hover:text-red-500 hover:bg-red-50
          transition-all duration-200
        "
        title="删除此用例"
      >
        <Trash2 size={14} />
      </button>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
          {testCase.code}
        </span>
        <span className={`text-xs font-medium px-1.5 py-0.5 rounded border ${getPriorityColor(testCase.priority)}`}>
          {testCase.priority}
        </span>
      </div>

      {/* Title */}
      <h4 className="text-sm text-gray-700 line-clamp-2 mb-2 group-hover:text-gray-900">
        {testCase.title}
      </h4>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{testCase.steps.length} 步骤</span>
        {testCase.notes && (
          <span className="flex items-center gap-1 text-amber-500">
            <MessageSquare size={12} />
            有备注
          </span>
        )}
      </div>
    </div>
  );
});
