import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calculator, BarChart3, Bell, Clock, AlertTriangle, CheckCircle, TrendingUp, Users, Target, Zap, Pause, Play } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { StatusBadge, TypeBadge } from '../../components/Common/Badge';
import { Table, TableRow, TableCell } from '../../components/Common/Table';
import { useStrategyStore, useDashboardStore, useUserStore, addAuditLog } from '../../stores';
import type { Strategy } from '../../types';
import dayjs from 'dayjs';

export const Dashboard: React.FC = () => {
  const { strategies, updateStrategy } = useStrategyStore();
  const { stats, todos, removeTodo } = useDashboardStore();
  const { currentUser } = useUserStore();

  useEffect(() => {
    const now = new Date();
    strategies.forEach((strategy) => {
      if (strategy.status === 'pending_launch' && strategy.launchTime) {
        const launchTime = new Date(strategy.launchTime);
        if (launchTime <= now) {
          updateStrategy(strategy.id, { status: 'active' }, '系统');
          addAuditLog(
            strategy.id,
            strategy.name,
            '策略上线',
            'system',
            '系统',
            `计划时间已到，策略自动上线`
          );
        }
      }
    });
  }, [strategies, updateStrategy]);

  const handleToggleStatus = (strategy: Strategy) => {
    if (strategy.status === 'active') {
      updateStrategy(strategy.id, { status: 'paused', updateTime: new Date().toISOString() }, currentUser.name);
      addAuditLog(strategy.id, strategy.name, '策略暂停', currentUser.id, currentUser.name, '策略已暂停');
    } else if (strategy.status === 'paused') {
      updateStrategy(strategy.id, { status: 'active', updateTime: new Date().toISOString() }, currentUser.name);
      addAuditLog(strategy.id, strategy.name, '策略恢复', currentUser.id, currentUser.name, '策略已恢复上线');
    }
  };

  const statCards = [
    { label: '策略总数', value: stats.totalStrategies, icon: Target, color: 'blue', change: '+12%' },
    { label: '已上线策略', value: stats.activeStrategies, icon: CheckCircle, color: 'green', change: '+8%' },
    { label: '今日新增', value: stats.todayNew, icon: Zap, color: 'yellow', change: '+3' },
    { label: '总命中次数', value: stats.totalHits.toLocaleString(), icon: TrendingUp, color: 'purple', change: '+15%' },
  ];

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">策略首页</h1>
          <p className="text-slate-600 mt-1">欢迎回来，快速了解您的策略运营状况</p>
        </div>
        <div className="flex gap-3">
          <Link to="/wizard">
            <Button variant="primary" size="lg">
              <Plus className="w-5 h-5" />
              创建策略
            </Button>
          </Link>
          <Link to="/trial">
            <Button variant="outline" size="lg">
              <Calculator className="w-5 h-5" />
              试算工具
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardBody className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                    <p className="text-xs text-green-600 mt-1 font-medium">{stat.change} 较上周</p>
                  </div>
                  <div className={`${colorClasses[stat.color as keyof typeof colorClasses]} p-3 rounded-xl shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardBody>
              <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-50 to-transparent opacity-50`}></div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">策略列表</h2>
              <Link to="/templates" className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                查看全部
              </Link>
            </CardHeader>
            <CardBody className="p-0">
              <Table headers={['策略名称', '类型', '状态', '更新时间', '操作']}>
                {strategies.slice(0, 5).map((strategy) => (
                  <TableRow key={strategy.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{strategy.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{strategy.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TypeBadge type={strategy.type} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={strategy.status} />
                    </TableCell>
                    <TableCell className="text-slate-500">{dayjs(strategy.updateTime).format('MM-DD HH:mm')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          编辑
                        </Button>
                        {(strategy.status === 'active' || strategy.status === 'paused') && (
                          <Button
                            variant={strategy.status === 'active' ? 'warning' : 'success'}
                            size="sm"
                            onClick={() => handleToggleStatus(strategy)}
                          >
                            {strategy.status === 'active' ? (
                              <>
                                <Pause className="w-3 h-3" />
                                暂停
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3" />
                                恢复
                              </>
                            )}
                          </Button>
                        )}
                        <Link to={`/strategy/${strategy.id}`}>
                          <Button variant="secondary" size="sm">
                            详情
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-500" />
                待办事项
              </h2>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-slate-100">
                {todos.map((todo) => (
                  <div key={todo.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${
                        todo.type === 'approval' ? 'text-yellow-500' :
                        todo.type === 'launch' ? 'text-blue-500' : 'text-red-500'
                      }`}>
                        {todo.type === 'approval' ? <Clock className="w-4 h-4" /> :
                         todo.type === 'launch' ? <Target className="w-4 h-4" /> :
                         <AlertTriangle className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{todo.title}</p>
                        <p className="text-xs text-slate-500 mt-1">截止: {todo.dueTime}</p>
                      </div>
                      <button
                        onClick={() => removeTodo(todo.id)}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-900">快捷操作</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <Link to="/wizard" className="block">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                    <Plus className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">创建新策略</p>
                    <p className="text-xs text-slate-500">从模板或空白创建</p>
                  </div>
                </div>
              </Link>
              <Link to="/trial" className="block">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-all group">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-500 transition-colors">
                    <Calculator className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">规则试算</p>
                    <p className="text-xs text-slate-500">测试规则匹配效果</p>
                  </div>
                </div>
              </Link>
              <Link to="/analytics" className="block">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all group">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                    <BarChart3 className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">效果分析</p>
                    <p className="text-xs text-slate-500">查看策略效果报表</p>
                  </div>
                </div>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.pendingApprovals}</p>
                <p className="text-sm text-slate-600">待审批策略</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.pendingLaunch}</p>
                <p className="text-sm text-slate-600">待上线策略</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.expiringSoon}</p>
                <p className="text-sm text-slate-600">即将过期</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
