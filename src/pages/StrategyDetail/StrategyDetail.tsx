import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Users, DollarSign, Percent, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { Badge, StatusBadge, TypeBadge } from '../../components/Common/Badge';
import { useStrategyStore, useAuditStore } from '../../stores';
import type { Strategy } from '../../types';
import dayjs from 'dayjs';

export const StrategyDetail: React.FC = () => {
  const { strategyId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getStrategyById } = useStrategyStore();
  const { getLogsByStrategyId } = useAuditStore();
  const [strategy, setStrategy] = useState<Strategy | null>(null);

  useEffect(() => {
    const id = strategyId || searchParams.get('strategy');
    if (id) {
      const found = getStrategyById(id);
      setStrategy(found || null);
    }
  }, [strategyId, searchParams, getStrategyById]);

  if (!strategy) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">未找到该策略</p>
          <Button variant="outline" onClick={() => navigate('/')} className="mt-4">
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  const logs = getLogsByStrategyId(strategy.id);

  const getUserTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      new: '新用户',
      regular: '普通用户',
      member: '会员',
      vip: 'VIP用户',
      all: '全部用户',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{strategy.name}</h1>
            <p className="text-slate-600 mt-1">{strategy.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <TypeBadge type={strategy.type} />
          <StatusBadge status={strategy.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                触发条件
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">用户类型</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {strategy.trigger.userTypes && strategy.trigger.userTypes.length > 0 ? (
                      strategy.trigger.userTypes.map((type) => (
                        <Badge key={type} variant="info">{getUserTypeLabel(type)}</Badge>
                      ))
                    ) : (
                      <Badge variant="info">全部用户</Badge>
                    )}
                  </div>
                </div>

                {(strategy.trigger.minAmount || strategy.trigger.maxAmount) && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">消费金额条件</span>
                    </div>
                    <p className="text-sm text-green-800">
                      {strategy.trigger.minAmount && `最低消费：¥${strategy.trigger.minAmount}`}
                      {strategy.trigger.minAmount && strategy.trigger.maxAmount && ' - '}
                      {strategy.trigger.maxAmount && `最高消费：¥${strategy.trigger.maxAmount}`}
                    </p>
                  </div>
                )}

                {strategy.trigger.userLevels && strategy.trigger.userLevels.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Percent className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">用户等级</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {strategy.trigger.userLevels.map((level) => (
                        <Badge key={level} variant="default">{level.toUpperCase()}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Percent className="w-5 h-5 text-green-500" />
                执行动作
              </h2>
            </CardHeader>
            <CardBody>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-900 mb-2">动作类型：{strategy.action.actionType}</p>
                {strategy.action.actionType === 'discount' && (
                  <div>
                    <p className="text-sm text-green-800">
                      折扣方式：{strategy.action.discountType === 'percentage' ? '百分比折扣' : '固定金额折扣'}
                    </p>
                    <p className="text-sm text-green-800 mt-1">
                      折扣值：
                      {strategy.action.discountType === 'percentage'
                        ? `${strategy.action.discountValue}%`
                        : `¥${strategy.action.discountValue}`}
                    </p>
                  </div>
                )}
                {strategy.action.actionType === 'gift' && (
                  <p className="text-sm text-green-800">赠品名称：{strategy.action.giftName}</p>
                )}
                {strategy.action.actionType === 'points' && (
                  <p className="text-sm text-green-800">积分倍数：{strategy.action.pointsMultiplier}x</p>
                )}
                {strategy.action.actionType === 'coupon' && (
                  <p className="text-sm text-green-800">发放优惠券</p>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-500" />
                适用维度
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">适用城市</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {strategy.dimensions.cities && strategy.dimensions.cities.length > 0 ? (
                      strategy.dimensions.cities.map((city) => (
                        <Badge key={city} variant="default">{city}</Badge>
                      ))
                    ) : (
                      <Badge variant="default">全国</Badge>
                    )}
                  </div>
                </div>

                {strategy.dimensions.timeSlots && strategy.dimensions.timeSlots[0] && (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-900">每天适用时间段</span>
                    </div>
                    <p className="text-sm text-yellow-800">
                      {strategy.dimensions.timeSlots[0].start} - {strategy.dimensions.timeSlots[0].end}
                    </p>
                  </div>
                )}

                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-900">有效期</span>
                  </div>
                  <p className="text-sm text-slate-700">
                    {strategy.dimensions.effectiveStart || '长期'} 至 {strategy.dimensions.effectiveEnd || '永久'}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                审批与上线信息
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">创建人</span>
                  <span className="text-sm font-medium">{strategy.creator}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">创建时间</span>
                  <span className="text-sm font-medium">{dayjs(strategy.createTime).format('YYYY-MM-DD HH:mm:ss')}</span>
                </div>
                {strategy.approver && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">审批人</span>
                      <span className="text-sm font-medium">{strategy.approver}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">审批时间</span>
                      <span className="text-sm font-medium">
                        {strategy.approveTime ? dayjs(strategy.approveTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
                      </span>
                    </div>
                  </>
                )}
                {strategy.launchTime && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-blue-600">计划上线时间</span>
                    <span className="text-sm font-medium text-blue-900">
                      {dayjs(strategy.launchTime).format('YYYY-MM-DD HH:mm:ss')}
                    </span>
                  </div>
                )}
                {strategy.actualLaunchTime && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-green-600">实际上线时间</span>
                    <span className="text-sm font-medium text-green-900">
                      {dayjs(strategy.actualLaunchTime).format('YYYY-MM-DD HH:mm:ss')}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">最后更新</span>
                  <span className="text-sm font-medium">{dayjs(strategy.updateTime).format('YYYY-MM-DD HH:mm:ss')}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {strategy.stats && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">效果统计</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">命中次数</p>
                <p className="text-2xl font-bold text-blue-900">{strategy.stats.hitCount.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 mb-1">命中率</p>
                <p className="text-2xl font-bold text-green-900">{strategy.stats.hitRate.toFixed(1)}%</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 mb-1">转化率</p>
                <p className="text-2xl font-bold text-purple-900">{strategy.stats.conversionRate.toFixed(1)}%</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-600 mb-1">ROI</p>
                <p className="text-2xl font-bold text-yellow-900">{strategy.stats.roi.toFixed(2)}x</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">操作日志</h2>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-blue-600">{log.operatorName.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{log.action}</p>
                      <p className="text-xs text-slate-500 mt-1">操作人：{log.operatorName} | {dayjs(log.createTime).format('YYYY-MM-DD HH:mm:ss')}</p>
                      {log.details && <p className="text-sm text-slate-600 mt-1">{log.details}</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                暂无操作记录
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
