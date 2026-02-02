import { useState, useMemo, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Upload, FileText } from 'lucide-react';
import { useAppStore } from './store/useAppStore';
import { Header, PageSelector } from './components/layout';
import { KanbanBoard } from './components/board';
import { TestCaseDetail } from './components/detail';
import { ImportModal } from './components/import';
import { StatisticsPanel } from './components/statistics';
import { PageOverview } from './components/home';
import { Button } from './components/common';
import type { TestCase } from './types';
import './App.css';

// 首页组件
function HomePage() {
  const { pages } = useAppStore();
  const navigate = useNavigate();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handlePageSelect = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (page) {
      navigate(`/${page.name}`);
    }
  };

  return (
    <>
      {pages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
              <FileText size={40} className="text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              欢迎使用测试用例看板
            </h2>
            <p className="text-gray-500 mb-6">
              导入 Markdown 格式的测试用例文档，开始管理和追踪您的测试进度
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsImportModalOpen(true)}
            >
              <Upload size={20} />
              导入测试文档
            </Button>
          </div>
        </div>
      ) : (
        <PageOverview onPageSelect={handlePageSelect} />
      )}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </>
  );
}

// 页面看板组件
function PageBoard() {
  const { pageName } = useParams<{ pageName: string }>();
  const navigate = useNavigate();
  const {
    pages,
    categories,
    testCases,
    setCurrentPage,
    updateTestCaseStatus,
    deleteTestCase,
    getColumnVisibility,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 根据路由参数找到对应页面
  const currentPage = useMemo(() => {
    return pages.find(p => p.name === pageName);
  }, [pages, pageName]);

  // 设置当前页面
  useEffect(() => {
    if (currentPage) {
      setCurrentPage(currentPage.id);
    }
  }, [currentPage, setCurrentPage]);

  // 如果页面不存在，重定向到首页
  useEffect(() => {
    if (pageName && pages.length > 0 && !currentPage) {
      navigate('/');
    }
  }, [pageName, pages, currentPage, navigate]);

  // 获取当前页面的测试用例
  const currentTestCases = useMemo(() => {
    if (!currentPage) return [];
    return testCases.filter(tc => tc.pageId === currentPage.id);
  }, [testCases, currentPage]);

  // 获取当前页面的分类
  const currentCategories = useMemo(() => {
    if (!currentPage) return [];
    return categories.filter(cat => cat.pageId === currentPage.id);
  }, [categories, currentPage]);

  const columnVisibility = useMemo(() => {
    if (!currentPage) return null;
    return getColumnVisibility(currentPage.id);
  }, [currentPage, getColumnVisibility]);

  // 获取选中用例的分类
  const selectedCategory = useMemo(() => {
    if (!selectedTestCase) return undefined;
    return categories.find(cat => cat.id === selectedTestCase.categoryId);
  }, [selectedTestCase, categories]);

  // 处理卡片点击
  const handleCardClick = (testCase: TestCase) => {
    setSelectedTestCase(testCase);
    setIsDetailOpen(true);
    // 更新 URL
    navigate(`/${pageName}/${testCase.code}`, { replace: true });
  };

  // 处理状态更新
  const handleStatusChange = (id: string, status: TestCase['status'], notes?: string) => {
    updateTestCaseStatus(id, status, notes);
    const updated = testCases.find(tc => tc.id === id);
    if (updated) {
      setSelectedTestCase({ ...updated, status, notes: notes ?? updated.notes });
    }
  };

  // 处理删除用例
  const handleDeleteTestCase = (id: string) => {
    deleteTestCase(id);
    setIsDetailOpen(false);
    setSelectedTestCase(null);
    navigate(`/${pageName}`, { replace: true });
  };

  // 关闭详情
  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedTestCase(null);
    navigate(`/${pageName}`, { replace: true });
  };

  if (!currentPage) {
    return null;
  }

  return (
    <>
      <PageSelector
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <KanbanBoard
        testCases={currentTestCases}
        categories={currentCategories}
        searchQuery={searchQuery}
        onCardClick={handleCardClick}
        onDeleteCase={deleteTestCase}
        columnVisibility={columnVisibility || { pending: true, failed: true, passed: true }}
      />
      <TestCaseDetail
        testCase={selectedTestCase}
        category={selectedCategory}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteTestCase}
      />
    </>
  );
}

// 用例详情路由组件（从 URL 直接打开特定用例）
function TestCaseRoute() {
  const { pageName, caseCode } = useParams<{ pageName: string; caseCode: string }>();
  const navigate = useNavigate();
  const {
    pages,
    categories,
    testCases,
    setCurrentPage,
    updateTestCaseStatus,
    deleteTestCase,
    getColumnVisibility,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');

  // 根据路由参数找到对应页面
  const currentPage = useMemo(() => {
    return pages.find(p => p.name === pageName);
  }, [pages, pageName]);

  // 根据路由参数找到对应用例
  const targetTestCase = useMemo(() => {
    if (!currentPage || !caseCode) return null;
    return testCases.find(tc => tc.pageId === currentPage.id && tc.code === caseCode);
  }, [currentPage, caseCode, testCases]);

  // 设置当前页面
  useEffect(() => {
    if (currentPage) {
      setCurrentPage(currentPage.id);
    }
  }, [currentPage, setCurrentPage]);

  // 如果页面或用例不存在，重定向
  useEffect(() => {
    if (pages.length > 0) {
      if (!currentPage) {
        navigate('/');
      } else if (caseCode && !targetTestCase) {
        navigate(`/${pageName}`);
      }
    }
  }, [pages, currentPage, caseCode, targetTestCase, navigate, pageName]);

  // 获取当前页面的测试用例
  const currentTestCases = useMemo(() => {
    if (!currentPage) return [];
    return testCases.filter(tc => tc.pageId === currentPage.id);
  }, [testCases, currentPage]);

  // 获取当前页面的分类
  const currentCategories = useMemo(() => {
    if (!currentPage) return [];
    return categories.filter(cat => cat.pageId === currentPage.id);
  }, [categories, currentPage]);

  const columnVisibility = useMemo(() => {
    if (!currentPage) return null;
    return getColumnVisibility(currentPage.id);
  }, [currentPage, getColumnVisibility]);

  // 获取选中用例的分类
  const selectedCategory = useMemo(() => {
    if (!targetTestCase) return undefined;
    return categories.find(cat => cat.id === targetTestCase.categoryId);
  }, [targetTestCase, categories]);

  // 处理卡片点击
  const handleCardClick = (testCase: TestCase) => {
    navigate(`/${pageName}/${testCase.code}`);
  };

  // 处理状态更新
  const handleStatusChange = (id: string, status: TestCase['status'], notes?: string) => {
    updateTestCaseStatus(id, status, notes);
  };

  // 处理删除用例
  const handleDeleteTestCase = (id: string) => {
    deleteTestCase(id);
    navigate(`/${pageName}`, { replace: true });
  };

  // 关闭详情
  const handleCloseDetail = () => {
    navigate(`/${pageName}`);
  };

  if (!currentPage) {
    return null;
  }

  return (
    <>
      <PageSelector
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <KanbanBoard
        testCases={currentTestCases}
        categories={currentCategories}
        searchQuery={searchQuery}
        onCardClick={handleCardClick}
        onDeleteCase={deleteTestCase}
        columnVisibility={columnVisibility || { pending: true, failed: true, passed: true }}
      />
      <TestCaseDetail
        testCase={targetTestCase}
        category={selectedCategory}
        isOpen={!!targetTestCase}
        onClose={handleCloseDetail}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteTestCase}
      />
    </>
  );
}

// 统计面板路由组件
function StatsRoute() {
  return <StatisticsPanel />;
}

function App() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // 判断当前是否在首页
  const isHomePage = location.pathname === '/';
  // 判断当前是否在统计页
  const isStatsPage = location.pathname === '/stats';

  const handleGoHome = () => {
    navigate('/');
  };

  const handleToggleStats = () => {
    if (isStatsPage) {
      navigate('/');
    } else {
      navigate('/stats');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <Header 
        onImportClick={() => setIsImportModalOpen(true)} 
        showStats={isStatsPage}
        onToggleStats={handleToggleStats}
        showHomeButton={!isHomePage}
        onHomeClick={handleGoHome}
      />

      {/* Routes */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/stats" element={<StatsRoute />} />
        <Route path="/:pageName" element={<PageBoard />} />
        <Route path="/:pageName/:caseCode" element={<TestCaseRoute />} />
      </Routes>

      {/* Global Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
}

export default App;
