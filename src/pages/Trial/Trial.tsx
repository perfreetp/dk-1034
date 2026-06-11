import React, { useState } from 'react';
import { Play, Users, AlertTriangle, CheckCircle, XCircle, Code, Eye, Download } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { Badge } from '../../components/Common/Badge';
import { useStrategyStore } from '../../stores';
import { cities, userTypes, userLevels } from '../../data/mockData';
import type { Strategy, TestData, TrialResult } from '../../types';

export const Trial: React.FC = () => {
  const { strategies } = useStrategyStore();
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [testData, setTestData] = useState<TestData>({
    userId: 'test-user-001',
    userType: 'new',
    amount: 500,
    city: '北京',
    userLevel: 'standard',
    time: new Date().toISOString(),
  });
  const [trialResult, setTrialResult] = useState<TrialResult | null>(null);
  const [showJson, setShowJson] = useState(false);

  const handleTrial = () => {
    if (!selectedStrategy) return;

    const triggerMatch = checkTrigger(selectedStrategy, testData);
    const dimensionMatch = checkDimension(selectedStrategy, testData);
    const impactCount = estimateImpact(selectedStrategy);
    const conflicts = findConflicts(selectedStrategy);

    setTrialResult({
      matched: triggerMatch && dimensionMatch,
      triggerResult: triggerMatch,
      dimensionResult: dimensionMatch,
      impactCount,
      conflicts,
    });
  };

  const checkTrigger = (strategy: Strategy, data: TestData): boolean => {
    if (strategy.trigger.userTypes && strategy.trigger.userTypes.length > 0) {
      if (!strategy.trigger.userTypes.includes(data.userType)) return false;
    }
    if (strategy.trigger.minAmount && data.amount < strategy.trigger.minAmount) return false;
    if (strategy.trigger.maxAmount && data.amount > strategy.trigger.maxAmount) return false;
    if (strategy.trigger.userLevels && strategy.trigger.userLevels.length > 0) {
      if (!strategy.trigger.userLevels.includes(data.userLevel)) return false;
    }
    return true;
  };

  const checkDimension = (strategy: Strategy, data: TestData): boolean => {
    if (strategy.dimensions.cities && strategy.dimensions.cities.length > 0) {
      if (!strategy.dimensions.cities.includes('全国') && !strategy.dimensions.cities.includes(data.city)) {
        return false;
      }
    }
    
    const timeSlot = strategy.dimensions.timeSlots?.[0];
    if (timeSlot) {
      const now = new Date(data.time);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const [startHour, startMin] = timeSlot.start.split(':').map(Number);
      const [endHour, endMin] = timeSlot.end.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
        return false;
      }
    }
    
    const testDate = new Date(data.time);
    if (strategy.dimensions.effectiveStart) {
      const startDate = new Date(strategy.dimensions.effectiveStart);
      if (testDate < startDate) {
        return false;
      }
    }
    
    if (strategy.dimensions.effectiveEnd) {
      const endDate = new Date(strategy.dimensions.effectiveEnd);
      if (testDate > endDate) {
        return false;
      }
    }
    
    return true;
  };

  const estimateImpact = (strategy: Strategy): number => {
    const baseCount = Math.floor(Math.random() * 10000) + 5000;
    let multiplier = 1;

    if (strategy.dimensions.cities?.includes('全国')) {
      multiplier *= 10;
    } else {
      multiplier *= (strategy.dimensions.cities?.length || 1) * 0.3;
    }

    if (strategy.trigger.userTypes?.length) {
      multiplier *= 0.25;
    }

    return Math.floor(baseCount * multiplier);
  };

  const findConflicts = (strategy: Strategy): string[] => {
    const conflicts: string[] = [];
    strategies.filter(s => s.status === 'active').forEach((s) => {
      if (s.id !== strategy.id && s.type === strategy.type) {
        const hasOverlap =
          (s.dimensions.cities?.some((c) => strategy.dimensions.cities?.includes(c)) ||
            s.dimensions.cities?.includes('全国') ||
            strategy.dimensions.cities?.includes('全国'));

        if (hasOverlap) {
          conflicts.push(`${s.name} (ID: ${s.id}) - 可能存在重叠`);
        }
      }
    });
    return conflicts;
  };

  const getRuleJson = (strategy: Strategy): string => {
    return JSON.stringify(
      {
        id: strategy.id,
        name: strategy.name,
        type: strategy.type,
        priority: strategy.priority,
        trigger: strategy.trigger,
        action: strategy.action,
        dimensions: strategy.dimensions,
      },
      null,
      2
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">试算页面</h1>
        <p className="text-slate-600 mt-1">预览规则逻辑、测试样例、估算影响人数</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">选择策略（仅显示已上线策略）</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {strategies.filter(s => s.status === 'active').map((strategy) => (
                  <div
                    key={strategy.id}
                    onClick={() => setSelectedStrategy(strategy)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedStrategy?.id === strategy.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{strategy.name}</p>
                        <p className="text-sm text-slate-500 mt-1">{strategy.description}</p>
                      </div>
                      <Badge variant="success">
                        已上线
                      </Badge>
                    </div>
                  </div>
                ))}
                {strategies.filter(s => s.status === 'active').length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    暂无已上线的策略
                  </div>
                )}
              </div>
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">
                  <span className="font-medium">提示：</span>仅可试算已上线策略。待审批、待上线、已暂停的策略不参与试算。
                </p>
              </div>
            </CardBody>
          </Card>

          {selectedStrategy && (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">规则预览</h2>
                <div className="flex gap-2">
                  <Button
                    variant={showJson ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setShowJson(!showJson)}
                  >
                    <Code className="w-4 h-4" />
                    {showJson ? '可视化' : 'JSON'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                    导出
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                {showJson ? (
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs">
                    <code>{getRuleJson(selectedStrategy)}</code>
                  </pre>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">触发条件</h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-blue-700">用户类型：</span>
                          {selectedStrategy.trigger.userTypes?.join(', ') || '全部'}
                        </p>
                        {selectedStrategy.trigger.minAmount && (
                          <p>
                            <span className="text-blue-700">最低金额：</span>¥{selectedStrategy.trigger.minAmount}
                          </p>
                        )}
                        {selectedStrategy.trigger.maxAmount && (
                          <p>
                            <span className="text-blue-700">最高金额：</span>¥{selectedStrategy.trigger.maxAmount}
                          </p>
                        )}
                        {selectedStrategy.trigger.userLevels && selectedStrategy.trigger.userLevels.length > 0 && (
                          <p>
                            <span className="text-blue-700">用户等级：</span>
                            {selectedStrategy.trigger.userLevels.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">执行动作</h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-green-700">动作类型：</span>
                          {selectedStrategy.action.actionType}
                        </p>
                        {selectedStrategy.action.discountValue && (
                          <p>
                            <span className="text-green-700">折扣值：</span>
                            {selectedStrategy.action.discountType === 'percentage'
                              ? `${selectedStrategy.action.discountValue}%`
                              : `¥${selectedStrategy.action.discountValue}`}
                          </p>
                        )}
                        {selectedStrategy.action.giftName && (
                          <p>
                            <span className="text-green-700">礼品：</span>
                            {selectedStrategy.action.giftName}
                          </p>
                        )}
                        {selectedStrategy.action.pointsMultiplier && (
                          <p>
                            <span className="text-green-700">积分倍数：</span>
                            {selectedStrategy.action.pointsMultiplier}x
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">适用维度</h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-purple-700">适用城市：</span>
                          {selectedStrategy.dimensions.cities?.join(', ')}
                        </p>
                        <p>
                          <span className="text-purple-700">有效期：</span>
                          {selectedStrategy.dimensions.effectiveStart || '长期'} 至{' '}
                          {selectedStrategy.dimensions.effectiveEnd || '永久'}
                        </p>
                        {selectedStrategy.dimensions.timeSlots?.[0] && (
                          <p>
                            <span className="text-purple-700">每天适用时间段：</span>
                            {selectedStrategy.dimensions.timeSlots[0].start} - {selectedStrategy.dimensions.timeSlots[0].end}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">样例测试</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">用户ID</label>
                <input
                  type="text"
                  value={testData.userId}
                  onChange={(e) => setTestData({ ...testData, userId: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">用户类型</label>
                <select
                  value={testData.userType}
                  onChange={(e) => setTestData({ ...testData, userType: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {userTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === 'new' ? '新用户' : type === 'regular' ? '普通用户' : type === 'member' ? '会员' : 'VIP'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">消费金额</label>
                <input
                  type="number"
                  value={testData.amount}
                  onChange={(e) => setTestData({ ...testData, amount: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">城市</label>
                <select
                  value={testData.city}
                  onChange={(e) => setTestData({ ...testData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">用户等级</label>
                <select
                  value={testData.userLevel}
                  onChange={(e) => setTestData({ ...testData, userLevel: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {userLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">测试时间</label>
                <input
                  type="datetime-local"
                  value={testData.time.slice(0, 16)}
                  onChange={(e) => setTestData({ ...testData, time: new Date(e.target.value).toISOString() })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">用于测试时间段条件</p>
              </div>
              <Button
                variant="primary"
                className="w-full"
                onClick={handleTrial}
                disabled={!selectedStrategy}
              >
                <Play className="w-4 h-4" />
                开始试算
              </Button>
            </CardBody>
          </Card>

          {trialResult && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">试算结果</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className={`p-6 rounded-lg ${trialResult.matched ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    {trialResult.matched ? (
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-600" />
                    )}
                    <div>
                      <p className={`font-semibold text-lg ${trialResult.matched ? 'text-green-900' : 'text-red-900'}`}>
                        {trialResult.matched ? '规则匹配成功' : '规则不匹配'}
                      </p>
                      <p className={`text-sm ${trialResult.matched ? 'text-green-700' : 'text-red-700'}`}>
                        {trialResult.matched ? '该用户符合策略条件' : '该用户不符合策略条件'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">触发条件</p>
                      <div className="flex items-center gap-2">
                        {trialResult.triggerResult ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`text-sm font-medium ${trialResult.triggerResult ? 'text-green-700' : 'text-red-700'}`}>
                          {trialResult.triggerResult ? '满足' : '不满足'}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">适用维度</p>
                      <div className="flex items-center gap-2">
                        {trialResult.dimensionResult ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`text-sm font-medium ${trialResult.dimensionResult ? 'text-green-700' : 'text-red-700'}`}>
                          {trialResult.dimensionResult ? '满足' : '不满足'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-700">预估影响人数</p>
                      <p className="text-2xl font-bold text-blue-900">{trialResult.impactCount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {trialResult.conflicts.length > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-900">同类策略冲突检测</p>
                        <div className="mt-2 space-y-2">
                          {trialResult.conflicts.map((conflict, index) => (
                            <p key={index} className="text-sm text-yellow-700">
                              {conflict}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
