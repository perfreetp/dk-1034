export type StrategyStatus = 'draft' | 'pending' | 'approved' | 'pending_launch' | 'active' | 'paused' | 'disabled';
export type StrategyType = 'discount' | 'reminder' | 'dispatch' | 'admission' | 'points' | 'gift';
export type ActionType = 'discount' | 'gift' | 'points' | 'coupon';

export interface TriggerCondition {
  userTypes?: string[];
  minAmount?: number;
  maxAmount?: number;
  startTime?: string;
  endTime?: string;
  cities?: string[];
  userLevels?: string[];
}

export interface ActionConfig {
  actionType: ActionType;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  giftName?: string;
  pointsMultiplier?: number;
}

export interface TimeSlot {
  start: string;
  end: string;
  days?: string[];
}

export interface DimensionConfig {
  cities: string[];
  timeSlots: TimeSlot[];
  excludeUsers?: string[];
  effectiveStart?: string;
  effectiveEnd?: string;
}

export interface StrategyStats {
  hitCount: number;
  hitRate: number;
  conversionRate: number;
  roi: number;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  type: StrategyType;
  priority: number;
  status: StrategyStatus;
  trigger: TriggerCondition;
  action: ActionConfig;
  dimensions: DimensionConfig;
  creator: string;
  createTime: string;
  updateTime: string;
  approver?: string;
  approveTime?: string;
  launchTime?: string;
  actualLaunchTime?: string;
  stats?: StrategyStats;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  type: StrategyType;
  usageCount: number;
  createTime: string;
  thumbnail?: string;
  defaultTrigger?: TriggerCondition;
  defaultAction?: ActionConfig;
}

export interface AuditLog {
  id: string;
  strategyId: string;
  strategyName: string;
  action: string;
  operator: string;
  operatorName: string;
  createTime: string;
  details?: string;
  beforeState?: object;
  afterState?: object;
}

export interface User {
  id: string;
  name: string;
  role: 'operator' | 'admin' | 'manager';
  avatar?: string;
  department?: string;
}

export interface DashboardStats {
  totalStrategies: number;
  activeStrategies: number;
  todayNew: number;
  totalHits: number;
  pendingApprovals: number;
  pendingLaunch: number;
  expiringSoon: number;
}

export interface TodoItem {
  id: string;
  type: 'approval' | 'launch' | 'expiring';
  title: string;
  strategyId: string;
  dueTime?: string;
}

export interface TestData {
  userId: string;
  userType: string;
  amount: number;
  city: string;
  userLevel: string;
  time: string;
}

export interface TrialResult {
  matched: boolean;
  triggerResult: boolean;
  dimensionResult: boolean;
  impactCount: number;
  conflicts: string[];
}
