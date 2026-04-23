import { AlertTriangle, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const days = ['一 20', '二 21', '三 22', '四 23', '五 24', '六 25', '日 26'];
const teamRows = [
  {
    name: '王小明',
    role: '前端开发',
    total: '40h',
    warn: false,
    shifts: ['早班', '早班', '早班', '早班', '早班', '休息', '休息'],
  },
  {
    name: '李大华',
    role: '测试工程师',
    total: '24h',
    warn: true,
    shifts: ['晚班', '晚班', '晚班', '待排班', '待排班', '休息', '休息'],
  },
  {
    name: '陈晓静',
    role: '门店主管',
    total: '32h',
    warn: false,
    shifts: ['中班', '中班', '中班', '中班', '休息', '休息', '休息'],
  },
];

function getShiftStyle(shift: string) {
  if (shift === '早班') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (shift === '晚班') return 'bg-purple-50 text-purple-700 border-purple-200';
  if (shift === '中班') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (shift === '待排班') return 'bg-red-50 text-red-700 border-red-200 border-dashed';
  return 'bg-white text-slate-400 border-slate-200';
}

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">排班完成率</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">93%</p>
          <p className="mt-2 text-sm text-slate-500">统一系统里，主管与人事看的是同一张排班数据表。</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">未排班人员</p>
          <p className="mt-3 text-3xl font-semibold text-red-600">2 人</p>
          <p className="mt-2 text-sm text-slate-500">未排班会直接影响日报和月报的判定准确性。</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">待发布调整</p>
          <p className="mt-3 text-3xl font-semibold text-blue-600">1 批</p>
          <p className="mt-2 text-sm text-slate-500">支持按周、按月和批量套班，适配手机与电脑不同操作密度。</p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">排班管理</h3>
            <p className="mt-1 text-sm text-slate-500">手机端保留快速查看和补齐入口，电脑端展开批量排班和冲突校验。</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <button className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 font-medium text-slate-700">
              技术二组 <ChevronDown className="ml-2 h-4 w-4" />
            </button>
            <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-2 py-1 text-slate-500">
              <button className="rounded-xl p-2 transition hover:bg-white"><ChevronLeft className="h-4 w-4" /></button>
              <span className="px-3 font-medium text-slate-700">2026 年 4 月第 4 周</span>
              <button className="rounded-xl p-2 transition hover:bg-white"><ChevronRight className="h-4 w-4" /></button>
            </div>
            <div className="inline-flex rounded-2xl bg-slate-100 p-1">
              <button className="rounded-2xl bg-white px-4 py-2 font-medium text-slate-900 shadow-sm">按周</button>
              <button className="rounded-2xl px-4 py-2 font-medium text-slate-500">按月</button>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <div className="min-w-[920px]">
            <div className="grid grid-cols-[220px_repeat(7,minmax(84px,1fr))] gap-2 px-1 text-center text-xs font-semibold text-slate-500">
              <div className="text-left">人员 / 日期</div>
              {days.map((day) => (
                <div key={day} className="rounded-2xl bg-slate-50 px-2 py-3">{day}</div>
              ))}
            </div>

            <div className="mt-3 space-y-3">
              {teamRows.map((row) => (
                <div key={row.name} className="grid grid-cols-[220px_repeat(7,minmax(84px,1fr))] gap-2">
                  <div className={`rounded-3xl border p-4 ${row.warn ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{row.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{row.role}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{row.total}</span>
                    </div>
                    {row.warn ? (
                      <p className="mt-3 flex items-center gap-1 text-xs font-medium text-amber-700">
                        <AlertTriangle className="h-4 w-4" />
                        存在未排班
                      </p>
                    ) : null}
                  </div>

                  {row.shifts.map((shift, index) => (
                    <button
                      key={`${row.name}-${days[index]}`}
                      className={`rounded-3xl border px-3 py-4 text-center text-sm font-medium transition hover:-translate-y-0.5 ${getShiftStyle(shift)}`}
                    >
                      {shift}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">发布前检查</p>
            <p className="mt-1 text-sm text-slate-500">李大华与门店值班组仍有 2 个待排班格子，建议先补齐再发布。</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
              批量套班
            </button>
            <button className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
              发布排班
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
