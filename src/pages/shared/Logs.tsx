import { useMemo, useState } from 'react';
import { downloadCsv } from '../../utils/downloadCsv';

const logItems = [
  {
    type: '规则修改',
    operator: '李人事',
    time: '2026-04-23 09:12',
    target: '工厂早班模板',
    detail: '将上班容差从 5 分钟调整为 10 分钟，计划 18:00 生效。',
    result: '待生效',
    resultTone: 'bg-amber-50 text-amber-700',
    before: '上班容差 5 分钟，超过即记迟到。',
    after: '上班容差 10 分钟，18:00 后按新规则计算。',
    traces: ['影响范围：工厂机考组', '变更摘要已同步规则中心', '月报导出前需复核一次'],
  },
  {
    type: '审批通过',
    operator: '张主管',
    time: '2026-04-23 10:20',
    target: '张三补卡申请',
    detail: '通过迟到补卡，系统已回写日报和月报结果。',
    result: '已回写',
    resultTone: 'bg-emerald-50 text-emerald-700',
    before: '09:12 打卡，原状态为迟到 12 分钟。',
    after: '补卡通过后转为正常，异常中心和月报同步更新。',
    traces: ['审批人：张主管', '驳回原因为空', '日志中心已留痕'],
  },
  {
    type: '人工修正',
    operator: '王人事',
    time: '2026-04-22 19:45',
    target: '直营二店月报异常',
    detail: '批量修正 3 名员工的外勤说明状态，并补充日志备注。',
    result: '已完成',
    resultTone: 'bg-blue-50 text-blue-700',
    before: '3 名员工外勤记录缺少业务说明，月报仍显示待确认。',
    after: '补充说明后已按外勤口径入月报，并记录修正原因。',
    traces: ['批量对象：3 人', '修正原因：现场说明补录', '导出前再次确认'],
  },
];

const traceRules = [
  '规则改动必须记录操作人、时间、变更前后差异。',
  '补卡审批需要保留审批链路和驳回原因。',
  '人工修正必须说明原因，支持后续回溯。',
  '月报导出前后的确认动作建议写入日志。',
];

const closeLoopCases = [
  {
    title: '审批通过后',
    desc: '至少记录审批人、审批时间、回写范围和最终结果。',
  },
  {
    title: '人工改口径时',
    desc: '必须保留变更原因、变更前后和影响对象，避免月底追不回来。',
  },
  {
    title: '导出月报前后',
    desc: '建议把导出人、导出时间和复核动作一并写入日志。',
  },
];

export default function LogsPage() {
  const [typeFilter, setTypeFilter] = useState('全部操作类型');
  const [targetKeyword, setTargetKeyword] = useState('');
  const [operatorKeyword, setOperatorKeyword] = useState('');
  const [timeKeyword, setTimeKeyword] = useState('');
  const [exportMessage, setExportMessage] = useState('');

  const filteredLogs = useMemo(() => {
    return logItems.filter((item) => {
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
              <option>全部操作类型</option>
              <option>规则修改</option>
              <option>审批通过</option>
              <option>人工修正</option>
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

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
            <h3 className="text-lg font-semibold text-slate-900">留痕要求</h3>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              {traceRules.map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
            <h3 className="text-lg font-semibold text-slate-900">推荐写入日志的闭环动作</h3>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              {closeLoopCases.map((item) => (
                <div key={item.title} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-2 leading-6 text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
