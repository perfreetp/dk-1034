import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, ChevronRight, ChevronLeft, Percent, Bell, Truck, Shield, AlertCircle } from 'lucide-react';
import { Card, CardBody } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { Badge } from '../../components/Common/Badge';
import { useWizardStore, useTemplateStore, useStrategyStore, useUserStore, addAuditLog } from '../../stores';
import { cities, userTypes, userLevels, strategyTypes } from '../../data/mockData';
import type { Strategy, StrategyType } from '../../types';

const steps = [
  { id: 0, label: '基本信息', description: '策略名称和描述' },
  { id: 1, label: '触发条件', description: '设置触发规则' },
  { id: 2, label: '执行动作', description: '配置执行动作' },
  { id: 3, label: '适用维度', description: '设置适用范围' },
  { id: 4, label: '预览确认', description: '规则预览和提交' },
];

export const Wizard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useUserStore();
  const { templateId } = useParams();
  const { currentStep, wizardData, setCurrentStep, nextStep, prevStep, updateWizardData, resetWizard } = useWizardStore();
  const { getTemplateById } = useTemplateStore();
  const { addStrategy } = useStrategyStore();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'discount' as StrategyType,
    priority: 1,
    userTypes: [] as string[],
    minAmount: 0,
    maxAmount: 0,
    cities: [] as string[],
    userLevels: [] as string[],
    actionType: 'discount' as 'discount' | 'gift' | 'points' | 'coupon',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    giftName: '',
    pointsMultiplier: 1,
    effectiveStart: '',
    effectiveEnd: '',
    timeSlotStart: '00:00',
    timeSlotEnd: '23:59',
  });

  useEffect(() => {
    if (templateId) {
      const template = getTemplateById(templateId);
      if (template) {
        setFormData((prev) => ({
          ...prev,
          type: template.type,
          userTypes: template.defaultTrigger?.userTypes || [],
          minAmount: template.defaultTrigger?.minAmount || 0,
          maxAmount: template.defaultTrigger?.maxAmount || 0,
          userLevels: template.defaultTrigger?.userLevels || [],
          actionType: template.defaultAction?.actionType || 'discount',
          discountType: template.defaultAction?.discountType || 'percentage',
          discountValue: template.defaultAction?.discountValue || 0,
          giftName: template.defaultAction?.giftName || '',
          pointsMultiplier: template.defaultAction?.pointsMultiplier || 1,
        }));
      }
    }
  }, [templateId, getTemplateById]);

  const handleSubmit = () => {
    const newStrategy: Strategy = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      type: formData.type,
      priority: formData.priority,
      status: 'draft',
      trigger: {
        userTypes: formData.userTypes,
        minAmount: formData.minAmount,
        maxAmount: formData.maxAmount,
        cities: formData.cities,
        userLevels: formData.userLevels,
      },
      action: {
        actionType: formData.actionType,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        giftName: formData.giftName,
        pointsMultiplier: formData.pointsMultiplier,
      },
      dimensions: {
        cities: formData.cities,
        timeSlots: [{ start: formData.timeSlotStart, end: formData.timeSlotEnd }],
        effectiveStart: formData.effectiveStart,
        effectiveEnd: formData.effectiveEnd,
      },
      creator: currentUser.name,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
    };

    addStrategy(newStrategy, currentUser.name);
    addAuditLog(newStrategy.id, newStrategy.name, '创建策略', currentUser.id, currentUser.name, '创建了新的策略');
    resetWizard();
    navigate('/');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">策略名称 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：新用户首单优惠"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">策略描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="描述此策略的用途和规则..."
                rows={4}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">策略类型 *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {strategyTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setFormData({ ...formData, type: type.value })}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      formData.type === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">
                      {type.value === 'discount' && <Percent className="w-6 h-6 mx-auto text-green-600" />}
                      {type.value === 'reminder' && <Bell className="w-6 h-6 mx-auto text-blue-600" />}
                      {type.value === 'dispatch' && <Truck className="w-6 h-6 mx-auto text-yellow-600" />}
                      {type.value === 'admission' && <Shield className="w-6 h-6 mx-auto text-purple-600" />}
                    </div>
                    <p className="text-sm font-medium text-slate-700">{type.label}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">优先级</label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                min="1"
                max="10"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">数字越小优先级越高 (1-10)</p>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">用户类型</label>
              <div className="flex flex-wrap gap-2">
                {['new', 'regular', 'member', 'vip'].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      const types = formData.userTypes.includes(type)
                        ? formData.userTypes.filter((t) => t !== type)
                        : [...formData.userTypes, type];
                      setFormData({ ...formData, userTypes: types });
                    }}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      formData.userTypes.includes(type)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {type === 'new' ? '新用户' : type === 'regular' ? '普通用户' : type === 'member' ? '会员' : 'VIP'}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">最低消费金额</label>
                <input
                  type="number"
                  value={formData.minAmount}
                  onChange={(e) => setFormData({ ...formData, minAmount: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">最高消费金额</label>
                <input
                  type="number"
                  value={formData.maxAmount}
                  onChange={(e) => setFormData({ ...formData, maxAmount: parseInt(e.target.value) || 0 })}
                  placeholder="不限"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">用户等级</label>
              <div className="flex flex-wrap gap-2">
                {userLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      const levels = formData.userLevels.includes(level)
                        ? formData.userLevels.filter((l) => l !== level)
                        : [...formData.userLevels, level];
                      setFormData({ ...formData, userLevels: levels });
                    }}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      formData.userLevels.includes(level)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">动作类型</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'discount', label: '折扣', icon: Percent },
                  { value: 'gift', label: '赠品', icon: Bell },
                  { value: 'points', label: '积分', icon: Truck },
                  { value: 'coupon', label: '优惠券', icon: Shield },
                ].map((action) => (
                  <button
                    key={action.value}
                    onClick={() => setFormData({ ...formData, actionType: action.value as any })}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      formData.actionType === action.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <action.icon className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm font-medium">{action.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {formData.actionType === 'discount' && (
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">折扣方式</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setFormData({ ...formData, discountType: 'percentage' })}
                      className={`flex-1 p-3 border-2 rounded-lg transition-all ${
                        formData.discountType === 'percentage'
                          ? 'border-blue-500 bg-white text-blue-700'
                          : 'border-slate-200'
                      }`}
                    >
                      百分比折扣
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, discountType: 'fixed' })}
                      className={`flex-1 p-3 border-2 rounded-lg transition-all ${
                        formData.discountType === 'fixed'
                          ? 'border-blue-500 bg-white text-blue-700'
                          : 'border-slate-200'
                      }`}
                    >
                      固定金额折扣
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {formData.discountType === 'percentage' ? '折扣比例' : '折扣金额'}
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {formData.discountType === 'percentage' ? '例如：8 表示 8 折' : '例如：50 表示减 50 元'}
                  </p>
                </div>
              </div>
            )}

            {formData.actionType === 'gift' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">赠品名称</label>
                <input
                  type="text"
                  value={formData.giftName}
                  onChange={(e) => setFormData({ ...formData, giftName: e.target.value })}
                  placeholder="例如：精美礼品盒"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {formData.actionType === 'points' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">积分倍数</label>
                <input
                  type="number"
                  value={formData.pointsMultiplier}
                  onChange={(e) => setFormData({ ...formData, pointsMultiplier: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="10"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">例如：2 表示双倍积分</p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">适用城市</label>
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  onClick={() => setFormData({ ...formData, cities: ['全国'] })}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    formData.cities.includes('全国')
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200'
                  }`}
                >
                  全国
                </button>
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      const newCities = formData.cities.includes('全国')
                        ? [city]
                        : formData.cities.includes(city)
                        ? formData.cities.filter((c) => c !== city)
                        : [...formData.cities, city];
                      setFormData({ ...formData, cities: newCities });
                    }}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      formData.cities.includes(city)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">生效开始日期</label>
                <input
                  type="date"
                  value={formData.effectiveStart}
                  onChange={(e) => setFormData({ ...formData, effectiveStart: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">生效结束日期</label>
                <input
                  type="date"
                  value={formData.effectiveEnd}
                  onChange={(e) => setFormData({ ...formData, effectiveEnd: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">每天适用时间段</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">开始时间</label>
                  <input
                    type="time"
                    value={formData.timeSlotStart}
                    onChange={(e) => setFormData({ ...formData, timeSlotStart: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">结束时间</label>
                  <input
                    type="time"
                    value={formData.timeSlotEnd}
                    onChange={(e) => setFormData({ ...formData, timeSlotEnd: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">设置策略每天生效的时间段，不在时间段内的订单不会命中</p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Card>
              <CardBody>
                <h3 className="font-semibold text-lg mb-4">策略预览</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">策略名称</p>
                    <p className="font-medium">{formData.name || '未设置'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">策略类型</p>
                    <p className="font-medium">{strategyTypes.find((t) => t.value === formData.type)?.label}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">触发条件</p>
                    <p className="font-medium text-sm mt-1">
                      {formData.userTypes.length > 0 ? `用户类型: ${formData.userTypes.join(', ')}` : '全部用户'}
                      {formData.minAmount > 0 && ` | 最低消费: ¥${formData.minAmount}`}
                      {formData.maxAmount > 0 && ` | 最高消费: ¥${formData.maxAmount}`}
                      {formData.userLevels.length > 0 && ` | 用户等级: ${formData.userLevels.join(', ')}`}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">执行动作</p>
                    <p className="font-medium text-sm mt-1">
                      {formData.actionType === 'discount' && (
                        <>
                          {formData.discountType === 'percentage' ? `${formData.discountValue}% 折扣` : `¥${formData.discountValue} 优惠`}
                        </>
                      )}
                      {formData.actionType === 'gift' && `赠送 ${formData.giftName}`}
                      {formData.actionType === 'points' && `${formData.pointsMultiplier}倍积分`}
                      {formData.actionType === 'coupon' && '发放优惠券'}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">适用城市</p>
                    <p className="font-medium">{formData.cities.join(', ') || '全国'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">有效期</p>
                    <p className="font-medium">
                      {formData.effectiveStart || '未设置'} {formData.effectiveEnd && `至 ${formData.effectiveEnd}`}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">每天适用时间段</p>
                    <p className="font-medium">
                      {formData.timeSlotStart} - {formData.timeSlotEnd}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">提示</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    策略创建后需要提交审批，审批通过后方可上线。请确保填写的信息准确无误。
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">配置向导</h1>
        <p className="text-slate-600 mt-1">创建新的服务策略，按照步骤完成配置</p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    index < currentStep
                      ? 'bg-blue-500 text-white'
                      : index === currentStep
                      ? 'bg-blue-500 text-white ring-4 ring-blue-200'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                <div className="ml-3 hidden md:block">
                  <p className={`font-medium ${index === currentStep ? 'text-blue-600' : 'text-slate-600'}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-slate-500">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${index < currentStep ? 'bg-blue-500' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <Card>
        <CardBody className="p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              步骤 {currentStep + 1}: {steps[currentStep].label}
            </h2>
            <p className="text-slate-600 mt-1">{steps[currentStep].description}</p>
          </div>

          {renderStepContent()}

          <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4" />
              上一步
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button variant="primary" onClick={nextStep}>
                下一步
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button variant="success" onClick={handleSubmit}>
                <Check className="w-4 h-4" />
                创建策略
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
