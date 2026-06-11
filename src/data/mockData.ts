import type { Strategy, Template, AuditLog, User, DashboardStats, TodoItem } from '../types';

export const mockUsers: User[] = [
  { id: '1', name: '张运营', role: 'operator', department: '客服运营部' },
  { id: '2', name: '李管理员', role: 'admin', department: '系统管理部' },
  { id: '3', name: '王区域经理', role: 'manager', department: '华东区域' },
];

export const mockStrategies: Strategy[] = [
  {
    id: '1',
    name: '新用户首单8折优惠',
    description: '针对新注册用户提供首单8折优惠，吸引新用户下单',
    type: 'discount',
    priority: 1,
    status: 'active',
    trigger: {
      userTypes: ['new'],
      minAmount: 100,
      maxAmount: 1000,
    },
    action: {
      actionType: 'discount',
      discountType: 'percentage',
      discountValue: 20,
    },
    dimensions: {
      cities: ['北京', '上海', '广州', '深圳'],
      timeSlots: [{ start: '09:00', end: '22:00' }],
      effectiveStart: '2024-01-01',
      effectiveEnd: '2024-12-31',
    },
    creator: '张运营',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-15 10:30:00',
    approver: '李管理员',
    approveTime: '2024-01-15 14:20:00',
    launchTime: '2024-01-16 00:00:00',
    stats: {
      hitCount: 125680,
      hitRate: 85.5,
      conversionRate: 32.8,
      roi: 3.5,
    },
  },
  {
    id: '2',
    name: '会员日双倍积分',
    description: '每周五会员日享受双倍积分奖励',
    type: 'points',
    priority: 2,
    status: 'active',
    trigger: {
      userTypes: ['member'],
      userLevels: ['gold', 'platinum'],
    },
    action: {
      actionType: 'points',
      pointsMultiplier: 2,
    },
    dimensions: {
      cities: ['全国'],
      timeSlots: [{ start: '00:00', end: '23:59', days: ['Friday'] }],
      effectiveStart: '2024-01-01',
      effectiveEnd: '2024-12-31',
    },
    creator: '张运营',
    createTime: '2024-01-10 09:00:00',
    updateTime: '2024-01-10 09:00:00',
    stats: {
      hitCount: 89234,
      hitRate: 92.3,
      conversionRate: 45.2,
      roi: 2.8,
    },
  },
  {
    id: '3',
    name: '节假日订单提醒',
    description: '节假日前一天自动发送订单提醒通知',
    type: 'reminder',
    priority: 3,
    status: 'pending',
    trigger: {
      userTypes: ['all'],
    },
    action: {
      actionType: 'coupon',
    },
    dimensions: {
      cities: ['全国'],
      timeSlots: [{ start: '10:00', end: '18:00' }],
      effectiveStart: '2024-02-01',
    },
    creator: '张运营',
    createTime: '2024-01-18 15:40:00',
    updateTime: '2024-01-18 15:40:00',
  },
  {
    id: '4',
    name: '高价值用户优先派单',
    description: '消费满5000元用户享受优先派单服务',
    type: 'dispatch',
    priority: 1,
    status: 'approved',
    trigger: {
      userTypes: ['all'],
      minAmount: 5000,
      userLevels: ['vip'],
    },
    action: {
      actionType: 'gift',
      giftName: '优先派单服务',
    },
    dimensions: {
      cities: ['北京', '上海'],
      timeSlots: [{ start: '08:00', end: '20:00' }],
      effectiveStart: '2024-02-01',
      effectiveEnd: '2024-05-31',
    },
    creator: '王区域经理',
    createTime: '2024-01-12 11:20:00',
    updateTime: '2024-01-17 09:15:00',
    approver: '李管理员',
    approveTime: '2024-01-17 09:15:00',
  },
  {
    id: '5',
    name: '新人礼包赠送',
    description: '新用户注册即送新人礼包',
    type: 'gift',
    priority: 1,
    status: 'draft',
    trigger: {
      userTypes: ['new'],
    },
    action: {
      actionType: 'gift',
      giftName: '新人礼包',
    },
    dimensions: {
      cities: ['全国'],
      timeSlots: [{ start: '00:00', end: '23:59' }],
      effectiveStart: '2024-03-01',
    },
    creator: '张运营',
    createTime: '2024-01-19 14:00:00',
    updateTime: '2024-01-19 14:00:00',
  },
  {
    id: '6',
    name: 'VIP用户专属折扣',
    description: 'VIP用户享受全场95折优惠',
    type: 'discount',
    priority: 2,
    status: 'paused',
    trigger: {
      userLevels: ['vip'],
    },
    action: {
      actionType: 'discount',
      discountType: 'percentage',
      discountValue: 5,
    },
    dimensions: {
      cities: ['全国'],
      timeSlots: [{ start: '00:00', end: '23:59' }],
      effectiveStart: '2024-01-01',
      effectiveEnd: '2024-06-30',
    },
    creator: '李管理员',
    createTime: '2023-12-20 10:00:00',
    updateTime: '2024-01-10 16:30:00',
    stats: {
      hitCount: 45230,
      hitRate: 78.9,
      conversionRate: 28.5,
      roi: 2.1,
    },
  },
];

export const mockTemplates: Template[] = [
  {
    id: '1',
    name: '折扣促销模板',
    description: '通用的折扣促销策略模板，支持百分比折扣和固定金额折扣',
    type: 'discount',
    usageCount: 45,
    createTime: '2023-06-15',
    defaultTrigger: {
      userTypes: ['all'],
      minAmount: 0,
    },
    defaultAction: {
      actionType: 'discount',
      discountType: 'percentage',
      discountValue: 10,
    },
  },
  {
    id: '2',
    name: '积分奖励模板',
    description: '用于积分奖励活动的模板，支持设置积分倍数',
    type: 'points',
    usageCount: 32,
    createTime: '2023-07-20',
    defaultTrigger: {
      userTypes: ['all'],
    },
    defaultAction: {
      actionType: 'points',
      pointsMultiplier: 1,
    },
  },
  {
    id: '3',
    name: '订单提醒模板',
    description: '用于发送订单相关提醒通知的模板',
    type: 'reminder',
    usageCount: 28,
    createTime: '2023-08-10',
    defaultTrigger: {
      userTypes: ['all'],
    },
    defaultAction: {
      actionType: 'coupon',
    },
  },
  {
    id: '4',
    name: '派单优先级模板',
    description: '用于设置不同用户群体的派单优先级',
    type: 'dispatch',
    usageCount: 18,
    createTime: '2023-09-05',
    defaultTrigger: {
      userTypes: ['all'],
    },
    defaultAction: {
      actionType: 'gift',
      giftName: '标准派单',
    },
  },
  {
    id: '5',
    name: '准入规则模板',
    description: '用于设置服务准入条件的模板',
    type: 'admission',
    usageCount: 15,
    createTime: '2023-10-12',
    defaultTrigger: {
      userLevels: ['standard'],
    },
    defaultAction: {
      actionType: 'gift',
      giftName: '准入服务',
    },
  },
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    strategyId: '1',
    strategyName: '新用户首单8折优惠',
    action: '创建策略',
    operator: '1',
    operatorName: '张运营',
    createTime: '2024-01-15 10:30:00',
    details: '创建了新策略',
  },
  {
    id: '2',
    strategyId: '1',
    strategyName: '新用户首单8折优惠',
    action: '提交审批',
    operator: '1',
    operatorName: '张运营',
    createTime: '2024-01-15 10:35:00',
    details: '提交至李管理员审批',
  },
  {
    id: '3',
    strategyId: '1',
    strategyName: '新用户首单8折优惠',
    action: '审批通过',
    operator: '2',
    operatorName: '李管理员',
    createTime: '2024-01-15 14:20:00',
    details: '审批通过，可安排上线',
  },
  {
    id: '4',
    strategyId: '1',
    strategyName: '新用户首单8折优惠',
    action: '策略上线',
    operator: '2',
    operatorName: '李管理员',
    createTime: '2024-01-16 00:00:00',
    details: '策略正式生效',
  },
  {
    id: '5',
    strategyId: '6',
    strategyName: 'VIP用户专属折扣',
    action: '策略暂停',
    operator: '2',
    operatorName: '李管理员',
    createTime: '2024-01-10 16:30:00',
    details: '因系统升级暂停策略',
  },
];

export const mockDashboardStats: DashboardStats = {
  totalStrategies: 156,
  activeStrategies: 89,
  todayNew: 5,
  totalHits: 125680,
  pendingApprovals: 3,
  pendingLaunch: 2,
  expiringSoon: 5,
};

export const mockTodoItems: TodoItem[] = [
  {
    id: '1',
    type: 'approval',
    title: '待审批: 节假日订单提醒',
    strategyId: '3',
    dueTime: '2024-01-20',
  },
  {
    id: '2',
    type: 'launch',
    title: '待上线: 高价值用户优先派单',
    strategyId: '4',
    dueTime: '2024-02-01',
  },
  {
    id: '3',
    type: 'approval',
    title: '待审批: 新人礼包赠送',
    strategyId: '5',
    dueTime: '2024-01-21',
  },
  {
    id: '4',
    type: 'expiring',
    title: '即将过期: VIP用户专属折扣',
    strategyId: '6',
    dueTime: '2024-01-25',
  },
];

export const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安', '南京', '重庆'];
export const userTypes = ['new', 'regular', 'member', 'vip'];
export const userLevels = ['standard', 'bronze', 'silver', 'gold', 'platinum', 'vip'];
export const strategyTypes: { value: Strategy['type']; label: string }[] = [
  { value: 'discount', label: '折扣类' },
  { value: 'reminder', label: '提醒类' },
  { value: 'dispatch', label: '派单类' },
  { value: 'admission', label: '准入类' },
];
export const strategyStatuses: { value: Strategy['status']; label: string }[] = [
  { value: 'draft', label: '草稿' },
  { value: 'pending', label: '待审批' },
  { value: 'approved', label: '已审批' },
  { value: 'pending_launch', label: '待上线' },
  { value: 'active', label: '已上线' },
  { value: 'paused', label: '已暂停' },
  { value: 'disabled', label: '已下线' },
];
