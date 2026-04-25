import { AlertCircle, CheckSquare, Clock, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const summaryCards = [
  { label: '应出勤天数', value: '22 天', tone: 'text-slate-900' },
  { label: '实际出勤', value: '21.5 天', tone: 'text-emerald-600' },
  { label: '未闭环异常', value: '2 条', tone: 'text-red-600' },
  { label: '待确认状态', value: '本月待确认', tone: 'text-blue-600' },
];

const detailRows = [
  {
    date: '2026-04-14',
    type: '迟到 12 分钟',
    status: '已回写',
    note: '主管已通过补卡申请，本条会同步进入最终月报。',
    tone: 'border-emerald-100 bg-emerald-50',
  },
  {
    date: '2026-04-19',
    type: '下班缺卡',
    status: '待处理',
    note: '若月底前仍未处理，可能影响最终确认结果。',
    tone: 'border-red-100 bg-red-50',
  },
  {
    date: '2026-04-28',
    type: '出差申请同步中',
    status: '审批中',
    note: '出差申请已提交，等待主管确认后计入月报。',
    tone: 'border-amber-100 bg-amber-50',
  },
];

const confirmationTimeline = [
  {
    title: '月底异常提醒',
    time: '每月 30 / 31 日',
    desc: '系统会提醒先处理异常，并给主管预留审批时间。',
    tone: 'border-amber-100 bg-amber-50',
  },
  {
    title: '次月结果确认',
    time: '次月 1 - 2 日',
    desc: '员工查看月报结果后确认；超时会按默认确认处理。',
    tone: 'border-blue-100 bg-blue-50',
  },
  {
    title: '超时自动闭环',
    time: '次月 2 日 18:00 后',
    desc: '未确认记录自动转为默认确认，并保留日志留痕供人事复核。',
    tone: 'border-emerald-100 bg-emerald-50',
  },
];

export default function EmployeeMonthlySummary() {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 p-5 text-white shadow-[0_18px_40px_rgba(37,99,235,0.24)]">
        <p className="text-sm text-blue-100">员工月度确认</p>
        <h1 className="mt-2 text-2xl font-semibold">月底先看结果，再确认是否还有异常未闭环</h1>
        <p className="mt-3 text-sm leading-6 text-blue-50/90">
          第二阶段沟通里明确提到月底异常提醒和次月结果确认，这里补回员工月度确认页，让员工不只看到日常打卡，还能看到本月最终结果。
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className={`mt-4 text-3xl font-semibold ${item.tone}`}>{item.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-red-100 bg-red-50 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3 text-red-900">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-semibold">还有 1 条异常未闭环</p>
              <p className="mt-2 text-sm leading-6 text-red-800">
                次月 2 号前请完成异常处理并确认月度结果，超时会按默认确认处理。
              </p>
            </div>
          </div>
          <Link
            to="/employee/exceptions"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:-translate-y-0.5 hover:shadow-sm"
          >
            先去处理异常
          </Link>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900">
            <FileText className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">本月结果明细</h2>
          </div>
          <div className="mt-4 space-y-3">
            {detailRows.map((item) => (
              <div key={`${item.date}-${item.type}`} className={`rounded-2xl border p-4 ${item.tone}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.date} · {item.type}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.note}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900">
              <CheckSquare className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold">确认前检查</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-4">确认前先检查缺卡、迟到、出差、外勤和请假是否都已闭环。</div>
              <div className="rounded-2xl bg-slate-50 p-4">审批中的申请会显示在这页，避免员工月底完全感知不到结果。</div>
              <div className="rounded-2xl bg-slate-50 p-4">如仍有争议，可先去异常中心处理，再回来确认。</div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">提醒节奏</h2>
            </div>
            <div className="mt-4 space-y-3">
              {confirmationTimeline.map((item) => (
                <div key={item.title} className={`rounded-2xl border p-4 ${item.tone}`}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900">
              <Clock className="h-5 w-5 text-slate-500" />
              <h2 className="text-lg font-semibold">确认动作</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <button className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                确认本月考勤结果
              </button>
              <button className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                暂不确认，继续处理异常
              </button>
              <p className="text-xs leading-5 text-slate-400">确认后会立即锁定本月结果并保留日志留痕；若仍有争议，可先回异常中心继续处理后再确认。</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
