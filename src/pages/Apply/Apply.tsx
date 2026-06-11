import React, { useState } from 'react';
import { Send, Clock, CheckCircle, XCircle, Calendar, User, FileText, History, Pause, Play } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { Badge } from '../../components/Common/Badge';
import { StatusBadge } from '../../components/Common/Badge';
import { Table, TableRow, TableCell } from '../../components/Common/Table';
import { useStrategyStore, useUserStore, addAuditLog } from '../../stores';
import type { Strategy } from '../../types';
import dayjs from 'dayjs';

export const Apply: React.FC = () => {
  const { strategies, updateStrategy } = useStrategyStore();
  const { currentUser } = useUserStore();
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [launchTime, setLaunchTime] = useState('');
  const [launchReason, setLaunchReason] = useState('');
  const [selectedApprover, setSelectedApprover] = useState('李管理员');

  const pendingStrategies = strategies.filter((s) => s.status === 'draft' || s.status === 'pending');
  const approvedStrategies = strategies.filter((s) => s.status === 'approved' || s.status === 'pending_launch');

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
    };
    
    updateStrategy(strategyId, updates, currentUser.name);
    
    if (strategy.launchTime) {
      addAuditLog(
        strategyId,
        strategy.name,
        '审批通过',
        currentUser.id,
        currentUser.name,
        `审批通过，计划上线时间：${strategy.launchTime}`
      );
    } else {
      updateStrategy(strategyId, { launchTime: new Date().toISOString() }, currentUser.name);
      addAuditLog(
        strategyId,
        strategy.name,
        '策略上线',
        currentUser.id,
        currentUser.name,
        '审批通过，策略已立即上线'
      );
    }
  };

  const handleReject = (strategyId: string) => {
    const strategy = strategies.find(s => s.id === strategyId);
    updateStrategy(strategyId, { status: 'draft' }, currentUser.name);
    if (strategy) {
      addAuditLog(
        strategyId,
        strategy.name,
        '审批驳回',
        currentUser.id,
        currentUser.name,
        '审批未通过，策略已驳回'
      );
    }
  };

  const handleLaunch = (strategyId: string) => {
    const strategy = strategies.find(s => s.id === strategyId);
    updateStrategy(strategyId, { status: 'active', launchTime: new Date().toISOString() }, currentUser.name);
    if (strategy) {
      addAuditLog(
        strategyId,
        strategy.name,
        '策略上线',
        currentUser.id,
        currentUser.name,
        '策略已成功上线'
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
              <Table headers={['策略名称', '类型', '状态', '计划上线时间', '操作']}>
                {pendingStrategies.map((strategy) => (
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
                    <TableCell className="text-slate-600">
                      {strategy.launchTime ? dayjs(strategy.launchTime).format('MM-DD HH:mm') : '-'}
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
                {pendingStrategies.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
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
                待上线策略
              </h2>
            </CardHeader>
            <CardBody className="p-0">
              <Table headers={['策略名称', '状态', '计划上线时间', '审批时间', '操作']}>
                {approvedStrategies.filter(s => s.status === 'pending_launch').map((strategy) => (
                  <TableRow key={strategy.id}>
                    <TableCell>
                      <p className="font-medium">{strategy.name}</p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={strategy.status} />
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {strategy.launchTime ? dayjs(strategy.launchTime).format('MM-DD HH:mm') : '-'}
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
                {approvedStrategies.filter(s => s.status === 'pending_launch').length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      暂无待上线的策略
                    </TableCell>
                  </TableRow>
                )}
              </Table>
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
