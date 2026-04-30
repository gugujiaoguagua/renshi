import { useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { Bell, Download, RotateCcw, Search, X } from 'lucide-react';

import MobileModalShell from '../../components/mobile/MobileModalShell';
import { managerApprovalInsights } from '../../data/attendanceInsights';
import { downloadCsv } from '../../utils/downloadCsv';
import { anomalyBurstIcon, anomalyBurstSurfaceStrong } from '../../styles/attendanceAlertStyles';

type ApprovalTab = 'pending' | 'processed' | 'mine';
type ApprovalFilter = 'all' | '补卡' | '请假' | '出差' | '外出' | '调班';
type ApprovalRow = { label: string; value: string; valueTone?: string };
type ApprovalItem = Omit<(typeof managerApprovalInsights.pendingApprovals)[number], 'rows'> & { rows: ApprovalRow[] };

const filters: ApprovalFilter[] = ['all', '补卡', '请假', '出差', '外出', '调班'];

function getImpactChips(item: ApprovalItem, pending: boolean) {
  if (pending) {
    if (item.kind === '调班') return ['待主管确认', '通过后修正班次', '同步异常 / 月报'];
    if (item.kind === '出差' || item.kind === '外出') return ['待确认场景', '通过后按场景口径', '月底进入月报'];
    if (item.kind === '请假') return ['待主管审批', '通过后停用缺卡判定', '次月进入员工确认'];
    return ['待主管审批', '待回写异常中心', '待同步团队月报'];
  }

  if (item.status.includes('驳回')) return ['已保留驳回原因', '原结果保持不变', '员工可补资料重提'];
  if (item.status.includes('待成员确认')) return ['已发起提醒', '待成员补充说明', '确认后进入审批'];
  if (item.status.includes('回写') || item.status.includes('同步')) return ['审批已完成', '异常已更新', '日志已留痕'];
  return ['审批已完成', '异常已回写', '月报已同步'];
}

function getApprovalKey(item: ApprovalItem) {
  return `${item.applicant}-${item.kindLabel}-${item.submittedAt}`;
}

function buildApprovedItem(item: ApprovalItem): ApprovalItem {
  return {
    ...item,
    status: '已通过',
    statusTone: 'bg-emerald-50 text-emerald-700',
    tone: 'border-emerald-100 bg-emerald-50',
    sync: '同步状态：已回写异常中心 / 团队月报 / 日志中心',
    note: `${item.note} 审批已处理，结果会继续回写到异常中心、团队月报和日志中心。`,
    rows: [
      ...item.rows.slice(0, 3),
      { label: '处理结果', value: '审批通过并已回写当前口径', valueTone: 'text-emerald-700 font-semibold' },
    ],
  };
}

function buildRejectedItem(item: ApprovalItem): ApprovalItem {
  return {
    ...item,
    status: '已驳回',
    statusTone: 'bg-red-50 text-red-700',
    tone: 'border-red-100 bg-red-50',
    sync: '同步状态：已保留驳回原因，等待补资料重提',
    note: `${item.note} 本次先按“资料仍不完整，需要补充更明确说明后重提”驳回，并保留原因给员工补资料。`,
    rows: [
      ...item.rows.slice(0, 3),
      { label: '驳回原因', value: '资料仍不完整，需要补充更明确说明后重提', valueTone: 'text-red-700 font-semibold' },
    ],
  };
}

export default function ManagerApproval() {
  const [activeTab, setActiveTab] = useState<ApprovalTab>('pending');
  const [activeFilter, setActiveFilter] = useState<ApprovalFilter>('all');
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpPageInput, setJumpPageInput] = useState('');
  const [showReminderPreview, setShowReminderPreview] = useState(true);
  const [pendingList, setPendingList] = useState<ApprovalItem[]>(managerApprovalInsights.pendingApprovals);
  const [processedList, setProcessedList] = useState<ApprovalItem[]>(managerApprovalInsights.processedApprovals);
  const [actionMessage, setActionMessage] = useState('');
  const [detailItem, setDetailItem] = useState<ApprovalItem | null>(null);

  const mineApprovals = managerApprovalInsights.mineApprovals;
  const reminderPreview = managerApprovalInsights.reminderPreview;

  const baseList = useMemo(() => {
    return activeTab === 'pending' ? pendingList : activeTab === 'processed' ? processedList : mineApprovals;
  }, [activeTab, mineApprovals, pendingList, processedList]);

  const filteredRows = useMemo(() => {
    const keywordText = keyword.trim().toLowerCase();

    return baseList
      .filter((item) => (activeFilter === 'all' ? true : item.kind === activeFilter))
      .filter((item) => {
        if (!keywordText) return true;
        return [item.applicant, item.department, item.kindLabel, item.summary, item.status, item.sync]
          .some((part) => part.toLowerCase().includes(keywordText));
      })
      .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
  }, [activeFilter, baseList, keyword]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentRows = filteredRows.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  const handleApprove = (item: ApprovalItem) => {
    const nextItem = buildApprovedItem(item);
    setPendingList((current) => current.filter((currentItem) => getApprovalKey(currentItem) !== getApprovalKey(item)));
    setProcessedList((current) => [nextItem, ...current]);
    setDetailItem(nextItem);
    setActionMessage(`${item.applicant} 的${item.kindLabel}已通过，结果已同步回写到异常中心、团队月报和日志中心。`);
  };

  const handleReject = (item: ApprovalItem) => {
    const nextItem = buildRejectedItem(item);
    setPendingList((current) => current.filter((currentItem) => getApprovalKey(currentItem) !== getApprovalKey(item)));
    setProcessedList((current) => [nextItem, ...current]);
    setDetailItem(nextItem);
    setActionMessage(`${item.applicant} 的${item.kindLabel}已驳回，原因已保留，员工可补充资料后重新提交。`);
  };

  const handleView = (item: ApprovalItem) => setDetailItem(item);

  const handleProcessReminder = () => {
    setActiveTab('pending');
    setActiveFilter('all');
    setShowReminderPreview(false);
    setCurrentPage(1);
    setActionMessage('已切回待审批列表，请优先处理审批中和缺卡待确认的记录。');
  };

  const handleBatchProcess = () => {
    if (activeTab !== 'pending') {
      setActiveTab('pending');
      setCurrentPage(1);
      setActionMessage('已切换到待审批列表，可继续批量处理当前筛选结果。');
      return;
    }

    if (filteredRows.length === 0) {
      setActionMessage('当前筛选下没有可批量处理的待审批记录。');
      return;
    }

    const currentKeys = new Set(filteredRows.map((item) => getApprovalKey(item)));
    const approvedItems = filteredRows.map((item) => buildApprovedItem(item));

    setPendingList((current) => current.filter((item) => !currentKeys.has(getApprovalKey(item))));
    setProcessedList((current) => [...approvedItems, ...current]);
    setDetailItem(approvedItems[0] ?? null);
    setActionMessage(`已批量通过 ${approvedItems.length} 条当前筛选记录，并同步回写到异常中心与月报。`);
  };

  const handleRecalculate = () => {
    const tabLabel = activeTab === 'pending' ? '待审批' : activeTab === 'processed' ? '已处理' : '我发起的';
    const typeLabel = activeFilter === 'all' ? '全部类型' : activeFilter;
    const keywordText = keyword.trim() ? ` / 关键词：${keyword.trim()}` : '';
    setActionMessage(`已按 ${tabLabel} / ${typeLabel}${keywordText} 重新计算，共得到 ${filteredRows.length} 条审批记录。`);
  };

  const handleExport = () => {
    const tabLabel = activeTab === 'pending' ? '待审批' : activeTab === 'processed' ? '已处理' : '我发起的';
    downloadCsv(
      `主管审批中心-${tabLabel}.csv`,
      ['申请人', '部门', '类型', '状态', '提交时间', '申请说明', '同步状态'],
      filteredRows.map((item) => [item.applicant, item.department, item.kindLabel, item.status, item.submittedAt, item.summary, item.sync]),
    );
    setActionMessage(`已导出 ${filteredRows.length} 条审批记录。`);
  };

  const handleJumpPage = () => {
    const page = Number(jumpPageInput);
    if (!Number.isFinite(page)) return;
    const target = Math.min(totalPages, Math.max(1, Math.floor(page)));
    setCurrentPage(target);
    setJumpPageInput('');
  };

  return (
    <>
      {detailItem ? (
        <MobileModalShell
          icon={<Bell className="h-5 w-5" />}
          eyebrow="审批回写结果"
          title={`${detailItem.applicant} · ${detailItem.kindLabel}`}
          description={`${detailItem.department} · ${detailItem.status}`}
          onClose={() => setDetailItem(null)}
          panelClassName="max-w-2xl sm:max-h-[calc(100dvh-2rem)]"
          bodyClassName="px-4 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-4 sm:p-5"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">同步摘要</p>
              <p className="mt-2 leading-6">{detailItem.sync}</p>
              <p className="mt-2 leading-6">{detailItem.note}</p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
              <p className="font-semibold">影响范围</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {getImpactChips(detailItem, false).map((chip) => (
                  <span key={chip} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {detailItem.rows.map((row) => (
              <div key={row.label} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{row.label}</p>
                <p className={clsx('mt-2 leading-6', row.valueTone)}>{row.value}</p>
              </div>
            ))}
          </div>
        </MobileModalShell>
      ) : null}

      {showReminderPreview ? (
        <div className="pointer-events-none fixed right-6 top-24 z-30 hidden w-80 xl:block">
          <div className="pointer-events-auto rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-indigo-50 p-2 text-indigo-600">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">消息弹窗预览</p>
                  <h2 className="mt-1 text-base font-semibold text-slate-900">{reminderPreview.title}</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReminderPreview(false)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-4 rounded-3xl border border-indigo-100 bg-indigo-50 p-4 text-sm leading-6 text-indigo-900">
              {reminderPreview.desc}
            </p>
            <div className="mt-4 space-y-2 text-xs text-slate-600">
              {reminderPreview.cadence.map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 px-3 py-2">{item}</div>
              ))}
            </div>
            <button type="button" onClick={handleProcessReminder} className="mt-4 w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
              立即处理
            </button>
          </div>
        </div>
      ) : null}

      <div className="space-y-5 p-4 pb-20">
        {showReminderPreview ? (
          <section className={clsx('rounded-3xl border p-4 shadow-sm xl:hidden', anomalyBurstSurfaceStrong)}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 text-rose-950">
                <div className={clsx('rounded-2xl p-2', anomalyBurstIcon)}>
                  <Bell className="h-5 w-5 shrink-0" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{reminderPreview.title}</p>
                  <p className="mt-2 text-sm leading-6 text-rose-900">{reminderPreview.desc}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReminderPreview(false)}
                className="rounded-full bg-white p-2 text-rose-400 shadow-sm transition hover:text-rose-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <button type="button" onClick={handleProcessReminder} className="mt-4 w-full rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700">
              立即处理
            </button>
          </section>
        ) : null}

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">审批筛选与结果</h2>
              <p className="mt-2 text-sm text-gray-500">支持按列表类型与审批类型筛选，搜索后可直接导出。</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="space-y-1 text-sm text-gray-500">
                <span>列表类型</span>
                <select
                  value={activeTab}
                  onChange={(event) => {
                    setActiveTab(event.target.value as ApprovalTab);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-300"
                >
                  <option value="pending">待审批</option>
                  <option value="processed">已处理</option>
                  <option value="mine">我发起的</option>
                </select>
              </label>

              <label className="space-y-1 text-sm text-gray-500">
                <span>审批类型</span>
                <select
                  value={activeFilter}
                  onChange={(event) => {
                    setActiveFilter(event.target.value as ApprovalFilter);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-300"
                >
                  {filters.map((item) => (
                    <option key={item} value={item}>{item === 'all' ? '全部类型' : item}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm text-gray-500">
                <span>待审批数量</span>
                <input
                  value={`${pendingList.length} 条`}
                  readOnly
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-gray-700"
                />
              </label>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRecalculate}
                className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                重新计算
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Download className="mr-2 h-4 w-4" />
                导出审批
              </button>
              <button
                type="button"
                onClick={handleBatchProcess}
                className="inline-flex items-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                批量处理
              </button>
            </div>

            <div className="flex w-full max-w-md items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="搜索申请人 / 类型 / 状态"
              />
            </div>
          </div>

          {actionMessage ? <p className="mt-3 text-sm text-blue-700">{actionMessage}</p> : null}
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1220px] table-fixed border-collapse">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-600">
                  <th className="w-24 px-4 py-3">申请人</th>
                  <th className="w-40 px-4 py-3">部门</th>
                  <th className="w-24 px-4 py-3">类型</th>
                  <th className="w-24 px-4 py-3">状态</th>
                  <th className="w-36 px-4 py-3">提交时间</th>
                  <th className="px-4 py-3">申请说明</th>
                  <th className="w-52 px-4 py-3">同步状态</th>
                  <th className="w-44 px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((item, index) => (
                    <tr key={`${activeTab}-${getApprovalKey(item)}`} className={`${index % 2 === 0 ? 'bg-white' : 'bg-rose-50/30'} border-t border-slate-100`}>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">{item.applicant}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{item.department}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.kindTone}`}>{item.kindLabel}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.statusTone}`}>{item.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{item.submittedAt}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <p className="line-clamp-2">{item.summary}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <p className="line-clamp-2">{item.sync}</p>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {activeTab === 'pending' ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleReject(item)}
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                            >
                              驳回
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApprove(item)}
                              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                            >
                              同意并回写
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleView(item)}
                            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                          >
                            查看同步结果
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-14 text-center text-sm text-slate-400">当前筛选条件下暂无审批记录</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
            <p>
              显示第 <span className="font-semibold">{filteredRows.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}</span> 到{' '}
              <span className="font-semibold">{Math.min(safeCurrentPage * pageSize, filteredRows.length)}</span> 条，共{' '}
              <span className="font-semibold">{filteredRows.length}</span> 条结果
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((current) => Math.max(1, current - 1))}
                disabled={safeCurrentPage <= 1}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40"
              >
                上一页
              </button>
              <span className="text-xs text-slate-500">第 {safeCurrentPage} / {totalPages} 页</span>
              <button
                type="button"
                onClick={() => setCurrentPage((current) => Math.min(totalPages, current + 1))}
                disabled={safeCurrentPage >= totalPages}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40"
              >
                下一页
              </button>
              <div className="ml-1 inline-flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={jumpPageInput}
                  onChange={(event) => setJumpPageInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleJumpPage();
                    }
                  }}
                  className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-700 outline-none transition focus:border-blue-300"
                  placeholder="页码"
                />
                <button
                  type="button"
                  onClick={handleJumpPage}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  跳转
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
