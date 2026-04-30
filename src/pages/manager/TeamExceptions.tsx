import { useMemo, useState } from 'react';
import { Download, RotateCcw, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

import { managerExceptionInsights } from '../../data/attendanceInsights';
import { downloadCsv } from '../../utils/downloadCsv';

type ExceptionItem = (typeof managerExceptionInsights.items)[number];
type StatusFilter = '全部状态' | '待处理' | '已闭环';

const typeOptions = ['全部异常', ...Array.from(new Set(managerExceptionInsights.items.map((item) => item.type)))];

function buildKey(item: ExceptionItem) {
  return `${item.name}-${item.type}-${item.date}`;
}

export default function ManagerTeamExceptions() {
  const [rows, setRows] = useState<ExceptionItem[]>(managerExceptionInsights.items);
  const [keyword, setKeyword] = useState('');
  const [monthFilter, setMonthFilter] = useState('全部月份');
  const [activeType, setActiveType] = useState('全部异常');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('全部状态');
  const [onlyUrgent, setOnlyUrgent] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpPageInput, setJumpPageInput] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [showExplosionAlert, setShowExplosionAlert] = useState(true);

  const urgentCount = rows.filter((item) => item.urgent).length;

  const monthOptions = useMemo(() => {
    return Array.from(new Set(rows.map((item) => item.date.slice(0, 7)))).sort((a, b) => (a < b ? 1 : -1));
  }, [rows]);

  const filteredRows = useMemo(() => {
    const keywordText = keyword.trim().toLowerCase();

    return rows
      .filter((item) => monthFilter === '全部月份' || item.date.startsWith(monthFilter))
      .filter((item) => activeType === '全部异常' || item.type === activeType)
      .filter((item) => {
        if (statusFilter === '全部状态') return true;
        if (statusFilter === '待处理') return item.urgent;
        return !item.urgent;
      })
      .filter((item) => !onlyUrgent || item.urgent)
      .filter((item) => {
        if (!keywordText) return true;
        return [item.name, item.department, item.type, item.detail].some((part) => part.toLowerCase().includes(keywordText));
      })
      .sort((a, b) => {
        if (a.urgent !== b.urgent) return Number(b.urgent) - Number(a.urgent);
        return a.date < b.date ? 1 : -1;
      });
  }, [activeType, keyword, monthFilter, onlyUrgent, rows, statusFilter]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentRows = filteredRows.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  const handleRecalculate = () => {
    const keywordText = keyword.trim() ? ` / 关键词：${keyword.trim()}` : '';
    setActionMessage(`已按 ${monthFilter} / ${activeType} / ${statusFilter}${keywordText} 重新计算，共得到 ${filteredRows.length} 条团队异常。`);
  };

  const handleExport = () => {
    downloadCsv(
      '主管团队异常明细.csv',
      ['姓名', '部门', '异常类型', '风险', '日期', '状态', '异常详情', '建议动作'],
      filteredRows.map((item) => [
        item.name,
        item.department,
        item.type,
        item.urgent ? '高' : '低',
        item.date,
        item.urgent ? '待处理' : '已闭环',
        item.detail,
        item.actionText,
      ]),
    );
    setActionMessage(`已导出 ${filteredRows.length} 条团队异常记录。`);
  };

  const handleCloseLoop = (target: ExceptionItem) => {
    setRows((current) =>
      current.map((item) =>
        buildKey(item) === buildKey(target)
          ? {
              ...item,
              urgent: false,
              actionText: '已闭环',
              detail: `${item.detail} 当前已完成主管闭环处理。`,
            }
          : item,
      ),
    );
    setActionMessage(`${target.name} 的异常已标记闭环并刷新列表。`);
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
      {showExplosionAlert && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-5 shadow-2xl">
            <div className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">【爆红】异常提醒</div>
            <p className="mt-4 text-base font-semibold text-slate-900">今日有 {urgentCount} 条高风险异常，请优先处理。</p>
            <p className="mt-2 text-sm text-slate-500">建议先处理审批中、缺卡待确认与地点待核实异常。</p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowExplosionAlert(false)}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5 p-4 pb-20">
        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">团队异常筛选与结果</h2>
              <p className="mt-2 text-sm text-gray-500">支持按月份、异常类型、状态筛选，搜索后可直接导出。</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="space-y-1 text-sm text-gray-500">
                <span>月份</span>
                <select
                  value={monthFilter}
                  onChange={(event) => {
                    setMonthFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-300"
                >
                  <option value="全部月份">全部月份</option>
                  {monthOptions.map((month) => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm text-gray-500">
                <span>异常类型</span>
                <select
                  value={activeType}
                  onChange={(event) => {
                    setActiveType(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-300"
                >
                  {typeOptions.map((item) => (
                    <option key={item} value={item}>{item}</option>
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
                  <option value="待处理">待处理</option>
                  <option value="已闭环">已闭环</option>
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
                导出异常
              </button>
              <button
                type="button"
                onClick={() => {
                  setOnlyUrgent((current) => !current);
                  setCurrentPage(1);
                }}
                className={`inline-flex items-center rounded-xl border px-4 py-2 text-sm font-semibold transition ${onlyUrgent ? 'border-red-200 bg-red-50 text-red-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              >
                {onlyUrgent ? '仅看高风险中' : '仅看高风险'}
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
                placeholder="搜索成员姓名 / 异常类型"
              />
            </div>
          </div>

          {actionMessage ? <p className="mt-3 text-sm text-blue-700">{actionMessage}</p> : null}
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1180px] table-fixed border-collapse">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-600">
                  <th className="w-24 px-4 py-3">姓名</th>
                  <th className="w-44 px-4 py-3">部门</th>
                  <th className="w-28 px-4 py-3">异常类型</th>
                  <th className="w-20 px-4 py-3">风险</th>
                  <th className="w-28 px-4 py-3">日期</th>
                  <th className="w-24 px-4 py-3">状态</th>
                  <th className="px-4 py-3">异常详情</th>
                  <th className="w-44 px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((item, index) => (
                    <tr key={buildKey(item)} className={`${index % 2 === 0 ? 'bg-white' : 'bg-rose-50/30'} border-t border-slate-100`}>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{item.department}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{item.type}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.urgent ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {item.urgent ? '高' : '低'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{item.date}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.urgent ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {item.urgent ? '待处理' : '已闭环'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <p className="line-clamp-2">{item.detail}</p>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Link
                            to={item.actionTo}
                            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                          >
                            {item.actionText}
                          </Link>
                          {item.urgent ? (
                            <button
                              type="button"
                              onClick={() => handleCloseLoop(item)}
                              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                            >
                              标记闭环
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-14 text-center text-sm text-slate-400">当前筛选条件下暂无团队异常记录</td>
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
