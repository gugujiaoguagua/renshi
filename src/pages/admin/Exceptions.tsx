import { useMemo, useState } from 'react';
import { AlertCircle, Download, RotateCcw, Search } from 'lucide-react';
import MobileModalShell from '../../components/mobile/MobileModalShell';
import { adminExceptionInsights } from '../../data/attendanceInsights';
import { downloadCsv } from '../../utils/downloadCsv';

type FilterType = '全部异常' | '高风险' | '待审批' | '待修正' | '已闭环';
type StatusFilter = '全部状态' | '待处理' | '已闭环';
type ExceptionRow = (typeof adminExceptionInsights.rows)[number];

const quickFilterOptions: FilterType[] = ['全部异常', '高风险', '待审批', '待修正', '已闭环'];

function buildClosedRow(row: ExceptionRow): ExceptionRow {
  return {
    ...row,
    status: '已闭环',
    risk: '低',
    detail: `${row.detail} 当前已进入人事复核完成状态，并同步回写异常中心。`,
    tone: 'border-emerald-100 bg-emerald-50',
  };
}

export default function AdminExceptions() {
  const [rows, setRows] = useState<ExceptionRow[]>(adminExceptionInsights.rows);
  const [monthFilter, setMonthFilter] = useState('全部月份');
  const [departmentFilter, setDepartmentFilter] = useState('全部部门');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('全部状态');
  const [quickFilter, setQuickFilter] = useState<FilterType>('全部异常');
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpPageInput, setJumpPageInput] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [detailRow, setDetailRow] = useState<ExceptionRow | null>(null);


  const monthOptions = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.date.slice(0, 7)))).sort((a, b) => (a < b ? 1 : -1));
  }, [rows]);

  const departmentOptions = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.department))).sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    const keywordText = keyword.trim();

    return rows
      .filter((row) => monthFilter === '全部月份' || row.date.startsWith(monthFilter))
      .filter((row) => departmentFilter === '全部部门' || row.department === departmentFilter)
      .filter((row) => {
        if (statusFilter === '全部状态') return true;
        if (statusFilter === '已闭环') return row.status === '已闭环';
        return row.status !== '已闭环';
      })
      .filter((row) => {
        if (quickFilter === '全部异常') return true;
        if (quickFilter === '高风险') return row.risk === '高';
        if (quickFilter === '待审批') return row.status.includes('审批');
        if (quickFilter === '待修正') return row.status.includes('修正') || row.status.includes('核实') || row.status.includes('复核');
        return row.status === '已闭环';
      })
      .filter((row) => {
        if (!keywordText) return true;
        return [row.employee, row.code, row.department, row.type, row.detail, row.status].some((item) => item.includes(keywordText));
      })
      .sort((a, b) => {
        if (a.risk !== b.risk) return a.risk === '高' ? -1 : 1;
        return a.date < b.date ? 1 : -1;
      });
  }, [departmentFilter, keyword, monthFilter, quickFilter, rows, statusFilter]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentRows = filteredRows.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  const handleRecalculate = () => {
    const keywordText = keyword.trim() ? ` / 关键词：${keyword.trim()}` : '';
    setActionMessage(`已按 ${monthFilter} / ${departmentFilter} / ${statusFilter}${keywordText} 重新计算，共得到 ${filteredRows.length} 条异常记录。`);
  };

  const handleExport = () => {
    downloadCsv(
      '人事异常中心-异常记录.csv',
      ['姓名', '工号', '部门', '异常类型', '状态', '风险', '日期', '详情'],
      filteredRows.map((row) => [row.employee, row.code, row.department, row.type, row.status, row.risk, row.date, row.detail]),
    );
    setActionMessage(`已导出 ${filteredRows.length} 条异常记录。`);
  };

  const handleCloseLoop = (row: ExceptionRow) => {
    const nextRow = buildClosedRow(row);
    setRows((current) => current.map((item) => (item.code === row.code && item.type === row.type && item.date === row.date ? nextRow : item)));
    setActionMessage(`${row.employee} 的异常已标记闭环，并同步刷新当前结果。`);
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
      {detailRow ? (
        <MobileModalShell
          icon={<AlertCircle className="h-5 w-5" />}
          eyebrow="异常日明细"
          title={`${detailRow.employee} · ${detailRow.type}`}
          onClose={() => setDetailRow(null)}
          panelClassName="max-w-2xl"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">异常详情</p>
              <p className="mt-2 leading-6">{detailRow.detail}</p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
              <p className="font-semibold">当前状态</p>
              <p className="mt-2 leading-6">{detailRow.status} · 风险 {detailRow.risk}</p>
              <p className="mt-2 leading-6">日期：{detailRow.date}</p>
              <p className="mt-2 leading-6">部门：{detailRow.department}</p>
            </div>
          </div>
        </MobileModalShell>
      ) : null}

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">异常筛选与结果</h2>
            <p className="mt-2 text-sm text-gray-500">支持异常中心按月份、部门、状态筛选，搜索后可直接导出。</p>
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
              <span>组织/部门</span>
              <select
                value={departmentFilter}
                onChange={(event) => {
                  setDepartmentFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-300"
              >
                <option value="全部部门">全部部门</option>
                {departmentOptions.map((department) => (
                  <option key={department} value={department}>{department}</option>
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
              placeholder="搜索人名 / 工号 / 异常类型"
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
          <table className="min-w-[1160px] table-fixed border-collapse">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-600">
                <th className="w-28 px-4 py-3">姓名</th>
                <th className="w-24 px-4 py-3">工号</th>
                <th className="w-40 px-4 py-3">部门</th>
                <th className="w-32 px-4 py-3">异常类型</th>
                <th className="w-28 px-4 py-3">状态</th>
                <th className="w-20 px-4 py-3">风险</th>
                <th className="w-28 px-4 py-3">日期</th>
                <th className="px-4 py-3">异常详情</th>
                <th className="w-40 px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.length > 0 ? (
                currentRows.map((row, index) => (
                  <tr key={`${row.code}-${row.type}-${row.date}-${index}`} className={`${index % 2 === 0 ? 'bg-white' : 'bg-rose-50/30'} border-t border-slate-100`}>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">{row.employee}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{row.code}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{row.department}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{row.type}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.status === '已闭环' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.risk === '高' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {row.risk}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{row.date}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      <p className="line-clamp-2">{row.detail}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDetailRow(row)}
                          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                        >
                          日明细
                        </button>
                        {row.status !== '已闭环' ? (
                          <button
                            type="button"
                            onClick={() => handleCloseLoop(row)}
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
                  <td colSpan={9} className="px-4 py-14 text-center text-sm text-slate-400">当前筛选条件下暂无异常记录</td>
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
