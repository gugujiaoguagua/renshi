import { useMemo, useState } from 'react';
import { downloadCsv } from '../../utils/downloadCsv';
import { logInsights } from '../../data/attendanceInsights';

export default function LogsPage() {
  const [typeFilter, setTypeFilter] = useState('全部操作类型');
  const [targetKeyword, setTargetKeyword] = useState('');
  const [operatorKeyword, setOperatorKeyword] = useState('');
  const [timeKeyword, setTimeKeyword] = useState('');
  const [exportMessage, setExportMessage] = useState('');

  const typeOptions = ['全部操作类型', ...Array.from(new Set(logInsights.items.map((item) => item.type)))];

  const filteredLogs = useMemo(() => {
    return logInsights.items.filter((item) => {
      const matchType = typeFilter === '全部操作类型' || item.type === typeFilter;
      const matchTarget = !targetKeyword || item.target.includes(targetKeyword);
      const matchOperator = !operatorKeyword || item.operator.includes(operatorKeyword);
      const matchTime = !timeKeyword || item.time.includes(timeKeyword);
      return matchType && matchTarget && matchOperator && matchTime;
    });
  }, [operatorKeyword, targetKeyword, timeKeyword, typeFilter]);

  const handleExport = () => {
    downloadCsv(
      '操作日志.csv',
      ['操作类型', '操作对象', '操作人', '时间', '结果', '详情'],
      filteredLogs.map((item) => [item.type, item.target, item.operator, item.time, item.result, item.detail]),
    );
    setExportMessage(`已导出 ${filteredLogs.length} 条日志记录。`);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="grid gap-4 md:grid-cols-4 xl:flex xl:flex-wrap">
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
            >
              {typeOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <input
              value={targetKeyword}
              onChange={(event) => setTargetKeyword(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              placeholder="搜索操作对象"
            />
            <input
              value={operatorKeyword}
              onChange={(event) => setOperatorKeyword(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              placeholder="操作人"
            />
            <input
              value={timeKeyword}
              onChange={(event) => setTimeKeyword(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              placeholder="时间范围"
            />
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            导出日志
          </button>
        </div>
        {exportMessage ? <p className="mt-4 text-sm text-emerald-600">{exportMessage}</p> : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr,0.92fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-900">最近操作</h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{filteredLogs.length} 条结果</span>
          </div>
          <div className="mt-5 space-y-4">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((item) => (
                <div key={`${item.time}-${item.target}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">{item.type}</p>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.resultTone}`}>{item.result}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{item.target}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">{item.time}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.detail}</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs text-slate-500">变更前</p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">{item.before}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs text-slate-500">变更后</p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">{item.after}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.traces.map((trace) => (
                      <span key={trace} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                        {trace}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-slate-500">操作人：{item.operator}</p>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-400">
                当前筛选条件下暂无日志记录
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
