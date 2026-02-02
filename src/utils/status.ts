import { nanoid } from './helpers';

/**
 * 生成唯一 ID
 */
export { nanoid as generateId };

/**
 * 获取状态中文名
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: '待测试',
    failed: '有问题',
    passed: '已通过',
  };
  return labels[status] || status;
}

/**
 * 获取状态图标
 */
export function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    pending: '⏳',
    failed: '❌',
    passed: '✅',
  };
  return icons[status] || '❓';
}

/**
 * 获取优先级说明
 */
export function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    P0: '核心功能',
    P1: '重要功能',
    P2: '次要功能',
  };
  return labels[priority] || priority;
}

/**
 * 获取优先级颜色类名
 */
export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    P0: 'bg-red-100 text-red-700 border-red-200',
    P1: 'bg-amber-100 text-amber-700 border-amber-200',
    P2: 'bg-green-100 text-green-700 border-green-200',
  };
  return colors[priority] || 'bg-gray-100 text-gray-700';
}

/**
 * 格式化日期
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 格式化简短日期
 */
export function formatShortDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
  });
}
