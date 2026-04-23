import { AlertCircle, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const timeline = [
  { label: '上班打卡', time: '08:55', status: '正常', tone: 'text-emerald-600' },
  { label: '午间外出', time: '12:20', status: '外出已同步', tone: 'text-blue-600' },
  { label: '下班打卡', time: '--:--', status: '待完成', tone: 'text-slate-400' },
];

const quickActions = [
  { title: '外勤打卡', desc: '客户家 / 工地 / 门店现场' },
  { title: '出差打卡', desc: '出差地点按定位完成打卡' },
  { title: '查看记录', desc: '回看本周打卡和日状态', href: '/records' },
  { title: '处理异常', desc: '缺卡、迟到补卡快速入口', href: '/exceptions' },
];

export default function PunchPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-[28px] bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 p-6 text-white shadow-lg lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">今天是 2026-04-23 周四</p>
              <h3 className="mt-2 text-3xl font-semibold">今日打卡</h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100/90 lg:text-base">
                同一套系统在手机上突出“马上打卡”，在电脑上则把今日状态、快捷入口和说明信息一起展开，避免出现只适配单一端的页面结构。
              </p>
            </div>

            <div className="rounded-3xl bg-white/15 p-4 backdrop-blur">
              <p className="text-sm text-blue-100">当前班次</p>
              <p className="mt-2 text-2xl font-semibold">早班 A班</p>
              <p className="mt-1 text-sm text-blue-100">09:00 - 18:00 ｜ 总部标准班</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">主操作</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">下班打卡</h3>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              1 条异常待处理
            </span>
          </div>

          <div className="mt-6 flex flex-col items-center rounded-[28px] bg-slate-50 px-4 py-8 text-center">
            <p className="text-sm text-slate-500">当前时间 18:02:45</p>
            <button className="mt-5 flex h-36 w-36 items-center justify-center rounded-full bg-blue-600 text-center text-white shadow-[0_18px_40px_-18px_rgba(37,99,235,0.7)] transition hover:bg-blue-700 active:scale-95">
              <span>
                <span className="block text-2xl font-semibold">下班</span>
                <span className="mt-1 block text-sm text-blue-100">点击立即打卡</span>
              </span>
            </button>
            <p className="mt-5 flex items-center gap-1 text-sm text-slate-500">
              <MapPin className="h-4 w-4" />
              科技园 T3 栋 · 已在打卡范围内
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">今日状态</h3>
              <p className="mt-1 text-sm text-slate-500">先展示结果，再解释原因，再给处理动作。</p>
            </div>
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">下班缺卡风险</span>
          </div>

          <div className="mt-5 space-y-3">
            {timeline.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-900">{item.label}</p>
                  <p className="mt-1 text-xs text-slate-500">系统会按班次、地点和场景自动判定</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{item.time}</p>
                  <p className={`mt-1 text-sm font-medium ${item.tone}`}>{item.status}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-semibold">发现 1 条异常待处理</p>
                <p className="mt-1 leading-6 text-amber-800">若今天下班未打卡，系统会在日报中生成缺卡记录，并在异常中心中提醒你补卡。</p>
                <Link to="/exceptions" className="mt-2 inline-block font-semibold text-blue-700">
                  去异常中心处理
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-lg font-semibold text-slate-900">快捷操作</h3>
          <p className="mt-1 text-sm text-slate-500">电脑端展开更多说明，手机端保留短操作路径。</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {quickActions.map((item) => (
              <Link
                key={item.title}
                to={item.href ?? '/punch'}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{item.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
