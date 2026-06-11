import { create } from 'zustand';
import type { Strategy, Template, User, AuditLog, DashboardStats, TodoItem } from '../types';
import { mockStrategies, mockTemplates, mockAuditLogs, mockDashboardStats, mockTodoItems, mockUsers } from '../data/mockData';

interface StrategyStore {
  strategies: Strategy[];
  currentStrategy: Strategy | null;
  addStrategy: (strategy: Strategy) => void;
  updateStrategy: (id: string, updates: Partial<Strategy>) => void;
  deleteStrategy: (id: string) => void;
  setCurrentStrategy: (strategy: Strategy | null) => void;
  getStrategyById: (id: string) => Strategy | undefined;
}

export const useStrategyStore = create<StrategyStore>((set, get) => ({
  strategies: mockStrategies,
  currentStrategy: null,
  addStrategy: (strategy) => set((state) => ({ strategies: [...state.strategies, strategy] })),
  updateStrategy: (id, updates) =>
    set((state) => ({
      strategies: state.strategies.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),
  deleteStrategy: (id) => set((state) => ({ strategies: state.strategies.filter((s) => s.id !== id) })),
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
  logs: mockAuditLogs,
  addLog: (log) => set((state) => ({ logs: [log, ...state.logs] })),
  getLogsByStrategyId: (strategyId) => get().logs.filter((log) => log.strategyId === strategyId),
}));

interface DashboardStore {
  stats: DashboardStats;
  todos: TodoItem[];
  updateStats: (updates: Partial<DashboardStats>) => void;
  removeTodo: (id: string) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  stats: mockDashboardStats,
  todos: mockTodoItems,
  updateStats: (updates) => set((state) => ({ stats: { ...state.stats, ...updates } })),
  removeTodo: (id) => set((state) => ({ todos: state.todos.filter((t) => t.id !== id) })),
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
