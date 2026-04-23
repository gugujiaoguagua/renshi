import { AlertCircle, Clock, MapPin } from 'lucide-react';

const records = [
  {
    date: '04-23 周四',
    shift: '早班 A班 09:00 - 18:00',
    entries: [
      { label: '上班', value: '08:55', status: '正常' },
      { label: '外出', value: '12:20', status: '已同步' },
      { label: '下班', value: '--:--', status: '待打卡' },
    ],
    tone: 'border-amber-200 bg-amber-50',
  },
  {
    date: '04-22 周三',
    shift: '门店晚班 14:00 - 22:00',
    entries: [
      { label: '上班', value: '13:57', status: '正常' },
      { label: '下班', value: '22:06', status: '正常' },
    ],
    tone: 'border-slate-200 bg-white',
  },
  {
    date: '04-21 周二',
    shift: '总部标准班 09:00 - 18:00',
    entries: [
      { label: '上班', value: '09:12', status: '迟到 12 分钟' },
      { label: '下班', value: '18:08', status: '正常' },
    ],
    tone: 'border-red-200 bg-red-50',
  },
];

export default function RecordsPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">本月出勤</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">18.5 天</p>
          <p className="mt-2 text-sm text-slate-500">日报和月报口径保持一致，可继续穿透到日明细。</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">异常记录</p>
          <p className="mt-3 text-3xl font-semibold text-red-600">2 条</p>
          <p className="mt-2 text-sm text-slate-500">缺卡、迟到、外勤待确认都会在这里沉淀。</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">定位场景</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">3 类</p>
          <p className="mt-2 text-sm text-slate-500">总部、门店、外勤 / 出差定位均已纳入一套结果。</p>
        </div>
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
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{record.date}</p>
                    <p className="mt-1 text-sm text-slate-500">{record.shift}</p>
                  </div>
                  <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600">
                    日明细可继续下钻
                  </span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {record.entries.map((entry) => (
                    <div key={`${record.date}-${entry.label}`} className="rounded-2xl bg-white/80 p-4">
                      <p className="text-sm text-slate-500">{entry.label}</p>
                      <p className="mt-2 text-xl font-semibold text-slate-900">{entry.value}</p>
                      <p className="mt-1 text-sm text-slate-500">{entry.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
            <h3 className="text-lg font-semibold text-slate-900">记录说明</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                <p className="leading-6">打卡时间会按班次自动判定，显示正常、迟到、早退、待确认等结果。</p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                <p className="leading-6">地点和场景会一起记录，避免外勤、出差记录脱离最终月报。</p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                <p className="leading-6">如存在异常，可直接跳转到异常中心处理，不需要在多套系统之间切换。</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
            <h3 className="text-lg font-semibold text-slate-900">本周趋势</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {['正常 4 天', '外勤 1 次', '迟到 1 次', '补卡 1 条'].map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 px-4 py-5 text-center font-semibold text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
