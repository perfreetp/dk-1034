import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Percent, Bell, Truck, Shield, Search, Filter, Clock, Users, Eye, Plus, X, Gift, Sparkles } from 'lucide-react';
import { Card, CardBody } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { Badge } from '../../components/Common/Badge';
import { useTemplateStore } from '../../stores';
import type { Template, StrategyType } from '../../types';
import dayjs from 'dayjs';

export const Templates: React.FC = () => {
  const { templates } = useTemplateStore();
  const [selectedType, setSelectedType] = useState<StrategyType | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const typeIcons: Record<StrategyType, typeof Percent> = {
    discount: Percent,
    reminder: Bell,
    dispatch: Truck,
    admission: Shield,
    points: Sparkles,
    gift: Gift,
  };

  const typeColors: Record<StrategyType, string> = {
    discount: 'from-green-500 to-emerald-600',
    reminder: 'from-blue-500 to-cyan-600',
    dispatch: 'from-yellow-500 to-orange-600',
    admission: 'from-purple-500 to-violet-600',
    points: 'from-pink-500 to-rose-600',
    gift: 'from-amber-500 to-orange-600',
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesType = selectedType === 'all' || template.type === selectedType;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">模板库</h1>
        <p className="text-slate-600 mt-1">从预设模板快速创建策略，提高配置效率</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索模板..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedType === 'all' ? 'primary' : 'outline'}
            onClick={() => setSelectedType('all')}
          >
            全部
          </Button>
          <Button
            variant={selectedType === 'discount' ? 'primary' : 'outline'}
            onClick={() => setSelectedType('discount')}
          >
            <Percent className="w-4 h-4" />
            折扣类
          </Button>
          <Button
            variant={selectedType === 'reminder' ? 'primary' : 'outline'}
            onClick={() => setSelectedType('reminder')}
          >
            <Bell className="w-4 h-4" />
            提醒类
          </Button>
          <Button
            variant={selectedType === 'dispatch' ? 'primary' : 'outline'}
            onClick={() => setSelectedType('dispatch')}
          >
            <Truck className="w-4 h-4" />
            派单类
          </Button>
          <Button
            variant={selectedType === 'admission' ? 'primary' : 'outline'}
            onClick={() => setSelectedType('admission')}
          >
            <Shield className="w-4 h-4" />
            准入类
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const Icon = typeIcons[template.type];
          return (
            <Card
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className="group hover:shadow-xl transition-all duration-300"
            >
              <CardBody className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${typeColors[template.type]} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {template.name}
                      </h3>
                      <Badge variant="default">{template.type === 'discount' ? '折扣' :
                        template.type === 'reminder' ? '提醒' :
                        template.type === 'dispatch' ? '派单' : '准入'}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{template.description}</p>
                    <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>使用 {template.usageCount} 次</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{dayjs(template.createTime).format('YYYY-MM-DD')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Filter className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">没有找到匹配的模板</p>
        </div>
      )}

      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTemplate(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${typeColors[selectedTemplate.type]} rounded-xl flex items-center justify-center`}>
                  {React.createElement(typeIcons[selectedTemplate.type], { className: 'w-6 h-6 text-white' })}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedTemplate.name}</h2>
                  <p className="text-sm text-slate-500">模板详情</p>
                </div>
              </div>
              <button onClick={() => setSelectedTemplate(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">模板描述</h3>
                <p className="text-slate-600">{selectedTemplate.description}</p>
              </div>
              {selectedTemplate.defaultTrigger && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">默认触发条件</h3>
                  <div className="bg-slate-50 rounded-lg p-4 text-sm">
                    <p><span className="text-slate-500">用户类型：</span>{selectedTemplate.defaultTrigger.userTypes?.join(', ') || '全部'}</p>
                    {selectedTemplate.defaultTrigger.minAmount && (
                      <p><span className="text-slate-500">最低金额：</span>¥{selectedTemplate.defaultTrigger.minAmount}</p>
                    )}
                  </div>
                </div>
              )}
              {selectedTemplate.defaultAction && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">默认执行动作</h3>
                  <div className="bg-slate-50 rounded-lg p-4 text-sm">
                    <p><span className="text-slate-500">动作类型：</span>{selectedTemplate.defaultAction.actionType}</p>
                    {selectedTemplate.defaultAction.discountValue && (
                      <p><span className="text-slate-500">折扣值：</span>{selectedTemplate.defaultAction.discountType === 'percentage' ? `${selectedTemplate.defaultAction.discountValue}%` : `¥${selectedTemplate.defaultAction.discountValue}`}</p>
                    )}
                    {selectedTemplate.defaultAction.pointsMultiplier && (
                      <p><span className="text-slate-500">积分倍数：</span>{selectedTemplate.defaultAction.pointsMultiplier}x</p>
                    )}
                    {selectedTemplate.defaultAction.giftName && (
                      <p><span className="text-slate-500">礼品名称：</span>{selectedTemplate.defaultAction.giftName}</p>
                    )}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <Link to={`/wizard/${selectedTemplate.id}`} className="flex-1">
                  <Button variant="primary" className="w-full">
                    <Plus className="w-4 h-4" />
                    使用此模板创建
                  </Button>
                </Link>
                <Button variant="outline">
                  <Eye className="w-4 h-4" />
                  查看示例
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
