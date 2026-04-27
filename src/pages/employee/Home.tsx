import { useState } from 'react';
import { AlertCircle, ArrowRight, Bell, Briefcase, Calendar, Clock, FileText, MapPin, Plane, Smartphone, User, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const statusChips = [
  { label: '下班待打卡', tone: 'bg-white/15 text-white ring-white/20' },
  { label: '定位正常', tone: 'bg-emerald-400/15 text-emerald-50 ring-emerald-200/20' },
  { label: '1 条异常待补', tone: 'bg-amber-400/15 text-amber-50 ring-amber-100/20' },
  { label: '企微直达待接入', tone: 'bg-blue-400/15 text-blue-50 ring-blue-100/20' },
];

const punchResults = [
  { label: '上班打卡', value: '08:55', status: '正常', detail: '总部园区 · 已同步今日出勤' },
  { label: '下班打卡', value: '待完成', status: '18:00 前后可执行', detail: '若超出范围会转入异常中心' },
  { label: '当前定位', value: '科技园 T3 栋', status: '已在范围内', detail: '网络正常，可直接完成下班打卡' },
];

const punchTimeline = [
  { title: '先打卡', desc: '系统先记录时间、地点与场景，避免只剩口头说明。', tone: 'bg-blue-50 text-blue-700 border-blue-100' },
  { title: '再判定', desc: '按班次、规则版本和申请结果自动给出正常 / 异常结论。', tone: 'bg-slate-50 text-slate-700 border-slate-200' },
  { title: '最后回写', desc: '异常中心、月度确认和日志都会同步看到这次动作。', tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
];

const todoItems = [
  {
    title: '缺卡补卡',
    desc: '昨天 18:00 下班缺卡，需今天补充说明并等待主管审批。',
    deadline: '今日 18:00 前补充',
    impact: '未处理会继续占用异常名额，并影响月底确认。',
    to: '/employee/exceptions',
    tone: 'bg-red-50 text-red-700 border-red-100',
    action: '去处理',
  },
  {
    title: '月底异常提醒',
    desc: '本月还有 2 条异常未闭环，建议在月结前统一清掉。',
    deadline: '本月 31 日前处理',
    impact: '超时会按当前结果进入月报统计。',
    to: '/employee/exceptions',
    tone: 'bg-amber-50 text-amber-700 border-amber-100',
    action: '查看异常',
  },
  {
    title: '考勤结果确认',
    desc: '次月 2 号前确认本月结果，超时会按默认确认处理。',
    deadline: '次月 2 日 18:00 截止',
    impact: '确认后会锁定月报口径，不再重复提醒。',
    to: '/employee/monthly-summary',
    tone: 'bg-blue-50 text-blue-700 border-blue-100',
    action: '去确认',
  },
];

const quickActions = [
  { title: '外勤打卡', desc: '客户现场 / 临时外出', note: '需补充来访对象与外出原因', status: '场景打卡', icon: Briefcase },
  { title: '出差打卡', desc: '出差地点按规则打卡', note: '自动关联出差申请与行程范围', status: '异地打卡', icon: Plane },
  { title: '打卡记录', desc: '查看最近出勤与时间点', note: '可追溯规则判定和审批回写', status: '结果核对', icon: Clock, to: '/employee/records' },
  { title: '请假 / 外出申请', desc: '请假、出差、外出、调班统一提单', note: '提交后会同步影响考勤判定', status: '申请入口', icon: Calendar, to: '/employee/apply' },
  { title: '月度确认', desc: '月底处理异常并确认结果', note: '确认后锁定本月统计口径', status: '月底闭环', icon: FileText, to: '/employee/monthly-summary' },
  { title: '个人中心', desc: '查看提醒设置与规则说明', note: '可查看补卡时限与通知设置', status: '规则说明', icon: User, to: '/employee/profile' },
];

const writebackCards = [
  { title: '异常中心', desc: '超时、缺卡、越界定位会自动生成待处理记录。', tone: 'border-red-100 bg-red-50 text-red-900' },
  { title: '月度确认', desc: '正常、审批通过、驳回结果都会汇总到月底确认页。', tone: 'border-blue-100 bg-blue-50 text-blue-900' },
  { title: '日志留痕', desc: '每次补卡、审批和人工修正都可以继续回溯。', tone: 'border-slate-200 bg-slate-50 text-slate-900' },
];

const ssoCards = [
  {
    title: '企微工作台直达',
    desc: '从企业微信入口进入后，不再先找菜单，直接落到首页的打卡主卡片。',
  },
  {
    title: '单点登录免二次选身份',
    desc: '登录态直接带出员工身份，保留当前页面结构，只把入口前移。',
  },
  {
    title: '打卡仍走当前首页闭环',
    desc: '先打卡、再处理异常、月底确认的流程不改，只是把首屏入口变短。',
  },
  {
    title: '异常与月报继续回写',
    desc: '企微进入后产生的打卡和申请结果，仍同步异常中心、月度确认和日志。',
  },
];

const reminderModals = [
  {
    title: '缺卡补卡提醒',
    desc: '昨天 18:00 的下班卡还没补，请在今天 18:00 前补充说明并提交审批。',
    to: '/employee/exceptions',
    primaryText: '去补卡',
    level: '高优先级',
    tone: 'border-red-100 bg-red-50 text-red-900',
    cadence: ['首次发现立即弹窗', '今日 16:00 再提醒 1 次', '月底前每天 09:30 持续催办'],
  },
  {
    title: '月底异常清理提醒',
    desc: '本月还有 2 条异常未闭环，建议在 31 日前处理完，给主管预留审批时间。',
    to: '/employee/exceptions',
    primaryText: '查看异常',
    level: '月底必看',
    tone: 'border-amber-100 bg-amber-50 text-amber-900',
    cadence: ['月底前 3 天开始每日提醒', '异常未清时保持首页红点', '超时后按当前结果进入月报'],
  },
  {
    title: '月度结果确认提醒',
    desc: '请在次月 2 日 18:00 前确认本月考勤结果，超时将按默认确认处理。',
    to: '/employee/monthly-summary',
    primaryText: '去确认',
    level: '次月确认',
    tone: 'border-blue-100 bg-blue-50 text-blue-900',
    cadence: ['次月 1 日推送提醒', '次月 2 日上午再次弹窗', '超时后自动默认确认'],
  },
];

export default function EmployeeHome() {
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [activeReminderIndex, setActiveReminderIndex] = useState(0);
  const [hasCompletedPunch, setHasCompletedPunch] = useState(false);

  const activeReminder = reminderModals[activeReminderIndex];
  const currentPunchResults = hasCompletedPunch
    ? [
        punchResults[0],
        { label: '下班打卡', value: '18:02', status: '刚刚完成', detail: '打卡成功后已弹出异常预警，可继续处理缺卡事项。' },
        { label: '当前定位', value: '科技园 T3 栋', status: '已回写本次打卡', detail: '本次下班打卡已同步今日出勤与异常判定。' },
      ]
    : punchResults;

  const handleNextReminder = () => {
    setActiveReminderIndex((current) => (current + 1) % reminderModals.length);
  };

  const handlePunchComplete = () => {
    setHasCompletedPunch(true);
    setActiveReminderIndex(0);
    setShowReminderModal(true);
  };

  return (
    <>
      {showReminderModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.24)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-red-50 p-2 text-red-600">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">消息弹窗预览</p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">{activeReminder.title}</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReminderModal(false)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className={`mt-4 rounded-3xl border p-4 ${activeReminder.tone}`}>
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold">{activeReminder.level}</span>
                <span className="text-xs font-medium opacity-80">
                  {activeReminderIndex + 1} / {reminderModals.length}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 opacity-90">{activeReminder.desc}</p>
              <div className="mt-4 space-y-2 text-xs">
                {activeReminder.cadence.map((item) => (
                  <div key={item} className="rounded-2xl bg-white/80 px-3 py-2">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowReminderModal(false)}
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                稍后提醒
              </button>
              <Link
                to={activeReminder.to}
                onClick={() => setShowReminderModal(false)}
                className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                {activeReminder.primaryText}
              </Link>
            </div>

            <button
              type="button"
              onClick={handleNextReminder}
              className="mt-3 w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
            >
              查看下一条提醒
            </button>
          </div>
        </div>
      ) : null}

      <header className="sticky top-0 z-10 border-b border-white/60 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-blue-500">员工首页</p>
            <h1 className="mt-1 text-xl font-semibold text-gray-900">先打卡，再处理异常</h1>
          </div>
          <div className="rounded-2xl bg-slate-50 px-3 py-2 text-right text-xs text-gray-500">
            <div>2024-05-20 周一</div>
            <div className="mt-1 font-medium text-gray-700">18:02:45</div>
          </div>
        </div>
      </header>

      <main className="space-y-4 p-4">
        <section className="relative min-h-[683px] overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 p-5 text-white shadow-[0_20px_40px_rgba(37,99,235,0.28)] sm:h-auto sm:overflow-visible">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-blue-100">今日班次</p>
              <h2 className="mt-1 text-2xl font-semibold">朝 9 晚 6</h2>
              <p className="mt-2 text-sm text-blue-100">{hasCompletedPunch ? '09:00 - 18:00 · 已完成下班打卡，可继续处理异常' : '09:00 - 18:00 · 当前需完成下班打卡'}</p>
            </div>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20">异常待处理</span>
          </div>

          <div className="mt-4 hidden flex-wrap gap-2 sm:flex">
            {statusChips.map((chip) => (
              <span key={chip.label} className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${chip.tone}`}>
                {chip.label}
              </span>
            ))}
          </div>

          <div className="mx-auto mt-5 min-h-[385px] w-[313px] rounded-[28px] bg-white px-5 py-6 text-center text-[oklch(0.21_0.034_264.665)] shadow-lg sm:mx-0 sm:h-auto sm:w-auto sm:text-gray-900">
            <p className="text-sm text-gray-500">当前可执行动作</p>
            <div className="mt-4 sm:hidden">
              <div className="relative mx-auto w-[252px]" style={{ height: '288px' }}>
                <div className="pointer-events-none absolute left-1/2 top-[10px] z-0 h-[202px] w-[202px] -translate-x-1/2">
                  <div className="absolute inset-[-14px] animate-pulse rounded-full bg-blue-300/18" style={{ animationDuration: '2.8s' }}></div>
                  <div className="absolute inset-[-6px] animate-pulse rounded-full border border-blue-200/45" style={{ animationDuration: '2.8s' }}></div>
                </div>

                <button
                  type="button"
                  aria-label={hasCompletedPunch ? '打卡完成' : '下班打卡'}
                  onClick={handlePunchComplete}
                  className="absolute left-1/2 top-[10px] z-10 inline-flex h-[202px] w-[202px] -translate-x-1/2 items-center justify-center rounded-full bg-blue-600 px-6 text-white shadow-[0_22px_48px_rgba(37,99,235,0.35)] transition hover:bg-blue-700 active:scale-95"
                >
                  <span>
                    <span className="block text-[18px] font-bold leading-8">{hasCompletedPunch ? '打卡完成' : '下班打卡'}</span>
                    <span className="mt-2 block text-[14px] leading-5 text-blue-100">{hasCompletedPunch ? '18:02 已回写成功' : '范围：公司 100m 内'}</span>
                  </span>
                </button>
                <Link to="/employee/apply?type=outing" className="absolute -bottom-[12px] left-6 flex flex-col items-center">
                  <span className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-sm transition hover:bg-blue-100 active:scale-95">
                    <Briefcase className="h-4 w-4" />
                  </span>
                  <span className="mt-2 text-[11px] font-semibold text-slate-700">外勤打卡</span>
                </Link>
                <Link to="/employee/apply?type=trip" className="absolute -bottom-[12px] right-6 flex flex-col items-center">
                  <span className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-sm transition hover:bg-blue-100 active:scale-95">
                    <Plane className="h-4 w-4" />
                  </span>
                  <span className="mt-2 text-[11px] font-semibold text-slate-700">出差打卡</span>
                </Link>
              </div>
            </div>
            <div className="mt-4 hidden items-center justify-center gap-4 sm:flex">
              <button className="inline-flex h-[108px] w-[108px] items-center justify-center rounded-full bg-slate-100 text-slate-700 shadow-sm transition hover:bg-slate-200 active:scale-95">
                <span>
                  <Briefcase className="mx-auto h-5 w-5" />
                  <span className="mt-2 block text-sm font-semibold">外勤打卡</span>
                </span>
              </button>
              <button
                type="button"
                onClick={handlePunchComplete}
                className="inline-flex h-36 w-36 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_18px_40px_rgba(37,99,235,0.32)] transition hover:bg-blue-700 active:scale-95"
              >
                <span>
                  <span className="block text-2xl font-bold">{hasCompletedPunch ? '打卡完成' : '下班打卡'}</span>
                  <span className="mt-2 block text-xs text-blue-100">{hasCompletedPunch ? '18:02 已回写成功' : '范围：公司 100m 内'}</span>
                </span>
              </button>
              <Link to="/employee/apply?type=trip" className="inline-flex h-[108px] w-[108px] items-center justify-center rounded-full bg-slate-100 text-slate-700 shadow-sm transition hover:bg-slate-200 active:scale-95">
                <span>
                  <Plane className="mx-auto h-5 w-5" />
                  <span className="mt-2 block text-sm font-semibold">出差打卡</span>
                </span>
              </Link>
            </div>
            <p className="mt-2 hidden items-center text-xs text-gray-500 sm:inline-flex">
              <MapPin className="mr-1 h-3.5 w-3.5" />
              科技园 T3 栋 · 已在打卡范围内
            </p>

            <div className="mt-8 grid gap-3 sm:mt-4 sm:grid-cols-3">
              {currentPunchResults.map((item) => (
                <div key={item.label} className="rounded-2xl bg-slate-50 p-4 text-left">
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="mt-2 text-base font-semibold text-gray-900">{item.value}</p>
                  <p className="mt-1 text-xs font-medium text-blue-600">{item.status}</p>
                  <p className="mt-2 text-xs leading-5 text-gray-500">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3 rounded-3xl bg-white/10 p-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-xs text-blue-100">上班打卡</p>
              <p className="mt-2 text-lg font-semibold">08:55</p>
              <p className="text-xs text-blue-100">正常</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-xs text-blue-100">下班打卡</p>
              <p className="mt-2 text-lg font-semibold">{hasCompletedPunch ? '18:02' : '待完成'}</p>
              <p className="text-xs text-blue-100">{hasCompletedPunch ? '已完成并触发异常预警' : '剩余 1 项'}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-xs text-blue-100">异常回写</p>
              <p className="mt-2 text-lg font-semibold">1 条</p>
              <p className="text-xs text-blue-100">昨天缺卡待补说明</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-xs text-blue-100">月报同步</p>
              <p className="mt-2 text-lg font-semibold">已开启</p>
              <p className="text-xs text-blue-100">今日动作会进入月度确认</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-amber-100 p-2 text-amber-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-900">你有 1 条缺卡待处理</p>
                <p className="mt-1 text-sm leading-6 text-amber-800">如果月底前不处理，可能会影响最终考勤确认与异常扣薪结果。</p>
              </div>
            </div>
            <Link to="/employee/exceptions" className="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-amber-700 shadow-sm transition hover:bg-amber-100">
              去补卡
            </Link>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.04fr_0.96fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-blue-600">企微单点登录占位</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">从企业微信直接进入打卡首页</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  沟通稿里提到“像企微一样直接点进去就能打卡”，这里补成可见方案：正式接入后仍保留当前首页结构，只把入口缩短到企微工作台 → 单点登录 → 首页打卡。
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm">
                <Smartphone className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {ssoCards.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
              <p className="font-semibold">当前原型状态</p>
              <p className="mt-2 text-blue-800">
                现在先用 Web 原型展示入口和结果页；后续真正接企微时，只需要把身份带入和入口落点接上，不用重做员工首页。
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-blue-600">强提醒机制</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">把红点提醒补成真正的消息弹窗</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  源稿里明确提到“单独消息弹出框窗口提示”，所以这次把员工端最关键的缺卡、月底异常、次月确认补成可见弹窗预览和提醒节奏。
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReminderModal(true)}
                className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Bell className="mr-2 h-4 w-4" />
                打开弹窗
              </button>
            </div>

            <div className={`mt-5 rounded-3xl border p-4 ${activeReminder.tone}`}>
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold">{activeReminder.level}</span>
                <button
                  type="button"
                  onClick={handleNextReminder}
                  className="text-xs font-semibold opacity-80 transition hover:opacity-100"
                >
                  切换下一条
                </button>
              </div>
              <p className="mt-3 text-base font-semibold">{activeReminder.title}</p>
              <p className="mt-2 text-sm leading-6 opacity-90">{activeReminder.desc}</p>
            </div>

            <div className="mt-4 space-y-3">
              {activeReminder.cadence.map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">今日待办</h3>
            <Link to="/employee/exceptions" className="text-sm font-medium text-blue-600 hover:text-blue-700">查看全部</Link>
          </div>
          {todoItems.map((item) => (
            <Link key={item.title} to={item.to} className={`block rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm ${item.tone}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 opacity-90">{item.desc}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium opacity-90">
                    <span className="rounded-full bg-white/80 px-3 py-1">{item.deadline}</span>
                    <span className="rounded-full bg-white/80 px-3 py-1">{item.impact}</span>
                  </div>
                </div>
                <span className="inline-flex items-center text-sm font-medium">
                  {item.action}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900">打卡判定链路</h3>
              <p className="mt-1 text-sm text-gray-500">保持首页结构不变，但把结果如何生成讲清楚。</p>
            </div>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {punchTimeline.map((item) => (
              <div key={item.title} className={`rounded-2xl border p-4 text-sm ${item.tone}`}>
                <p className="font-semibold">{item.title}</p>
                <p className="mt-2 leading-6 opacity-90">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          {quickActions.map((item) => {
            const content = (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{item.status}</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-gray-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-gray-500">{item.desc}</p>
                <p className="mt-3 text-xs leading-5 text-slate-500">{item.note}</p>
              </>
            );

            return item.to ? (
              <Link key={item.title} to={item.to} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-md">
                {content}
              </Link>
            ) : (
              <button key={item.title} className="rounded-3xl bg-white p-4 text-left shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-md">
                {content}
              </button>
            );
          })}
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900">本次打卡会同步到哪里</h3>
              <p className="mt-1 text-sm text-gray-500">把“打卡不是孤立动作”这件事直接放在首页讲清楚。</p>
            </div>
            <FileText className="h-5 w-5 text-gray-400" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {writebackCards.map((item) => (
              <div key={item.title} className={`rounded-2xl border p-4 ${item.tone}`}>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-2 text-sm leading-6 opacity-90">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
