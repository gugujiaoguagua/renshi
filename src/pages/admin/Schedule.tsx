import { useMemo, useState } from 'react';
import { ArrowRight, Calendar, Download, RotateCcw, Search } from 'lucide-react';
import MobileModalShell from '../../components/mobile/MobileModalShell';
import { adminScheduleInsights } from '../../data/attendanceInsights';
import { downloadCsv } from '../../utils/downloadCsv';

type ScheduleRow = (typeof adminScheduleInsights.rows)[number];
type StatusFilter = '全部状态' | '待复核' | '已完成';
type QuickFilter = '全部排班' | '待复核' | '已校准';

const quickFilterOptions: QuickFilter[] = ['全部排班', '待复核', '已校准'];

function buildCalibratedRow(row: ScheduleRow): ScheduleRow {
  return {
    ...row,
    status: '已校准',
    stage: '已完成',
    detail: `${row.detail} 当前已完成人事复核，并同步回写排班口径。`,
    impact: '当前可继续作为总部试点样板复用。',
    nextStep: '继续观察规则变更后的结果。',
    tone: 'border-emerald-100 bg-emerald-50',
  };
}

export default function AdminSchedule() {
  const [rows, setRows] = useState<ScheduleRow[]>(adminScheduleInsights.rows);
  const [weekFilter, setWeekFilter] = useState('2026-04 第1周');
  const [ownerFilter, setOwnerFilter] = useState('全部负责人');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('全部状态');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('全部排班');
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpPageInput, setJumpPageInput] = useState('');
  const [processingRow, setProcessingRow] = useState<ScheduleRow | null>(null);
  const [actionMessage, setActionMessage] = useState('');

  const weeks = ['2026-04 第1周', '2026-04 第2周'];

  const ownerOptions = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.owner))).sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    const keywordText = keyword.trim();

    return rows
      .filter((row) => ownerFilter === '全部负责人' || row.owner === ownerFilter)
      .filter((row) => {
        if (statusFilter === '全部状态') return true;
        if (statusFilter === '待复核') return row.stage.includes('复核') || row.status.includes('待确认');
        return row.stage === '已完成' || row.status === '已校准';
      })
      .filter((row) => {
        if (quickFilter === '全部排班') return true;
        if (quickFilter === '待复核') return row.stage.includes('复核') || row.status.includes('待确认');
        return row.status === '已校准' || row.stage === '已完成';
      })
      .filter((row) => {
        if (!keywordText) return true;
        return [row.department, row.owner, row.status, row.stage, row.detail, row.nextStep].some((item) => item.includes(keywordText));
      })
      .sort((a, b) => {
        const aPending = a.stage.includes('复核') || a.status.includes('待确认');
        const bPending = b.stage.includes('复核') || b.status.includes('待确认');
        if (aPending !== bPending) return aPending ? -1 : 1;
        return a.department.localeCompare(b.department, 'zh-CN');
      });
  }, [keyword, ownerFilter, quickFilter, rows, statusFilter]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentRows = filteredRows.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  const handleRecalculate = () => {
    const keywordText = keyword.trim() ? ` / 关键词：${keyword.trim()}` : '';
    setActionMessage(`已按 ${weekFilter} / ${ownerFilter} / ${statusFilter}${keywordText} 重新计算，共得到 ${filteredRows.length} 条排班记录。`);
  };

  const handleExport = () => {
    downloadCsv(
      `组织排班清单-${weekFilter}.csv`,
      ['周次', '考勤组', '负责人', '状态', '阶段', '详情', '影响范围', '下一步', '处理后回写'],
      filteredRows.map((item) => [weekFilter, item.department, item.owner, item.status, item.stage, item.detail, item.impact, item.nextStep, item.writeback]),
    );
    setActionMessage(`已导出 ${filteredRows.length} 条排班记录。`);
  };

  const handleMarkCalibrated = (row: ScheduleRow) => {
    const nextRow = buildCalibratedRow(row);
    setRows((current) => current.map((item) => (item.department === row.department && item.owner === row.owner ? nextRow : item)));
    setActionMessage(`${row.department} 已标记为已校准，并同步刷新当前结果。`);
  };

  const handleJumpPage = () => {
    const page = Number(jumpPageInput);
    if (!Number.isFinite(page)) return;
    const target = Math.min(totalPages, Math.max(1, Math.floor(page)));
    setCurrentPage(target);
    setJumpPageInput('');
  };

  return (
    <div className="space-y-5">
      {processingRow ? (
        <MobileModalShell
          icon={<Calendar className="h-5 w-5" />}
          eyebrow="考勤组处理面板"
          title={processingRow.department}
          description={`负责人：${processingRow.owner}`}
          onClose={() => setProcessingRow(null)}
          panelClassName="max-w-2xl"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">当前详情</p>
              <p className="mt-2 leading-6">{processingRow.detail}</p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
              <p className="font-semibold">下一步建议</p>
              <p className="mt-2 leading-6">{processingRow.nextStep}</p>
              <p className="mt-2 leading-6">处理后回写：{processingRow.writeback}</p>
            </div>
          </div>
        </MobileModalShell>
      ) : null}

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">排班筛选与结果</h2>
            <p className="mt-2 text-sm text-gray-500">支持按周次、负责人、状态筛选，搜索后可直接导出。</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-1 text-sm text-gray-500">
              <span>周次</span>
              <select
                value={weekFilter}
                onChange={(event) => {
                  setWeekFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-300"
              >
                {weeks.map((week) => (
                  <option key={week} value={week}>{week}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm text-gray-500">
              <span>负责人</span>
              <select
                value={ownerFilter}
                onChange={(event) => {
                  setOwnerFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-300"
              >
                <option value="全部负责人">全部负责人</option>
                {ownerOptions.map((owner) => (
                  <option key={owner} value={owner}>{owner}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm text-gray-500">
              <span>状态</span>
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as StatusFilter);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-300"
              >
                <option value="全部状态">全部状态</option>
                <option value="待复核">待复核</option>
                <option value="已完成">已完成</option>
              </select>
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
              导出班表
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
              placeholder="搜索考勤组 / 负责人 / 状态"
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {quickFilterOptions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setQuickFilter(item);
                setCurrentPage(1);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${quickFilter === item ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {item}
            </button>
          ))}
        </div>

        {actionMessage ? <p className="mt-3 text-sm text-blue-700">{actionMessage}</p> : null}
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1320px] table-fixed border-collapse">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-600">
                <th className="w-40 px-4 py-3">考勤组</th>
                <th className="w-28 px-4 py-3">负责人</th>
                <th className="w-28 px-4 py-3">状态</th>
                <th className="w-24 px-4 py-3">阶段</th>
                <th className="w-64 px-4 py-3">详情</th>
                <th className="w-56 px-4 py-3">影响范围</th>
                <th className="w-56 px-4 py-3">下一步</th>
                <th className="w-56 px-4 py-3">处理后回写</th>
                <th className="w-48 px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.length > 0 ? (
                currentRows.map((row, index) => (
                  <tr key={`${row.department}-${row.owner}-${index}`} className={`${index % 2 === 0 ? 'bg-white' : 'bg-rose-50/30'} border-t border-slate-100`}>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">{row.department}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{row.owner}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.status === '已校准' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{row.stage}</td>
                    <td className="px-4 py-3 text-sm text-slate-600"><p className="line-clamp-2">{row.detail}</p></td>
                    <td className="px-4 py-3 text-sm text-slate-600"><p className="line-clamp-2">{row.impact}</p></td>
                    <td className="px-4 py-3 text-sm text-slate-600"><p className="line-clamp-2">{row.nextStep}</p></td>
                    <td className="px-4 py-3 text-sm text-slate-600"><p className="line-clamp-2">{row.writeback}</p></td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setProcessingRow(row)}
                          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                        >
                          进入处理
                          <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
                        </button>
                        {row.status !== '已校准' ? (
                          <button
                            type="button"
                            onClick={() => handleMarkCalibrated(row)}
                            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                          >
                            标记已校准
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-14 text-center text-sm text-slate-400">当前筛选条件下暂无排班记录</td>
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
  );
}
