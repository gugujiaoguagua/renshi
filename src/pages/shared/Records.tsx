import { AlertCircle, ArrowRight, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const summaryCards = [
  { label: '本月出勤', value: '18.5 天', desc: '日报和月报口径保持一致，可继续穿透到日明细。', tone: 'text-slate-900' },
  { label: '异常记录', value: '2 条', desc: '缺卡、迟到、外勤待确认都会在这里沉淀。', tone: 'text-red-600' },
  { label: '待审批回写', value: '1 条', desc: '补卡审批尚未完成时，会先保持待处理状态。', tone: 'text-amber-600' },
  { label: '定位场景', value: '3 类', desc: '总部、门店、外勤 / 出差定位均已纳入一套结果。', tone: 'text-slate-900' },
];

const records = [
  {
    date: '04-23 周四',
    shift: '朝 9 晚 6 · 09:00 - 18:00',
    status: '异常未闭环',
    statusTone: 'bg-amber-100 text-amber-800',
    syncStatus: '待进入月报',
    syncTone: 'bg-white text-amber-700',
    reason: '下班缺卡，已生成补卡待办。',
    trace: '依据朝 9 晚 6 规则 V3.2、总部园区定位和昨日补卡申请状态判定。',
    actions: [
      { label: '去补卡', to: '/employee/exceptions' },
      { label: '查看月度确认', to: '/employee/monthly-summary' },
    ],
    entries: [
      { label: '上班', value: '08:55', status: '正常', detail: '总部园区 · 已同步今日出勤' },
      { label: '外出', value: '12:20', status: '已同步月报', detail: '客户拜访 · 与外出申请一致' },
      { label: '下班', value: '--:--', status: '待打卡', detail: '18:00 缺卡，等待补充说明' },
    ],
    tone: 'border-amber-200 bg-amber-50',
  },
  {
    date: '04-22 周三',
    shift: '门店晚班 · 14:00 - 22:00',
    status: '已闭环',
    statusTone: 'bg-emerald-100 text-emerald-800',
    syncStatus: '已同步月报',
    syncTone: 'bg-white text-emerald-700',
    reason: '当日打卡完整，已直接进入月报统计。',
    trace: '依据门店晚班规则 V2.7、门店固定定位和正常上下班记录判定。',
    actions: [
      { label: '查看异常中心', to: '/employee/exceptions' },
      { label: '查看月度确认', to: '/employee/monthly-summary' },
    ],
    entries: [
      { label: '上班', value: '13:57', status: '正常', detail: '门店前台定位 · 提前 3 分钟' },
      { label: '下班', value: '22:06', status: '正常', detail: '门店前台定位 · 已完成当日闭环' },
    ],
    tone: 'border-slate-200 bg-white',
  },
  {
    date: '04-21 周二',
    shift: '朝 9 晚 6 · 09:00 - 18:00',
    status: '已审批修正',
    statusTone: 'bg-blue-100 text-blue-800',
    syncStatus: '已重算',
    syncTone: 'bg-white text-blue-700',
    reason: '上午迟到 12 分钟，补充交通故障说明后已审批通过。',
    trace: '审批通过后自动回写记录、月报汇总和日志中心。',
    actions: [
      { label: '查看异常中心', to: '/employee/exceptions' },
      { label: '查看月度确认', to: '/employee/monthly-summary' },
    ],
    entries: [
      { label: '上班', value: '09:12', status: '迟到 12 分钟', detail: '审批后保留原始时间并标记修正来源' },
      { label: '下班', value: '18:08', status: '正常', detail: '已按修正规则重新计算当日结果' },
    ],
    tone: 'border-blue-200 bg-blue-50',
  },
];

const statusNotes = [
  { title: '时间判定', desc: '打卡时间按班次和规则版本自动判定，显示正常、迟到、早退、待确认等结果。', icon: Clock },
  { title: '地点场景', desc: '地点和场景会一起记录，外勤、出差、请假不会只剩定位痕迹。', icon: MapPin },
  { title: '异常处理', desc: '如存在异常，可直接跳转到异常中心处理，不需要在多套系统之间切换。', icon: AlertCircle },
];

const weeklyTrend = [
  { label: '正常 4 天', detail: '完整打卡直接进入月报' },
  { label: '外勤 1 次', detail: '已和申请单自动关联' },
  { label: '迟到 1 次', detail: '已补充说明并审批通过' },
  { label: '补卡 1 条', detail: '仍需本周内继续闭环' },
];

const resultFlow = [
  { title: '原始记录', desc: '保留每次上下班、外勤、出差打卡时间与地点。', tone: 'bg-slate-50 text-slate-700 border-slate-200' },
  { title: '规则判定', desc: '结合班次、规则版本、申请结果生成最终状态。', tone: 'bg-blue-50 text-blue-700 border-blue-100' },
  { title: '同步回写', desc: '异常中心、月度确认和日志中心看到的是同一条结果。', tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
];

export default function RecordsPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className={`mt-3 text-3xl font-semibold ${card.tone}`}>{card.value}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{card.desc}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">打卡记录</h3>
              <p className="mt-1 text-sm text-slate-500">在电脑端展开更多明细，在手机端仍然保持单列可读。</p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1">本周</span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">本月</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">自定义</span>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {records.map((record) => (
              <div key={record.date} className={`rounded-3xl border p-4 ${record.tone}`}>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{record.date}</p>
                    <p className="mt-1 text-sm text-slate-500">{record.shift}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <span className={`rounded-full px-3 py-1 ${record.statusTone}`}>{record.status}</span>
                    <span className={`rounded-full px-3 py-1 ${record.syncTone}`}>{record.syncStatus}</span>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {record.entries.map((entry) => (
                    <div key={`${record.date}-${entry.label}`} className="rounded-2xl bg-white/80 p-4">
                      <p className="text-sm text-slate-500">{entry.label}</p>
                      <p className="mt-2 text-xl font-semibold text-slate-900">{entry.value}</p>
                      <p className="mt-1 text-sm font-medium text-slate-700">{entry.status}</p>
                      <p className="mt-2 text-xs leading-5 text-slate-500">{entry.detail}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-[1fr,1fr,auto]">
                  <div className="rounded-2xl bg-white/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">结果说明</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{record.reason}</p>
                  </div>
                  <div className="rounded-2xl bg-white/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">判定依据</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{record.trace}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end lg:justify-between">
                    {record.actions.map((action) => (
                      <Link key={`${record.date}-${action.label}`} to={action.to} className="inline-flex items-center rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                        {action.label}
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
            <h3 className="text-lg font-semibold text-slate-900">记录说明</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {statusNotes.map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                  <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                  <div>
                    <p className="font-semibold text-slate-800">{item.title}</p>
                    <p className="mt-1 leading-6">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
            <h3 className="text-lg font-semibold text-slate-900">结果回写链路</h3>
            <div className="mt-4 space-y-3">
              {resultFlow.map((item) => (
                <div key={item.title} className={`rounded-2xl border p-4 text-sm ${item.tone}`}>
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-2 leading-6 opacity-90">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
            <h3 className="text-lg font-semibold text-slate-900">本周趋势</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {weeklyTrend.map((item) => (
                <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-5 text-center">
                  <p className="font-semibold text-slate-700">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
