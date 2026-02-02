import { useState } from 'react';
import {
  Clock,
  XCircle,
  CheckCircle,
  RotateCcw,
  Tag,
  ListOrdered,
  CheckSquare,
  Database,
  FileText,
  MessageSquare,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Modal, Button } from '../common';
import type { TestCase, Category, TestStatus } from '../../types';
import { getPriorityLabel, getPriorityColor, getStatusLabel, formatDate } from '../../utils/status';

interface TestCaseDetailProps {
  testCase: TestCase | null;
  category?: Category;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: TestStatus, notes?: string) => void;
  onDelete?: (id: string) => void;
}

export function TestCaseDetail({
  testCase,
  category,
  isOpen,
  onClose,
  onStatusChange,
  onDelete,
}: TestCaseDetailProps) {
  const [notes, setNotes] = useState('');
  const [lastTestCaseId, setLastTestCaseId] = useState<string | undefined>(undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 当 testCase 改变时重置 notes
  const currentTestCaseId = testCase?.id;
  if (currentTestCaseId !== lastTestCaseId) {
    setLastTestCaseId(currentTestCaseId);
    setNotes(testCase?.notes || '');
  }

  if (!testCase) return null;

  const handleStatusChange = (status: TestStatus) => {
    onStatusChange(testCase.id, status, notes);
    if (status !== 'pending') {
      onClose();
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(testCase.id);
      setShowDeleteConfirm(false);
    }
  };

  const statusConfig = {
    pending: { color: 'text-blue-600', bg: 'bg-blue-100', icon: <Clock size={16} /> },
    failed: { color: 'text-red-600', bg: 'bg-red-100', icon: <XCircle size={16} /> },
    passed: { color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle size={16} /> },
  };

  const currentStatus = statusConfig[testCase.status];

  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${testCase.code}: ${testCase.title}`}
      size="lg"
      footer={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onDelete && (
              <Button
                variant="ghost"
                size="md"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 size={18} />
                删除用例
              </Button>
            )}
            {testCase.testedAt && (
              <span className="text-xs text-gray-500">
                最后测试: {formatDate(testCase.testedAt)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="md"
              onClick={() => handleStatusChange('failed')}
            >
              <XCircle size={18} />
              标记有问题
            </Button>
            <Button
              variant="success"
              size="md"
              onClick={() => handleStatusChange('passed')}
            >
              <CheckCircle size={18} />
              标记通过
            </Button>
            {testCase.status !== 'pending' && (
              <Button
                variant="secondary"
                size="md"
                onClick={() => handleStatusChange('pending')}
              >
                <RotateCcw size={18} />
                重置为待测
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* 基本信息 */}
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Tag size={16} className="text-gray-400" />
            基本信息
          </h3>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
            <div>
              <span className="text-xs text-gray-500">编号</span>
              <p className="font-mono text-sm font-semibold text-blue-600">{testCase.code}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">优先级</span>
              <p>
                <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded border ${getPriorityColor(testCase.priority)}`}>
                  {testCase.priority} - {getPriorityLabel(testCase.priority)}
                </span>
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-500">分类</span>
              <p className="text-sm text-gray-700">{category?.fullPath || '未分类'}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">当前状态</span>
              <p>
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${currentStatus.bg} ${currentStatus.color}`}>
                  {currentStatus.icon}
                  {getStatusLabel(testCase.status)}
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* 前置条件 */}
        {testCase.preconditions && (
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <FileText size={16} className="text-gray-400" />
              前置条件
            </h3>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">{testCase.preconditions}</p>
            </div>
          </section>
        )}

        {/* 测试步骤 */}
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <ListOrdered size={16} className="text-gray-400" />
            测试步骤
          </h3>
          <ol className="space-y-2">
            {testCase.steps.map((step, index) => (
              <li
                key={index}
                className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg p-3"
              >
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                  {index + 1}
                </span>
                <span className="text-sm text-gray-700 pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* 预期结果 */}
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <CheckSquare size={16} className="text-gray-400" />
            预期结果
          </h3>
          <ul className="space-y-2">
            {testCase.expectedResults.map((result, index) => (
              <li
                key={index}
                className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-3"
              >
                <CheckCircle size={18} className="flex-shrink-0 text-green-500 mt-0.5" />
                <span className="text-sm text-green-800">{result}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 测试数据 */}
        {testCase.testData && (
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Database size={16} className="text-gray-400" />
              测试数据
            </h3>
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 font-mono">{testCase.testData}</p>
            </div>
          </section>
        )}

        {/* 测试备注 */}
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <MessageSquare size={16} className="text-gray-400" />
            测试备注
          </h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="记录测试过程中的问题、发现或备注..."
            className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </section>
      </div>
    </Modal>

    {/* 删除确认弹窗 */}
    <Modal
      isOpen={showDeleteConfirm}
      onClose={() => setShowDeleteConfirm(false)}
      title="确认删除测试用例"
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            取消
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 size={16} />
            确认删除
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
          <AlertTriangle size={24} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800">此操作不可撤销！</p>
            <p className="text-sm text-red-600 mt-1">
              删除后，该测试用例将被永久删除。
            </p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="font-mono text-sm text-blue-600">{testCase.code}</p>
          <p className="font-medium text-gray-800 mt-1">{testCase.title}</p>
        </div>
      </div>
    </Modal>
    </>
  );
}
