import { useMemo } from 'react';
import { 
  BarChart3, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  TrendingUp
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface PageStats {
  pageId: string;
  pageName: string;
  displayName: string;
  total: number;
  pending: number;
  passed: number;
  failed: number;
  passRate: number;
  completionRate: number;
}

export function StatisticsPanel() {
  const { pages, testCases } = useAppStore();

  // 计算每个页面的统计数据
  const pageStats = useMemo<PageStats[]>(() => {
    return pages.map((page) => {
      const pageCases = testCases.filter((tc) => tc.pageId === page.id);
      const total = pageCases.length;
      const pending = pageCases.filter((tc) => tc.status === 'pending').length;
      const passed = pageCases.filter((tc) => tc.status === 'passed').length;
      const failed = pageCases.filter((tc) => tc.status === 'failed').length;
      
      const tested = passed + failed;
      const passRate = tested > 0 ? (passed / tested) * 100 : 0;
      const completionRate = total > 0 ? (tested / total) * 100 : 0;

      return {
        pageId: page.id,
        pageName: page.name,
        displayName: page.displayName,
        total,
        pending,
        passed,
        failed,
        passRate,
        completionRate,
      };
    }).sort((a, b) => b.total - a.total); // 按用例数量排序
  }, [pages, testCases]);

  // 总体统计
  const totalStats = useMemo(() => {
    const total = testCases.length;
    const pending = testCases.filter((tc) => tc.status === 'pending').length;
    const passed = testCases.filter((tc) => tc.status === 'passed').length;
    const failed = testCases.filter((tc) => tc.status === 'failed').length;
    
    const tested = passed + failed;
    const passRate = tested > 0 ? (passed / tested) * 100 : 0;
    const completionRate = total > 0 ? (tested / total) * 100 : 0;

    return { total, pending, passed, failed, passRate, completionRate };
  }, [testCases]);

  if (pages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
          <p>暂无数据，请先导入测试用例</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* 总体统计卡片 */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-500" />
          总体进度
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* 总用例数 */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText size={20} className="text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">总用例</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{totalStats.total}</p>
          </div>

          {/* 待测试 */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock size={20} className="text-amber-600" />
              </div>
              <span className="text-sm text-gray-500">待测试</span>
            </div>
            <p className="text-3xl font-bold text-amber-600">{totalStats.pending}</p>
          </div>

          {/* 已通过 */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <span className="text-sm text-gray-500">已通过</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{totalStats.passed}</p>
          </div>

          {/* 有问题 */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle size={20} className="text-red-600" />
              </div>
              <span className="text-sm text-gray-500">有问题</span>
            </div>
            <p className="text-3xl font-bold text-red-600">{totalStats.failed}</p>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mt-4 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">测试进度</span>
            <span className="text-sm font-medium text-gray-700">
              {totalStats.completionRate.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full flex">
              <div 
                className="bg-green-500 transition-all duration-500"
                style={{ width: `${(totalStats.passed / totalStats.total) * 100}%` }}
              />
              <div 
                className="bg-red-500 transition-all duration-500"
                style={{ width: `${(totalStats.failed / totalStats.total) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 mt-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              通过 {totalStats.passed}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              失败 {totalStats.failed}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-gray-300" />
              待测 {totalStats.pending}
            </span>
          </div>
        </div>
      </div>

      {/* 各页面统计表格 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-purple-500" />
          各组件详情
        </h2>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">组件/页面</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600 w-20">总数</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600 w-20">待测</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600 w-20">通过</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600 w-20">失败</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600 w-32">完成度</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600 w-32">通过率</th>
              </tr>
            </thead>
            <tbody>
              {pageStats.map((stat, index) => (
                <tr 
                  key={stat.pageId}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-800">{stat.displayName}</p>
                      <p className="text-xs text-gray-400">{stat.pageName}</p>
                    </div>
                  </td>
                  <td className="text-center px-4 py-3">
                    <span className="font-semibold text-gray-700">{stat.total}</span>
                  </td>
                  <td className="text-center px-4 py-3">
                    <span className={`font-medium ${stat.pending > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                      {stat.pending}
                    </span>
                  </td>
                  <td className="text-center px-4 py-3">
                    <span className={`font-medium ${stat.passed > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      {stat.passed}
                    </span>
                  </td>
                  <td className="text-center px-4 py-3">
                    <span className={`font-medium ${stat.failed > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                      {stat.failed}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${stat.completionRate}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-500 w-10 text-right">
                        {stat.completionRate.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      {stat.passed + stat.failed > 0 ? (
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${stat.passRate >= 80 ? 'bg-green-100 text-green-700' : 
                            stat.passRate >= 50 ? 'bg-amber-100 text-amber-700' : 
                            'bg-red-100 text-red-700'}
                        `}>
                          {stat.passRate.toFixed(0)}%
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
