import { create } from 'zustand';
import type { Strategy, Template, User, AuditLog, DashboardStats, TodoItem } from '../types';
import { mockStrategies, mockTemplates, mockAuditLogs, mockDashboardStats, mockTodoItems, mockUsers } from '../data/mockData';

const STORAGE_KEYS = {
  strategies: 'rule_engine_strategies',
  logs: 'rule_engine_logs',
  dashboard: 'rule_engine_dashboard',
  todos: 'rule_engine_todos',
};

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, value: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

interface StrategyStore {
  strategies: Strategy[];
  currentStrategy: Strategy | null;
  addStrategy: (strategy: Strategy, operatorName?: string) => void;
  updateStrategy: (id: string, updates: Partial<Strategy>, operatorName?: string) => void;
  deleteStrategy: (id: string) => void;
  setCurrentStrategy: (strategy: Strategy | null) => void;
  getStrategyById: (id: string) => Strategy | undefined;
}

export const useStrategyStore = create<StrategyStore>((set, get) => ({
  strategies: loadFromStorage(STORAGE_KEYS.strategies, mockStrategies),
  currentStrategy: null,
  addStrategy: (strategy, operatorName = '系统') => {
    const newStrategies = [...get().strategies, strategy];
    set({ strategies: newStrategies });
    saveToStorage(STORAGE_KEYS.strategies, newStrategies);
  },
  updateStrategy: (id, updates, operatorName = '系统') => {
    const strategy = get().getStrategyById(id);
    if (!strategy) return;
    
    const newStrategies = get().strategies.map((s) => 
      s.id === id ? { ...s, ...updates } : s
    );
    set({ strategies: newStrategies });
    saveToStorage(STORAGE_KEYS.strategies, newStrategies);
  },
  deleteStrategy: (id) => {
    const newStrategies = get().strategies.filter((s) => s.id !== id);
    set({ strategies: newStrategies });
    saveToStorage(STORAGE_KEYS.strategies, newStrategies);
  },
  setCurrentStrategy: (strategy) => set({ currentStrategy: strategy }),
  getStrategyById: (id) => get().strategies.find((s) => s.id === id),
}));

interface TemplateStore {
  templates: Template[];
  selectedTemplate: Template | null;
  setSelectedTemplate: (template: Template | null) => void;
  getTemplateById: (id: string) => Template | undefined;
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: mockTemplates,
  selectedTemplate: null,
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
  getTemplateById: (id) => get().templates.find((t) => t.id === id),
}));

interface UserStore {
  currentUser: User;
  users: User[];
  setCurrentUser: (user: User) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  currentUser: mockUsers[0],
  users: mockUsers,
  setCurrentUser: (user) => set({ currentUser: user }),
}));

interface AuditStore {
  logs: AuditLog[];
  addLog: (log: AuditLog) => void;
  getLogsByStrategyId: (strategyId: string) => AuditLog[];
}

export const useAuditStore = create<AuditStore>((set, get) => ({
  logs: loadFromStorage(STORAGE_KEYS.logs, mockAuditLogs),
  addLog: (log) => {
    const newLogs = [log, ...get().logs];
    set({ logs: newLogs });
    saveToStorage(STORAGE_KEYS.logs, newLogs);
  },
  getLogsByStrategyId: (strategyId) => get().logs.filter((log) => log.strategyId === strategyId),
}));

interface DashboardStore {
  stats: DashboardStats;
  todos: TodoItem[];
  updateStats: (updates: Partial<DashboardStats>) => void;
  removeTodo: (id: string) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  stats: loadFromStorage(STORAGE_KEYS.dashboard, mockDashboardStats),
  todos: loadFromStorage(STORAGE_KEYS.todos, mockTodoItems),
  updateStats: (updates) => {
    set((state) => {
      const newStats = { ...state.stats, ...updates };
      saveToStorage(STORAGE_KEYS.dashboard, newStats);
      return { stats: newStats };
    });
  },
  removeTodo: (id) => {
    set((state) => {
      const newTodos = state.todos.filter((t) => t.id !== id);
      saveToStorage(STORAGE_KEYS.todos, newTodos);
      return { todos: newTodos };
    });
  },
}));

interface WizardStore {
  currentStep: number;
  wizardData: Partial<Strategy>;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateWizardData: (data: Partial<Strategy>) => void;
  resetWizard: () => void;
}

export const useWizardStore = create<WizardStore>((set) => ({
  currentStep: 0,
  wizardData: {},
  setCurrentStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
  updateWizardData: (data) => set((state) => ({ wizardData: { ...state.wizardData, ...data } })),
  resetWizard: () => set({ currentStep: 0, wizardData: {} }),
}));

export const addAuditLog = (
  strategyId: string,
  strategyName: string,
  action: string,
  operator: string,
  operatorName: string,
  details?: string
) => {
  const log: AuditLog = {
    id: Date.now().toString(),
    strategyId,
    strategyName,
    action,
    operator,
    operatorName,
    createTime: new Date().toISOString(),
    details,
  };
  useAuditStore.getState().addLog(log);
};
