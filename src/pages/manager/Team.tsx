import { useState } from 'react';
import { AlertCircle, AlertTriangle, ArrowRight, Briefcase, Calendar, CheckSquare, FileText, MapPin, Plane, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const summaryCards = [
  { label: '今日出勤', value: '26/29', detail: '2 人请假、1 人外勤，已纳入今日统计。', tone: 'text-gray-900' },
  { label: '待审批', value: '3', detail: '其中 1 条已超 24 小时，建议优先清理。', tone: 'text-amber-600', to: '/manager/approval' },
  { label: '团队异常', value: '5', detail: '缺卡 3 条、迟到 2 条，仍有 2 条未闭环。', tone: 'text-red-600', to: '/manager/team-exceptions' },
  { label: '未排班', value: '2', detail: '周四、周五各 1 人未补齐，可能继续放大异常。', tone: 'text-purple-600', to: '/manager/schedule' },
];

const teamBuckets = [
  { label: '已到岗', value: '22', detail: '正常出勤', tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { label: '外勤 / 出差', value: '4', detail: '场景已登记', tone: 'bg-blue-50 text-blue-700 border-blue-100' },
  { label: '请假中', value: '2', detail: '已审批通过', tone: 'bg-slate-50 text-slate-700 border-slate-200' },
  { label: '异常待处理', value: '1', detail: '需今天跟进', tone: 'bg-amber-50 text-amber-700 border-amber-100' },
];

const urgentItems = [
  {
    title: '补卡待审批',
    desc: '张三、李四等 3 条补卡申请待处理，建议优先审批避免月底积压。',
    deadline: '其中 1 条已超过 24 小时',
    impact: '审批结果会直接回写到异常中心和团队月报。',
    to: '/manager/approval',
    tone: 'border-amber-100 bg-amber-50 text-amber-900',
  },
  {
    title: '本周存在未排班',
    desc: '测试组 2 人周四、周五尚未排班，若不补齐会影响异常判定。',
    deadline: '建议今天 18:00 前发布',
    impact: '未排班员工明天会继续显示异常风险。',
    to: '/manager/schedule',
    tone: 'border-purple-100 bg-purple-50 text-purple-900',
  },
  {
    title: '团队异常集中处理',
    desc: '本月已有 5 条迟到 / 缺卡未闭环，建议今天统一跟进。',
    deadline: '月底前需全部清零',
    impact: '否则团队月报会带着未确认结果进入人事工作台。',
    to: '/manager/team-exceptions',
    tone: 'border-red-100 bg-red-50 text-red-900',
  },
];

const followUpQueue = [
  {
    name: '张三',
    status: '补卡待审批',
    reason: '昨天下班缺卡，员工已补充“客户临时会议延后离场”说明。',
    nextStep: '去审批，审批后自动更新团队异常。',
    tone: 'bg-amber-50 text-amber-900 border-amber-100',
  },
  {
    name: '王敏',
    status: '外勤待确认',
    reason: '今日 15:10 外勤打卡，定位已回传，仍待主管确认客户拜访有效。',
    nextStep: '确认后会同步到月报的外勤统计。',
    tone: 'bg-blue-50 text-blue-900 border-blue-100',
  },
  {
    name: '技术二组',
    status: '周五未排班',
    reason: '2 名新入组成员尚未被纳入本周班表。',
    nextStep: '先补排班，再回看异常中心是否还有残留。',
    tone: 'bg-purple-50 text-purple-900 border-purple-100',
  },
];

const writebackSteps = [
  { title: '审批完成', desc: '补卡、请假、外出审批后，团队异常数量会即时回落。', tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { title: '排班补齐', desc: '未排班补齐后，系统会按新班次重算缺卡和迟到结果。', tone: 'bg-purple-50 text-purple-700 border-purple-100' },
  { title: '月报确认', desc: '主管首页能持续看到还有多少异常未关闭，不会只跳转不回显。', tone: 'bg-slate-50 text-slate-700 border-slate-200' },
];

export default function ManagerTeam() {
  const [hasCheckedOut, setHasCheckedOut] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  const handleManagerPunch = () => {
    setHasCheckedOut(true);
    setActionNotice('主管本人下班打卡已记录，团队异常与审批汇总会继续留在首页处理。');
  };

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-white/60 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-purple-500">主管工作台</p>
            <h1 className="mt-1 text-xl font-semibold text-gray-900">先处理团队问题，再做排班</h1>
          </div>
          <div className="rounded-2xl bg-slate-50 px-3 py-2 text-right text-xs text-gray-500">
            <div>技术二组</div>
            <div className="mt-1 font-medium text-gray-700">2024-05-20 周一</div>
          </div>
        </div>
      </header>

      <main className="space-y-4 p-4 pb-24">
        <section className="relative min-h-[683px] overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 p-5 text-white shadow-[0_20px_40px_rgba(37,99,235,0.28)] sm:h-auto sm:overflow-visible">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-blue-100">今日班次</p>
              <h2 className="mt-1 text-2xl font-semibold">朝 9 晚 6</h2>
              <p className="mt-2 text-sm text-blue-100">09:00 - 18:00 · 当前需完成下班打卡</p>
            </div>
            <Link to="/manager/team-exceptions" className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20 transition hover:bg-white/20">
              异常待处理
            </Link>
          </div>

          <div className="mt-4 hidden flex-wrap gap-2 sm:flex">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20">团队 1 条高风险异常</span>
            <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-medium text-amber-50 ring-1 ring-amber-100/20">1 条审批超 24 小时</span>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-50 ring-1 ring-emerald-100/20">出勤已回写 26 人</span>
          </div>
  
          <div className="mx-auto mt-5 min-h-[385px] w-[313px] rounded-[28px] bg-white px-5 py-6 text-center text-gray-900 shadow-lg sm:mx-0 sm:h-auto sm:w-auto">
            <p className="text-sm text-gray-500">当前可执行动作</p>
            <div className="mt-4 sm:hidden">
              <div className="relative mx-auto w-[252px]" style={{ height: '288px' }}>
                <div className="pointer-events-none absolute left-1/2 top-[10px] z-0 h-[202px] w-[202px] -translate-x-1/2">
                  <div className="absolute inset-[-14px] animate-pulse rounded-full bg-blue-300/18" style={{ animationDuration: '2.8s' }}></div>
                  <div className="absolute inset-[-6px] animate-pulse rounded-full border border-blue-200/45" style={{ animationDuration: '2.8s' }}></div>
                </div>

                <button
                  type="button"
                  aria-label="下班打卡"
                  onClick={handleManagerPunch}
                  className="absolute left-1/2 top-[10px] z-10 inline-flex h-[202px] w-[202px] -translate-x-1/2 items-center justify-center rounded-full bg-blue-600 px-6 text-white shadow-[0_22px_48px_rgba(37,99,235,0.35)] transition hover:bg-blue-700 active:scale-95"
                >
                  <span>
                    <span className="block text-[18px] font-bold leading-8">{hasCheckedOut ? '打卡完成' : '下班打卡'}</span>
                    <span className="mt-2 block text-[14px] leading-5 text-blue-100">{hasCheckedOut ? '18:05 已回写成功' : '范围：总部园区 100m 内'}</span>
                  </span>
                </button>
                <Link to="/manager/approval" className="absolute -bottom-[12px] left-6 flex flex-col items-center">
                  <span className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-sm transition hover:bg-blue-100 active:scale-95">
                    <Briefcase className="h-4 w-4" />
                  </span>
                  <span className="mt-2 text-[11px] font-semibold text-slate-700">外勤打卡</span>
                </Link>
                <Link to="/manager/approval" className="absolute -bottom-[12px] right-6 flex flex-col items-center">
                  <span className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-sm transition hover:bg-blue-100 active:scale-95">
                    <Plane className="h-4 w-4" />
                  </span>
                  <span className="mt-2 text-[11px] font-semibold text-slate-700">出差打卡</span>
                </Link>
              </div>
            </div>
            <div className="mt-4 hidden items-center justify-center gap-4 sm:flex">
              <Link to="/manager/approval" className="inline-flex h-[108px] w-[108px] items-center justify-center rounded-full bg-slate-100 text-slate-700 shadow-sm transition hover:bg-slate-200 active:scale-95">
                <span>
                  <Briefcase className="mx-auto h-5 w-5" />
                  <span className="mt-2 block text-sm font-semibold">外勤打卡</span>
                </span>
              </Link>
              <button type="button" onClick={handleManagerPunch} className="inline-flex h-36 w-36 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_18px_40px_rgba(37,99,235,0.32)] transition hover:bg-blue-700 active:scale-95">
                <span>
                  <span className="block text-2xl font-bold">{hasCheckedOut ? '打卡完成' : '下班打卡'}</span>
                  <span className="mt-2 block text-xs text-blue-100">{hasCheckedOut ? '18:05 已回写成功' : '范围：总部园区 100m 内'}</span>
                </span>
              </button>
              <Link to="/manager/approval" className="inline-flex h-[108px] w-[108px] items-center justify-center rounded-full bg-slate-100 text-slate-700 shadow-sm transition hover:bg-slate-200 active:scale-95">
                <span>
                  <Plane className="mx-auto h-5 w-5" />
                  <span className="mt-2 block text-sm font-semibold">出差打卡</span>
                </span>
              </Link>
            </div>
            <p className="mt-2 hidden items-center text-xs text-gray-500 sm:inline-flex">
              <MapPin className="mr-1 h-3.5 w-3.5" />
              总部园区 · 已在打卡范围内
            </p>

            <div className="mt-8 grid gap-3 sm:mt-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4 text-left">
                <p className="text-xs text-gray-500">主管打卡结果</p>
                <p className="mt-2 text-base font-semibold text-gray-900">08:55 已上班</p>
                <p className="mt-1 text-xs font-medium text-blue-600">下班仍待完成</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 text-left">
                <p className="text-xs text-gray-500">今日团队状态</p>
                <p className="mt-2 text-base font-semibold text-gray-900">26 人已回写</p>
                <p className="mt-1 text-xs font-medium text-amber-600">1 人仍待跟进</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 text-left">
                <p className="text-xs text-gray-500">首页回显</p>
                <p className="mt-2 text-base font-semibold text-gray-900">审批 / 排班 / 月报</p>
                <p className="mt-1 text-xs font-medium text-slate-600">处理后会自动回到这里刷新摘要</p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 rounded-3xl bg-white/10 p-4 sm:grid-cols-2 xl:grid-cols-4">
            {teamBuckets.map((item) => (
              <div key={item.label} className={`rounded-2xl border p-3 ${item.tone}`}>
                <p className="text-xs">{item.label}</p>
                <p className="mt-2 text-lg font-semibold">{item.value}</p>
                <p className="text-xs opacity-90">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {actionNotice ? (
          <section className="rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900 shadow-sm">
            <p className="font-semibold">主管本人打卡已完成</p>
            <p className="mt-2 leading-6">{actionNotice}</p>
          </section>
        ) : null}

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((item) => {
            const content = (
              <>
                <p className="text-sm font-medium text-gray-500">{item.label}</p>
                <p className={`mt-3 text-3xl font-semibold ${item.tone}`}>{item.value}</p>
                <p className="mt-2 text-sm leading-6 text-gray-500">{item.detail}</p>
                {item.to ? <p className="mt-2 text-xs font-medium text-gray-400">点击查看明细</p> : null}
              </>
            );

            if (!item.to) {
              return (
                <div key={item.label} className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
                  {content}
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                to={item.to}
                className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-100 hover:shadow-md"
              >
                {content}
              </Link>
            );
          })}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">今日重点处理</h3>
                <p className="mt-1 text-sm text-gray-500">把审批、未排班、团队异常和团队月报放到首页第一屏。</p>
              </div>
              <AlertCircle className="h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-4 space-y-3">
              {urgentItems.map((item) => (
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
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">快捷入口</h3>
                <p className="mt-1 text-sm text-gray-500">从首页直接进入高频管理动作。</p>
              </div>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <Link to="/manager/approval" className="rounded-2xl bg-slate-50 p-4 transition hover:bg-amber-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm ring-1 ring-gray-100">
                  <CheckSquare className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-semibold text-gray-900">待审批中心</p>
                <p className="mt-1 text-sm text-gray-500">3 条补卡待审批，其中 1 条已超时。</p>
              </Link>
              <Link to="/manager/schedule" className="rounded-2xl bg-slate-50 p-4 transition hover:bg-purple-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-purple-600 shadow-sm ring-1 ring-gray-100">
                  <Calendar className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-semibold text-gray-900">排班管理</p>
                <p className="mt-1 text-sm text-gray-500">本周还有 2 人未排班，需要补齐并发布。</p>
              </Link>
              <Link to="/manager/team-exceptions" className="rounded-2xl bg-slate-50 p-4 transition hover:bg-red-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm ring-1 ring-gray-100">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-semibold text-gray-900">团队异常明细</p>
                <p className="mt-1 text-sm text-gray-500">集中查看迟到、缺卡和待跟进的成员。</p>
              </Link>
              <Link to="/manager/monthly-report" className="rounded-2xl bg-slate-50 p-4 transition hover:bg-blue-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm ring-1 ring-gray-100">
                  <FileText className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-semibold text-gray-900">团队月报</p>
                <p className="mt-1 text-sm text-gray-500">查看本团队 / 门店月度汇总和待确认异常。</p>
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-gray-900">待跟进成员 / 事项</h3>
                <p className="mt-1 text-sm text-gray-500">首页直接看到还剩谁没闭环，而不是只给跳转入口。</p>
              </div>
              <AlertTriangle className="h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-4 space-y-3">
              {followUpQueue.map((item) => (
                <div key={`${item.name}-${item.status}`} className={`rounded-2xl border p-4 ${item.tone}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{item.name}</p>
                    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium">{item.status}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 opacity-90">{item.reason}</p>
                  <p className="mt-3 text-xs font-medium opacity-90">下一步：{item.nextStep}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-gray-900">处理后的回显逻辑</h3>
                <p className="mt-1 text-sm text-gray-500">让主管首页本身能承接闭环结果。</p>
              </div>
              <CheckSquare className="h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-4 space-y-3">
              {writebackSteps.map((item) => (
                <div key={item.title} className={`rounded-2xl border p-4 text-sm ${item.tone}`}>
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-2 leading-6 opacity-90">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
