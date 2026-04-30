import { useState } from 'react';
import { AlertCircle, CheckSquare, Clock, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { employeeMonthlyInsights } from '../../data/attendanceInsights';

const confirmationTimeline = [
  {
    title: '月底异常提醒',
    time: '月结前 3 天',
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
  const navigate = useNavigate();
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const handleConfirm = () => {
    setHasConfirmed(true);
    setActionMessage('本月考勤结果已确认，系统会锁定当前月报口径并保留确认留痕。');
  };

  const handleContinue = () => {
    setActionMessage('已为你保留当前月报状态，继续去异常中心处理未闭环记录。');
    navigate('/employee/exceptions');
  };

  const unresolvedCount = employeeMonthlyInsights.detailRows.filter((item) => item.status !== '已回写').length;

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 p-5 text-white shadow-[0_18px_40px_rgba(37,99,235,0.24)]">
        <p className="text-sm text-blue-100">员工月度确认</p>
        <h1 className="mt-2 text-2xl font-semibold">月底先看结果，再确认是否还有异常未闭环</h1>
        <p className="mt-3 text-sm leading-6 text-blue-50/90">
          当前使用第三阶段 100 人测试集里的员工月报样板，重点验证“审批中不直接算通过、日报和月报能对上”。
        </p>
      </section>

      {actionMessage ? (
        <section className={`rounded-3xl border p-4 shadow-sm ${hasConfirmed ? 'border-emerald-100 bg-emerald-50 text-emerald-900' : 'border-blue-100 bg-blue-50 text-blue-900'}`}>
          <p className="text-sm font-semibold">操作已生效</p>
          <p className="mt-2 text-sm leading-6 opacity-90">{actionMessage}</p>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {employeeMonthlyInsights.summaryCards.map((item) => (
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
              <p className="text-sm font-semibold">{hasConfirmed ? '本月结果已确认' : `还有 ${unresolvedCount} 条记录待继续确认`}</p>
              <p className="mt-2 text-sm leading-6 text-red-800">
                {hasConfirmed
                  ? '当前结果已经锁定；如果后续还有争议，可以继续去异常中心补充说明并保留日志。'
                  : employeeMonthlyInsights.pendingText}
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
            {employeeMonthlyInsights.detailRows.map((item) => (
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
              <div className="rounded-2xl bg-slate-50 p-4">确认前先检查缺卡、迟到、地点异常、请假和审批中记录是否都已闭环。</div>
              <div className="rounded-2xl bg-slate-50 p-4">审批中的申请会继续显示在这页，避免员工月底完全感知不到结果。</div>
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
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                {hasConfirmed ? '已确认本月考勤结果' : '确认本月考勤结果'}
              </button>
              <button
                type="button"
                onClick={handleContinue}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
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
