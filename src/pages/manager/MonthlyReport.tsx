import { useMemo, useState } from 'react';
import { AlertCircle, ArrowRight, CheckSquare, FileText, Filter, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const summaryCards = [
  { label: '团队人数', value: '31 人', tone: 'text-slate-900' },
  { label: '已确认月报', value: '24 人', tone: 'text-emerald-600' },
  { label: '未闭环异常', value: '5 条', tone: 'text-red-600' },
  { label: '待主管跟进', value: '3 项', tone: 'text-blue-600' },
];

const reportRows = [
  {
    name: '张三',
    post: '技术二组 · 前端开发',
    attendance: '21.5 天',
    abnormal: '0',
    fieldFlow: '0 / 0 / 0.5 天',
    status: '已确认',
    note: '本月结果正常，可直接纳入团队月报。',
    tone: 'border-emerald-100 bg-emerald-50',
    scope: '技术二组',
  },
  {
    name: '李四',
    post: '技术二组 · 测试工程师',
    attendance: '20.5 天',
    abnormal: '1 条缺卡',
    fieldFlow: '0 / 1 / 0',
    status: '待处理',
    note: '仍有下班缺卡未闭环，需要主管跟进审批。',
    tone: 'border-red-100 bg-red-50',
    scope: '技术二组',
  },
  {
    name: '直营二店',
    post: '门店汇总',
    attendance: '整体 92%',
    abnormal: '2 人未确认',
    fieldFlow: '3 / 2 / 1',
    status: '待复核',
    note: '店长可查看门店维度月报，和人事月报中心保持同口径。',
    tone: 'border-blue-100 bg-blue-50',
    scope: '直营二店',
  },
];

const closeLoopSteps = [
  {
    title: '先补异常',
    desc: '缺卡、调班、自选班次审批通过后，团队月报会实时刷新。',
  },
  {
    title: '再看员工确认',
    desc: '次月 1 - 2 日员工确认结果会同步到主管视角，未确认按默认确认展示。',
  },
  {
    title: '最后留痕导出',
    desc: '主管补充的门店说明和人工复核结果会写入日志，方便人事复盘。',
  },
];

const links = [
  { title: '去补卡审批', desc: '审批通过后，团队月报会同步更新。', to: '/manager/approval' },
  { title: '去看团队异常', desc: '先把高风险异常闭环，再确认月报。', to: '/manager/team-exceptions' },
  { title: '去补排班', desc: '排班缺失会直接影响团队月报口径。', to: '/manager/schedule' },
];

export default function ManagerMonthlyReport() {
  const [activeScope, setActiveScope] = useState<'技术二组' | '直营二店'>('技术二组');

  const [selectedRow, setSelectedRow] = useState<(typeof reportRows)[number] | null>(null);
  const [actionMessage, setActionMessage] = useState('');

  const visibleRows = useMemo(() => reportRows.filter((item) => item.scope === activeScope), [activeScope]);

  const handleToggleScope = () => {
    const nextScope = activeScope === '技术二组' ? '直营二店' : '技术二组';
    setActiveScope(nextScope);
    setActionMessage(`已切换到 ${nextScope} 的月报视角，当前列表已按团队范围刷新。`);
  };

  return (
    <div className="space-y-6">
      {selectedRow ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.24)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-blue-600">月报明细</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">{selectedRow.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{selectedRow.post}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRow(null)}
                className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-500 transition hover:bg-slate-50"
              >
                关闭
              </button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">月报摘要</p>
                <p className="mt-2 leading-6">出勤：{selectedRow.attendance}</p>
                <p className="leading-6">异常：{selectedRow.abnormal}</p>
                <p className="leading-6">外勤 / 出差 / 请假：{selectedRow.fieldFlow}</p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                <p className="font-semibold">当前说明</p>
                <p className="mt-2 leading-6">{selectedRow.note}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <section className="rounded-[32px] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 text-white shadow-[0_20px_50px_rgba(59,130,246,0.22)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-blue-100">主管团队月报</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">团队 / 门店月报现在同步给主管查看</h1>
            <p className="mt-3 text-sm leading-6 text-blue-50/90">
              第二阶段沟通里明确提到主管不能只看自己的功能，还要看到本团队 / 门店的月度汇总。这里补上主管月报入口，口径与人事端保持一致，但权限只到团队范围。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleToggleScope}
              className="inline-flex items-center rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
            >
              <Filter className="mr-2 h-4 w-4" />
              切换月份 / 门店
            </button>
            <button
              type="button"
              onClick={() => setSelectedRow(visibleRows[0] ?? null)}
              className="inline-flex items-center rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
            >
              <FileText className="mr-2 h-4 w-4" />
              查看月报明细
            </button>
          </div>
        </div>
      </section>

      {actionMessage ? (
        <section className="rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900 shadow-sm">
          <p className="font-semibold">筛选已切换</p>
          <p className="mt-2 leading-6">{actionMessage}</p>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className={`mt-4 text-3xl font-semibold ${item.tone}`}>{item.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 text-slate-900">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">团队月报结果</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">当前范围：{activeScope}</span>
          </div>
          <div className="mt-4 space-y-3">
            {visibleRows.map((item) => (
              <button
                key={`${item.name}-${item.status}`}
                type="button"
                onClick={() => setSelectedRow(item)}
                className={`block w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${item.tone}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.post}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
                      <span className="rounded-full bg-white px-3 py-1">出勤：{item.attendance}</span>
                      <span className="rounded-full bg-white px-3 py-1">异常：{item.abnormal}</span>
                      <span className="rounded-full bg-white px-3 py-1">外勤 / 出差 / 请假：{item.fieldFlow}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{item.note}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">{item.status}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
            <div className="flex items-start gap-3 text-amber-900">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <h2 className="text-sm font-semibold">主管查看范围说明</h2>
                <p className="mt-2 text-sm leading-6 text-amber-800">
                  主管端和人事端使用同一套月报口径，但这里只看当前团队 / 门店，不显示全公司数据。
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900">
              <CheckSquare className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold">确认与回写节奏</h2>
            </div>
            <div className="mt-4 space-y-3">
              {closeLoopSteps.map((item) => (
                <div key={item.title} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900">
              <CheckSquare className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold">关联动作</h2>
            </div>
            <div className="mt-4 space-y-3">
              {links.map((item) => (
                <Link key={item.title} to={item.to} className="group block rounded-2xl bg-slate-50 p-4 transition hover:bg-blue-50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{item.desc}</p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 text-blue-600 transition group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
