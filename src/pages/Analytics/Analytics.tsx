import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Target, DollarSign, Download, Filter, Calendar, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { Table, TableRow, TableCell } from '../../components/Common/Table';
import { StatusBadge, TypeBadge, Badge } from '../../components/Common/Badge';
import { useStrategyStore, useAuditStore } from '../../stores';
import type { Strategy } from '../../types';
import dayjs from 'dayjs';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const Analytics: React.FC = () => {
  const { strategies } = useStrategyStore();
  const { logs } = useAuditStore();
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedCity, setSelectedCity] = useState<string>('全部');
  const [selectedType, setSelectedType] = useState<string>('全部');
  const [expandedStrategyId, setExpandedStrategyId] = useState<string | null>(null);

  const activeStrategies = strategies.filter((s) => s.status === 'active' && s.stats);

  const allCities = ['全部', ...Array.from(new Set(activeStrategies.flatMap(s => s.dimensions.cities || [])))];
  const allTypes = ['全部', ...Array.from(new Set(activeStrategies.map(s => s.type)))];

  const filteredStrategies = activeStrategies.filter((s) => {
    const cityMatch = selectedCity === '全部' || s.dimensions.cities?.includes(selectedCity);
    const typeMatch = selectedType === '全部' || s.type === selectedType;
    return cityMatch && typeMatch;
  });

  const trendData = Array.from({ length: 7 }, (_, i) => {
    const date = dayjs().subtract(6 - i, 'day');
    return {
      date: date.format('M月D日'),
      hits: Math.floor(Math.random() * 3000) + 4000,
      conversions: Math.floor(Math.random() * 1000) + 1300,
      revenue: Math.floor(Math.random() * 40000) + 80000,
    };
  });

  const getStrategyTrend = (strategy: Strategy) => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = dayjs().subtract(6 - i, 'day');
      return {
        date: date.format('M月D日'),
        hits: Math.floor((strategy.stats?.hitCount || 0) / 30 * (0.8 + Math.random() * 0.4)),
      };
    });
  };

  const typeDistribution = [
    { name: '折扣类', value: filteredStrategies.filter((s) => s.type === 'discount').length, color: '#10B981' },
    { name: '提醒类', value: filteredStrategies.filter((s) => s.type === 'reminder').length, color: '#2563EB' },
    { name: '派单类', value: filteredStrategies.filter((s) => s.type === 'dispatch').length, color: '#F59E0B' },
    { name: '准入类', value: filteredStrategies.filter((s) => s.type === 'admission').length, color: '#8B5CF6' },
    { name: '积分类', value: filteredStrategies.filter((s) => s.type === 'points').length, color: '#EC4899' },
    { name: '赠品类', value: filteredStrategies.filter((s) => s.type === 'gift').length, color: '#F97316' },
  ];

  const totalHits = filteredStrategies.reduce((sum, s) => sum + (s.stats?.hitCount || 0), 0);
  const avgConversion = filteredStrategies.length > 0
    ? filteredStrategies.reduce((sum, s) => sum + (s.stats?.conversionRate || 0), 0) / filteredStrategies.length
    : 0;
  const avgRoi = filteredStrategies.length > 0
    ? filteredStrategies.reduce((sum, s) => sum + (s.stats?.roi || 0), 0) / filteredStrategies.length
    : 0;

  const mockHitDetails = filteredStrategies.length > 0
    ? filteredStrategies.slice(0, 3).flatMap((strategy, sIdx) =>
        Array.from({ length: Math.min(2, Math.ceil((strategy.stats?.hitCount || 0) / 10000)) }, (_, idx) => ({
          id: sIdx * 10 + idx + 1,
          userId: `U${10001 + sIdx * 10 + idx}`,
          strategyName: strategy.name,
          matchTime: dayjs().subtract(idx, 'hour').format('YYYY-MM-DD HH:mm:ss'),
          city: strategy.dimensions.cities?.[0] || '全国',
          amount: Math.floor(Math.random() * 1000) + 100,
          discount: strategy.action.actionType === 'discount'
            ? (strategy.action.discountType === 'percentage'
              ? Math.floor((Math.random() * 1000) * (strategy.action.discountValue || 10) / 100)
              : strategy.action.discountValue || 0)
            : 0,
        }))
      )
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">效果看板</h1>
          <p className="text-slate-600 mt-1">追踪策略效果，分析运营数据</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="text-sm border-none focus:outline-none bg-transparent"
            >
              {allCities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-sm border-none focus:outline-none bg-transparent"
            >
              {allTypes.map((type) => (
                <option key={type} value={type}>{type === '全部' ? '全部类型' : type}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 bg-white border border-slate-200 rounded-lg p-1">
            {['1d', '7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  timeRange === range ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {range === '1d' ? '今天' : range === '7d' ? '7天' : range === '30d' ? '30天' : '90天'}
              </button>
            ))}
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4" />
            导出报表
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">总命中次数</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{totalHits.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +15.3% 较上周
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">平均转化率</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{avgConversion.toFixed(1)}%</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +2.1% 较上周
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">平均ROI</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{avgRoi.toFixed(2)}x</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +0.3x 较上周
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">活跃策略</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{activeStrategies.length}</p>
                <p className="text-xs text-slate-600 mt-1">正在执行的策略</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">效果趋势</h2>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="hits" stroke="#2563EB" strokeWidth={2} name="命中次数" />
                  <Line type="monotone" dataKey="conversions" stroke="#10B981" strokeWidth={2} name="转化次数" />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">策略类型分布</h2>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeDistribution.filter(t => t.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeDistribution.filter(t => t.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">命中明细</h2>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4" />
              查看更多
            </Button>
          </CardHeader>
          <CardBody className="p-0">
            <Table headers={['用户ID', '策略名称', '城市', '金额', '优惠', '时间']}>
              {mockHitDetails.map((detail) => (
                <TableRow key={detail.id}>
                  <TableCell className="font-mono text-xs">{detail.userId}</TableCell>
                  <TableCell>
                    <p className="text-sm">{detail.strategyName}</p>
                  </TableCell>
                  <TableCell>{detail.city}</TableCell>
                  <TableCell>¥{detail.amount}</TableCell>
                  <TableCell className="text-green-600">¥{detail.discount.toFixed(1)}</TableCell>
                  <TableCell className="text-slate-500 text-xs">
                    {dayjs(detail.matchTime).format('MM-DD HH:mm')}
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">策略效果排名</h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-slate-100">
              {filteredStrategies
                .sort((a, b) => (b.stats?.hitCount || 0) - (a.stats?.hitCount || 0))
                .slice(0, 5)
                .map((strategy, index) => {
                  const isExpanded = expandedStrategyId === strategy.id;
                  return (
                    <div key={strategy.id}>
                      <div
                        className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => setExpandedStrategyId(isExpanded ? null : strategy.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                              index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-orange-400' : 'bg-slate-300'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{strategy.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                转化率: {strategy.stats?.conversionRate.toFixed(1)}% | ROI: {strategy.stats?.roi.toFixed(2)}x
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-lg font-bold text-blue-600">{strategy.stats?.hitCount.toLocaleString()}</p>
                              <p className="text-xs text-slate-500">命中次数</p>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${((strategy.stats?.hitCount || 0) / (filteredStrategies[0]?.stats?.hitCount || 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="px-4 pb-4 bg-blue-50">
                          <p className="text-sm font-medium text-blue-900 mb-3">最近7天命中趋势</p>
                          <ResponsiveContainer width="100%" height={150}>
                            <LineChart data={getStrategyTrend(strategy)}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                              <XAxis dataKey="date" stroke="#6366f1" fontSize={10} />
                              <YAxis stroke="#6366f1" fontSize={10} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: '#fff',
                                  border: '1px solid #e0e7ff',
                                  borderRadius: '8px',
                                }}
                              />
                              <Line type="monotone" dataKey="hits" stroke="#2563EB" strokeWidth={2} name="命中次数" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">操作日志</h2>
        </CardHeader>
        <CardBody className="p-0">
          <Table headers={['操作人', '操作类型', '策略名称', '时间', '详情']}>
            {logs.slice(0, 10).map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-blue-600">{log.operatorName.charAt(0)}</span>
                    </div>
                    <span>{log.operatorName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={log.action.includes('通过') || log.action.includes('上线') ? 'success' : 'default'}>
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{log.strategyName}</TableCell>
                <TableCell className="text-slate-500">{dayjs(log.createTime).format('MM-DD HH:mm:ss')}</TableCell>
                <TableCell className="text-slate-600 text-sm">{log.details}</TableCell>
              </TableRow>
            ))}
          </Table>
        </CardBody>
      </Card>
    </div>
  );
};
