import { useState } from 'react';
import {
  FolderOpen,
  FileText,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Button, Modal } from '../common';

interface PageOverviewProps {
  onPageSelect: (pageId: string) => void;
}

export function PageOverview({ onPageSelect }: PageOverviewProps) {
  const { pages, testCases, deletePage } = useAppStore();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // 获取每个页面的统计数据
  const getPageStats = (pageId: string) => {
    const pageCases = testCases.filter((tc) => tc.pageId === pageId);
    return {
      total: pageCases.length,
      passed: pageCases.filter((tc) => tc.status === 'passed').length,
      failed: pageCases.filter((tc) => tc.status === 'failed').length,
      pending: pageCases.filter((tc) => tc.status === 'pending').length,
    };
  };

  // 计算通过率
  const getPassRate = (pageId: string) => {
    const stats = getPageStats(pageId);
    if (stats.total === 0) return 0;
    return Math.round((stats.passed / stats.total) * 100);
  };

  // 处理删除确认
  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      deletePage(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  // 获取要删除页面的信息
  const pageToDelete = pages.find((p) => p.id === deleteConfirmId);
  const deletePageStats = deleteConfirmId ? getPageStats(deleteConfirmId) : null;

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FolderOpen size={28} className="text-blue-500" />
            测试页面总览
          </h2>
          <p className="text-gray-500 mt-1">
            管理所有测试用例页面，点击页面卡片进入查看详细用例
          </p>
        </div>

        {/* 页面卡片网格 */}
        {pages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pages.map((page) => {
              const stats = getPageStats(page.id);
              const passRate = getPassRate(page.id);

              return (
                <div
                  key={page.id}
                  className="relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                >
                  {/* 卡片头部 - 进度条 */}
                  <div className="h-1.5 bg-gray-100 flex">
                    {stats.total > 0 && (
                      <>
                        <div
                          className="bg-green-500 transition-all"
                          style={{ width: `${(stats.passed / stats.total) * 100}%` }}
                        />
                        <div
                          className="bg-red-500 transition-all"
                          style={{ width: `${(stats.failed / stats.total) * 100}%` }}
                        />
                      </>
                    )}
                  </div>

                  {/* 菜单按钮 */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === page.id ? null : page.id);
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {/* 下拉菜单 */}
                    {menuOpenId === page.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setMenuOpenId(null)}
                        />
                        <div className="absolute right-0 top-8 z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(page.id);
                              setMenuOpenId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 size={16} />
                            删除页面
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* 卡片内容 - 可点击区域 */}
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => onPageSelect(page.id)}
                  >
                    {/* 页面名称 */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <FileText size={20} className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {page.displayName}
                        </h3>
                        <p className="text-xs text-gray-400 truncate">{page.name}</p>
                      </div>
                    </div>

                    {/* 统计数据 */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-gray-700">{stats.total}</p>
                        <p className="text-xs text-gray-500">总计</p>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded-lg">
                        <p className="text-lg font-bold text-green-600">{stats.passed}</p>
                        <p className="text-xs text-green-600">通过</p>
                      </div>
                      <div className="text-center p-2 bg-red-50 rounded-lg">
                        <p className="text-lg font-bold text-red-600">{stats.failed}</p>
                        <p className="text-xs text-red-600">问题</p>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded-lg">
                        <p className="text-lg font-bold text-blue-600">{stats.pending}</p>
                        <p className="text-xs text-blue-600">待测</p>
                      </div>
                    </div>

                    {/* 通过率 */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">通过率</span>
                      <span
                        className={`text-sm font-semibold ${
                          passRate >= 80
                            ? 'text-green-600'
                            : passRate >= 50
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {passRate}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <FolderOpen size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500">暂无测试页面，请先导入测试文档</p>
          </div>
        )}
      </div>

      {/* 删除确认弹窗 */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="确认删除页面"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>
              取消
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
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
                删除后，该页面及其所有测试用例数据将被永久删除。
              </p>
            </div>
          </div>

          {pageToDelete && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-800">{pageToDelete.displayName}</p>
              <p className="text-sm text-gray-500 mt-1">
                包含 {deletePageStats?.total || 0} 个测试用例
              </p>
              {deletePageStats && deletePageStats.total > 0 && (
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle size={14} />
                    {deletePageStats.passed} 通过
                  </span>
                  <span className="flex items-center gap-1 text-red-600">
                    <XCircle size={14} />
                    {deletePageStats.failed} 问题
                  </span>
                  <span className="flex items-center gap-1 text-blue-600">
                    <Clock size={14} />
                    {deletePageStats.pending} 待测
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
