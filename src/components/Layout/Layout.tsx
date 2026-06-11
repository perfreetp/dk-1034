import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Wand2, Calculator, Send, BarChart3, Bell, Search, User, ChevronDown } from 'lucide-react';
import { useUserStore } from '../../stores';

const navItems = [
  { path: '/', label: '策略首页', icon: LayoutDashboard },
  { path: '/templates', label: '模板库', icon: FileText },
  { path: '/wizard', label: '配置向导', icon: Wand2 },
  { path: '/trial', label: '试算页面', icon: Calculator },
  { path: '/apply', label: '上线申请', icon: Send },
  { path: '/analytics', label: '效果看板', icon: BarChart3 },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { currentUser } = useUserStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-60 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Wand2 className="w-5 h-5" />
            </div>
            规则引擎
          </h1>
          <p className="text-xs text-slate-400 mt-1">自助配置门户</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-400 truncate">{currentUser.department}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索策略、模板..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 ml-8">
              <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{currentUser.name}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                    <a href="#" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      个人设置
                    </a>
                    <a href="#" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      退出登录
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
