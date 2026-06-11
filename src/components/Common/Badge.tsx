import React from 'react';
import type { StrategyStatus, StrategyType } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: StrategyStatus }> = ({ status }) => {
  const statusConfig: Record<StrategyStatus, { label: string; variant: BadgeProps['variant'] }> = {
    draft: { label: '草稿', variant: 'default' },
    pending: { label: '待审批', variant: 'warning' },
    approved: { label: '已审批', variant: 'info' },
    pending_launch: { label: '待上线', variant: 'info' },
    active: { label: '已上线', variant: 'success' },
    paused: { label: '已暂停', variant: 'error' },
    disabled: { label: '已下线', variant: 'default' },
  };

  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const TypeBadge: React.FC<{ type: StrategyType }> = ({ type }) => {
  const typeConfig: Record<StrategyType, { label: string; variant: BadgeProps['variant'] }> = {
    discount: { label: '折扣', variant: 'success' },
    reminder: { label: '提醒', variant: 'info' },
    dispatch: { label: '派单', variant: 'warning' },
    admission: { label: '准入', variant: 'default' },
    points: { label: '积分', variant: 'purple' },
    gift: { label: '赠品', variant: 'warning' },
  };

  const config = typeConfig[type];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};
