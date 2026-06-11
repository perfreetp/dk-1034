import React, { useState } from 'react';
import { Send, Clock, CheckCircle, XCircle, Calendar, User, FileText, History, Pause, Play, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { Badge } from '../../components/Common/Badge';
import { StatusBadge } from '../../components/Common/Badge';
import { Table, TableRow, TableCell } from '../../components/Common/Table';
import { useStrategyStore, useUserStore, useAuditStore, addAuditLog } from '../../stores';
import type { Strategy } from '../../types';
import dayjs from 'dayjs';

export const Apply: React.FC = () => {
  const { strategies, updateStrategy } = useStrategyStore();
  const { currentUser } = useUserStore();
  const { getLogsByStrategyId } = useAuditStore();
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [launchTime, setLaunchTime] = useState('');
  const [launchReason, setLaunchReason] = useState('');
  const [selectedApprover, setSelectedApprover] = useState('李管理员');
  const [approvalComment, setApprovalComment] = useState('');
  const [expandedStrategyId, setExpandedStrategyId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

  const draftStrategies = strategies.filter((s) => s.status === 'draft');
  const pendingStrategies = strategies.filter((s) => s.status === 'pending');
  const pendingLaunchStrategies = strategies.filter((s) => s.status === 'pending_launch');

  const handleSubmitApplication = () => {
    if (!selectedStrategy) return;
    const updates: Partial<Strategy> = {
      status: 'pending',
      launchTime: launchTime || undefined,
    };
    updateStrategy(selectedStrategy.id, updates, currentUser.name);
    addAuditLog(
      selectedStrategy.id,
      selectedStrategy.name,
      '提交审批',
      currentUser.id,
      currentUser.name,
      `提交上线申请${launchTime ? `，计划上线时间：${launchTime}` : ''}`
    );
    setSelectedStrategy(null);
    setLaunchReason('');
    setLaunchTime('');
  };

  const handleApprove = (strategyId: string) => {
    const strategy = strategies.find(s => s.id === strategyId);
    if (!strategy) return;
    
    const newStatus = strategy.launchTime ? 'pending_launch' : 'active';
    const updates: Partial<Strategy> = {
      status: newStatus as any,
      approver: currentUser.name,
      approveTime: new Date().toISOString(),
      approvalComment: approvalComment || undefined,
    };
    
    updateStrategy(strategyId, updates, currentUser.name);
    
    if (strategy.launchTime) {
      addAuditLog(
        strategyId,
        strategy.name,
        '审批通过',
        currentUser.id,
        currentUser.name,
        approvalComment ? `审批意见：${approvalComment}，计划上线时间：${dayjs(strategy.launchTime).format('YYYY-MM-DD HH:mm')}` : `审批通过，计划上线时间：${dayjs(strategy.launchTime).format('YYYY-MM-DD HH:mm')}`
      );
    } else {
      updateStrategy(strategyId, { launchTime: new Date().toISOString() }, currentUser.name);
      addAuditLog(
        strategyId,
        strategy.name,
        '策略上线',
        currentUser.id,
        currentUser.name,
        approvalComment ? `审批意见：${approvalComment}，策略已立即上线` : '审批通过，策略已立即上线'
      );
    }
    
    setApprovalComment('');
    setExpandedStrategyId(null);
  };

  const handleReject = (strategyId: string) => {
    const strategy = strategies.find(s => s.id === strategyId);
    updateStrategy(strategyId, { status: 'draft', approvalComment }, currentUser.name);
    if (strategy) {
      addAuditLog(
        strategyId,
        strategy.name,
        '审批驳回',
        currentUser.id,
        currentUser.name,
        approvalComment ? `审批意见：${approvalComment}` : '审批未通过，策略已驳回'
      );
    }
    setApprovalComment('');
    setExpandedStrategyId(null);
  };

  const handleLaunch = (strategyId: string) => {
    const strategy = strategies.find(s => s.id === strategyId);
    const updates: Partial<Strategy> = {
      status: 'active',
      actualLaunchTime: new Date().toISOString(),
    };
    updateStrategy(strategyId, updates, currentUser.name);
    if (strategy) {
      const scheduledTime = strategy.launchTime;
      const details = scheduledTime
        ? `计划上线时间：${dayjs(scheduledTime).format('YYYY-MM-DD HH:mm')}，已提前上线`
        : '策略已上线';
      addAuditLog(
        strategyId,
        strategy.name,
        '策略上线',
        currentUser.id,
        currentUser.name,
        details
      );
    }
  };

  const handleToggleStatus = (strategy: Strategy) => {
    if (strategy.status === 'active') {
      updateStrategy(strategy.id, { status: 'paused', updateTime: new Date().toISOString() }, currentUser.name);
      addAuditLog(
        strategy.id,
        strategy.name,
        '策略暂停',
        currentUser.id,
        currentUser.name,
        '策略已暂停'
      );
    } else if (strategy.status === 'paused') {
      updateStrategy(strategy.id, { status: 'active', updateTime: new Date().toISOString() }, currentUser.name);
      addAuditLog(
        strategy.id,
        strategy.name,
        '策略恢复',
        currentUser.id,
        currentUser.name,
        '策略已恢复上线'
      );
    }
  };

  const activeStrategies = strategies.filter((s) => s.status === 'active' || s.status === 'paused');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">上线申请</h1>
        <p className="text-slate-600 mt-1">提交策略上线申请，管理审批流程</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            已上线策略管理
          </h2>
        </CardHeader>
        <CardBody className="p-0">
          <Table headers={['策略名称', '类型', '状态', '上线时间', '操作']}>
            {activeStrategies.map((strategy) => (
              <TableRow key={strategy.id}>
                <TableCell>
                  <p className="font-medium">{strategy.name}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="default">{strategy.type}</Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={strategy.status} />
                </TableCell>
                <TableCell className="text-slate-600">
                  {strategy.launchTime ? dayjs(strategy.launchTime).format('MM-DD HH:mm') : '-'}
                </TableCell>
                <TableCell>
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
                </TableCell>
              </TableRow>
            ))}
            {activeStrategies.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  暂无已上线或已暂停的策略
                </TableCell>
              </TableRow>
            )}
          </Table>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                待提交申请
              </h2>
            </CardHeader>
            <CardBody className="p-0">
              <Table headers={['策略名称', '类型', '状态', '操作']}>
                {draftStrategies.map((strategy) => (
                  <TableRow key={strategy.id}>
                    <TableCell>
                      <p className="font-medium">{strategy.name}</p>
                      <p className="text-xs text-slate-500">{strategy.description}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{strategy.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={strategy.status} />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedStrategy(strategy)}
                      >
                        申请上线
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {draftStrategies.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                      暂无待提交的策略
                    </TableCell>
                  </TableRow>
                )}
              </Table>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                待审批工作台
              </h2>
            </CardHeader>
            <CardBody className="p-0">
              {pendingStrategies.length > 0 ? (
                <div className="space-y-4 p-4">
                  {pendingStrategies.map((strategy) => {
                    const logs = getLogsByStrategyId(strategy.id);
                    const isExpanded = expandedStrategyId === strategy.id;
                    const estimatedUsers = Math.floor(Math.random() * 10000) + 5000;
                    
                    return (
                      <div key={strategy.id} className="border border-slate-200 rounded-lg overflow-hidden">
                        <div
                          className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                          onClick={() => setExpandedStrategyId(isExpanded ? null : strategy.id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                              <Clock className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{strategy.name}</p>
                              <p className="text-sm text-slate-600 mt-1">{strategy.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="default">{strategy.type}</Badge>
                            {strategy.launchTime && (
                              <div className="text-right">
                                <p className="text-xs text-slate-500">计划上线</p>
                                <p className="font-medium text-yellow-700">{dayjs(strategy.launchTime).format('MM-DD HH:mm')}</p>
                              </div>
                            )}
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-6 border-t border-slate-200 bg-white space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              <div className="space-y-4">
                                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  规则摘要
                                </h3>
                                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-blue-700">策略类型：</span>
                                    <span className="font-medium">{strategy.type}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-blue-700">用户类型：</span>
                                    <span className="font-medium">{strategy.trigger.userTypes?.join(', ') || '全部'}</span>
                                  </div>
                                  {strategy.trigger.minAmount && (
                                    <div className="flex justify-between text-sm">
                                      <span className="text-blue-700">最低消费：</span>
                                      <span className="font-medium">¥{strategy.trigger.minAmount}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-sm">
                                    <span className="text-blue-700">动作类型：</span>
                                    <span className="font-medium">{strategy.action.actionType}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  上线排期
                                </h3>
                                <div className="bg-yellow-50 p-4 rounded-lg space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-yellow-700">提交时间：</span>
                                    <span className="font-medium">{dayjs(strategy.updateTime).format('YYYY-MM-DD HH:mm')}</span>
                                  </div>
                                  {strategy.launchTime && (
                                    <div className="flex justify-between text-sm">
                                      <span className="text-yellow-700">计划上线：</span>
                                      <span className="font-medium text-yellow-900">{dayjs(strategy.launchTime).format('YYYY-MM-DD HH:mm')}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-sm">
                                    <span className="text-yellow-700">申请人：</span>
                                    <span className="font-medium">{strategy.creator}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  影响估算
                                </h3>
                                <div className="bg-green-50 p-4 rounded-lg">
                                  <div className="text-center">
                                    <p className="text-3xl font-bold text-green-900">{estimatedUsers.toLocaleString()}</p>
                                    <p className="text-sm text-green-700 mt-1">预估影响用户数</p>
                                  </div>
                                  <div className="mt-4 text-xs text-green-700">
                                    <p>适用城市：{strategy.dimensions.cities?.join(', ') || '全国'}</p>
                                    <p>有效期：{strategy.dimensions.effectiveStart || '长期'} 至 {strategy.dimensions.effectiveEnd || '永久'}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {logs.length > 0 && (
                              <div>
                                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                  <History className="w-4 h-4" />
                                  历史操作
                                </h3>
                                <div className="bg-slate-50 p-4 rounded-lg space-y-2 max-h-40 overflow-y-auto">
                                  {logs.map((log) => (
                                    <div key={log.id} className="flex justify-between text-sm">
                                      <span className="text-slate-700">
                                        {log.action} - {log.operatorName}
                                      </span>
                                      <span className="text-slate-500">{dayjs(log.createTime).format('MM-DD HH:mm:ss')}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div>
                              <h3 className="font-semibold text-slate-900 mb-3">审批意见</h3>
                              <textarea
                                value={approvalComment}
                                onChange={(e) => setApprovalComment(e.target.value)}
                                placeholder="填写审批意见（可选）..."
                                rows={3}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                              />
                            </div>

                            <div className="flex justify-end gap-3">
                              <Button
                                variant="error"
                                onClick={() => handleReject(strategy.id)}
                              >
                                <XCircle className="w-4 h-4" />
                                驳回
                              </Button>
                              <Button
                                variant="success"
                                onClick={() => handleApprove(strategy.id)}
                              >
                                <CheckCircle className="w-4 h-4" />
                                通过
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">暂无待审批的策略</p>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                待上线策略
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded text-sm ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  列表视图
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-3 py-1 rounded text-sm ${viewMode === 'timeline' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  时间线视图
                </button>
              </div>
            </CardHeader>
            <CardBody>
              {viewMode === 'list' ? (
                <Table headers={['策略名称', '状态', '计划上线时间', '审批时间', '操作']}>
                  {pendingLaunchStrategies.map((strategy) => (
                    <TableRow key={strategy.id}>
                      <TableCell>
                        <p className="font-medium">{strategy.name}</p>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={strategy.status} />
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {strategy.launchTime ? dayjs(strategy.launchTime).format('YYYY-MM-DD HH:mm') : '-'}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {strategy.approveTime ? dayjs(strategy.approveTime).format('MM-DD HH:mm') : '-'}
                      </TableCell>
                      <TableCell>
                        <Button variant="success" size="sm" onClick={() => handleLaunch(strategy.id)}>
                          立即上线
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingLaunchStrategies.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        暂无待上线的策略
                      </TableCell>
                    </TableRow>
                  )}
                </Table>
              ) : (
                <div className="space-y-4">
                  {pendingLaunchStrategies.length > 0 ? (
                    pendingLaunchStrategies
                      .filter(s => s.launchTime)
                      .sort((a, b) => new Date(a.launchTime!).getTime() - new Date(b.launchTime!).getTime())
                      .map((strategy, index) => (
                        <div key={strategy.id} className="flex items-start gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                              <Clock className="w-5 h-5 text-yellow-600" />
                            </div>
                            {index < pendingLaunchStrategies.filter(s => s.launchTime).length - 1 && (
                              <div className="w-0.5 h-full bg-yellow-200 mt-2" />
                            )}
                          </div>
                          <div className="flex-1 pb-6">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-semibold text-slate-900">{strategy.name}</p>
                                <StatusBadge status={strategy.status} />
                              </div>
                              <div className="space-y-1 text-sm">
                                <p className="text-slate-600">
                                  <span className="text-yellow-700">计划上线时间：</span>
                                  {dayjs(strategy.launchTime).format('YYYY-MM-DD HH:mm')}
                                </p>
                                <p className="text-slate-600">
                                  <span className="text-slate-500">审批时间：</span>
                                  {strategy.approveTime ? dayjs(strategy.approveTime).format('YYYY-MM-DD HH:mm') : '-'}
                                </p>
                                <p className="text-slate-600">
                                  <span className="text-slate-500">审批人：</span>
                                  {strategy.approver || '-'}
                                </p>
                              </div>
                              <div className="mt-3 flex justify-end">
                                <Button variant="success" size="sm" onClick={() => handleLaunch(strategy.id)}>
                                  立即上线
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">暂无待上线的策略</p>
                    </div>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          {selectedStrategy ? (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">申请上线</h2>
                <Button variant="outline" size="sm" onClick={() => setSelectedStrategy(null)}>
                  取消
                </Button>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-medium text-slate-900 mb-2">{selectedStrategy.name}</h3>
                  <p className="text-sm text-slate-600">{selectedStrategy.description}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">选择审批人</label>
                  <select
                    value={selectedApprover}
                    onChange={(e) => setSelectedApprover(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>李管理员</option>
                    <option>王区域经理</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">上线理由</label>
                  <textarea
                    value={launchReason}
                    onChange={(e) => setLaunchReason(e.target.value)}
                    placeholder="请说明此策略上线的业务理由..."
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">定时上线（可选）</label>
                  <input
                    type="datetime-local"
                    value={launchTime}
                    onChange={(e) => setLaunchTime(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">留空则立即上线</p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">{launchTime ? '定时上线流程' : '立即上线流程'}</p>
                      <p className="text-sm text-blue-700 mt-1">
                        {launchTime
                          ? '审批通过后策略将进入待上线状态，在计划时间自动生效。您也可以提前点击立即上线。'
                          : '审批通过后策略将立即生效。请确保策略配置正确。'}
                      </p>
                    </div>
                  </div>
                </div>

                <Button variant="primary" className="w-full" onClick={handleSubmitApplication}>
                  <Send className="w-4 h-4" />
                  提交申请
                </Button>
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardBody className="py-16 text-center">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">从左侧选择一个策略开始申请</p>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">审批历史</h2>
            </CardHeader>
            <CardBody className="p-0">
              <div className="space-y-0">
                {strategies
                  .filter((s) => s.approveTime)
                  .slice(0, 5)
                  .map((strategy, index) => (
                    <div key={strategy.id} className="p-4 border-b border-slate-100 last:border-0">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{strategy.name}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            审批人: {strategy.approver} | {dayjs(strategy.approveTime).format('YYYY-MM-DD HH:mm')}
                          </p>
                        </div>
                        <Badge variant="success">已审批</Badge>
                      </div>
                    </div>
                  ))}
                {strategies.filter((s) => s.approveTime).length === 0 && (
                  <div className="p-8 text-center text-slate-500">
                    暂无审批记录
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">待审批列表</h2>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-slate-100">
                {strategies
                  .filter((s) => s.status === 'pending')
                  .map((strategy) => (
                    <div key={strategy.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{strategy.name}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            申请人: {strategy.creator} | {dayjs(strategy.createTime).format('MM-DD HH:mm')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="success" size="sm" onClick={() => handleApprove(strategy.id)}>
                            通过
                          </Button>
                          <Button variant="error" size="sm" onClick={() => handleReject(strategy.id)}>
                            驳回
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                {strategies.filter((s) => s.status === 'pending').length === 0 && (
                  <div className="p-8 text-center text-slate-500">
                    暂无待审批策略
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
