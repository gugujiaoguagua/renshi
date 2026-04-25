import { useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { AlertCircle, ArrowRight, Bell, Calendar, CheckSquare, Clock, FileText, Filter, Plane, RefreshCw, X } from 'lucide-react';

type ApprovalTab = 'pending' | 'processed' | 'mine';
type ApprovalFilter = 'all' | '补卡' | '请假' | '出差' | '外出' | '调班';

type ApprovalItem = {
  applicant: string;
  avatar: string;
  department: string;
  submittedAt: string;
  kind: Exclude<ApprovalFilter, 'all'>;
  kindLabel: string;
  kindTone: string;
  status: string;
  statusTone: string;
  tone: string;
  summary: string;
  note: string;
  sync: string;
  rows: { label: string; value: string; valueTone?: string }[];
};

const filters: ApprovalFilter[] = ['all', '补卡', '请假', '出差', '外出', '调班'];

const pendingApprovals: ApprovalItem[] = [
  {
    applicant: '张三',
    avatar: '张',
    department: '技术二组 · 前端开发',
    submittedAt: '今天 09:15 提交',
    kind: '补卡',
    kindLabel: '迟到补卡',
    kindTone: 'bg-orange-100 text-orange-800',
    status: '待主管审批',
    statusTone: 'bg-amber-50 text-amber-700',
    tone: 'border-orange-100 bg-orange-50',
    summary: '路上堵车，已经提前和主管报备，申请补回今天上班卡。',
    note: '审批通过后会同步异常中心和团队月报，不需要人事重复审批。',
    sync: '回写目标：异常中心 / 团队月报 / 人事月报',
    rows: [
      { label: '补卡日期', value: '2026-04-25（今日）' },
      { label: '应打时间', value: '09:00 上班打卡' },
      { label: '实际打卡', value: '09:12（迟到 12 分钟）', valueTone: 'text-red-600 font-semibold' },
      { label: '处理影响', value: '若驳回会继续计入迟到异常' },
    ],
  },
  {
    applicant: '李四',
    avatar: '李',
    department: '直营二店 · 店员',
    submittedAt: '今天 10:05 提交',
    kind: '请假',
    kindLabel: '事假（半天）',
    kindTone: 'bg-blue-100 text-blue-800',
    status: '待主管审批',
    statusTone: 'bg-amber-50 text-amber-700',
    tone: 'border-blue-100 bg-blue-50',
    summary: '下午家中临时有事，需要请假半天，已补充工作交接说明。',
    note: '日常请假默认先由主管审批，审批通过后直接计入月报假期天数。',
    sync: '回写目标：员工月度确认 / 团队月报',
    rows: [
      { label: '请假时间', value: '2026-04-25 13:00 - 18:00' },
      { label: '请假类型', value: '事假（半天）' },
      { label: '当前班次', value: '门店晚班 14:00 - 22:00' },
      { label: '处理影响', value: '通过后不再按缺卡 / 旷工处理' },
    ],
  },
  {
    applicant: '王五',
    avatar: '王',
    department: '运营部 · 区域经理',
    submittedAt: '昨天 18:30 提交',
    kind: '出差',
    kindLabel: '武汉出差',
    kindTone: 'bg-purple-100 text-purple-800',
    status: '待主管确认地点',
    statusTone: 'bg-purple-50 text-purple-700',
    tone: 'border-purple-100 bg-purple-50',
    summary: '本周去武汉巡店，已填写经销商门店位置和打卡要求。',
    note: '出差审批通过后，后续打卡按出差口径判断，并同步进入团队 / 人事月报。',
    sync: '回写目标：记录页 / 月报 / 异常口径',
    rows: [
      { label: '出差时间', value: '2026-04-28 至 2026-04-30' },
      { label: '地点要求', value: '武汉经销商门店 + 现场照片' },
      { label: '打卡方式', value: '出差打卡 + 地点核验' },
      { label: '处理影响', value: '月底会按出差天数计入口径' },
    ],
  },
  {
    applicant: '赵六',
    avatar: '赵',
    department: '直营二店 · 店员',
    submittedAt: '今天 08:42 提交',
    kind: '调班',
    kindLabel: '自选排班',
    kindTone: 'bg-emerald-100 text-emerald-800',
    status: '待店长确认',
    statusTone: 'bg-emerald-50 text-emerald-700',
    tone: 'border-emerald-100 bg-emerald-50',
    summary: '店长当天未排班，员工先选择门店晚班，避免系统直接误判缺卡。',
    note: '这是第二阶段沟通里新增的关键链路：自选排班要能进入主管审批。',
    sync: '回写目标：主管排班页 / 异常中心 / 月报',
    rows: [
      { label: '班次选择', value: '门店晚班 14:00 - 22:00' },
      { label: '申请原因', value: '店长未及时排班' },
      { label: '当日状态', value: '已上班，等待确认班次口径' },
      { label: '处理影响', value: '通过后修正缺卡 / 迟到判定' },
    ],
  },
];

const processedApprovals: ApprovalItem[] = [
  {
    applicant: '陈晨',
    avatar: '陈',
    department: '技术二组 · 测试工程师',
    submittedAt: '今天 11:20 处理',
    kind: '外出',
    kindLabel: '客户外勤',
    kindTone: 'bg-amber-100 text-amber-800',
    status: '已通过',
    statusTone: 'bg-emerald-50 text-emerald-700',
    tone: 'border-emerald-100 bg-emerald-50',
    summary: '客户现场定位和业务说明完整，已通过外勤说明。',
    note: '通过后不再记为缺卡，员工记录页与月报已按外勤口径展示。',
    sync: '同步状态：已回写异常中心 / 团队月报',
    rows: [
      { label: '外勤时间', value: '2026-04-24 13:30 - 17:30' },
      { label: '业务地点', value: '科技园 T3 栋客户现场' },
      { label: '处理结果', value: '不计异常', valueTone: 'text-emerald-700 font-semibold' },
      { label: '处理人', value: '张建国（主管）' },
    ],
  },
  {
    applicant: '孙敏',
    avatar: '孙',
    department: '直营一店 · 店员',
    submittedAt: '昨天 19:10 处理',
    kind: '调班',
    kindLabel: '门店调班',
    kindTone: 'bg-emerald-100 text-emerald-800',
    status: '已驳回',
    statusTone: 'bg-red-50 text-red-700',
    tone: 'border-red-100 bg-red-50',
    summary: '与同事互换班次，但未补充交接人与店长确认信息。',
    note: '驳回原因已保留，员工可补充说明后重新提交。',
    sync: '同步状态：未回写月报，仍保持原排班口径',
    rows: [
      { label: '申请班次', value: '与同事互换 2026-04-24 早班' },
      { label: '驳回原因', value: '未补充换班对象与交接说明', valueTone: 'text-red-700 font-semibold' },
      { label: '当前状态', value: '维持原排班' },
      { label: '处理人', value: '门店店长 · 李主管' },
    ],
  },
];

const mineApprovals: ApprovalItem[] = [
  {
    applicant: '我发起的排班提醒',
    avatar: '我',
    department: '技术二组 · 主管动作',
    submittedAt: '今天 08:00 发起',
    kind: '调班',
    kindLabel: '补排班提醒',
    kindTone: 'bg-blue-100 text-blue-800',
    status: '待成员确认',
    statusTone: 'bg-blue-50 text-blue-700',
    tone: 'border-blue-100 bg-blue-50',
    summary: '已向 2 位未排班成员发起补排班确认，等待员工补充自选班次。',
    note: '用于承接店长先提醒、员工再补自选班次的场景。',
    sync: '同步状态：待回写主管排班页',
    rows: [
      { label: '触发场景', value: '当天未排班提醒' },
      { label: '覆盖成员', value: '2 人' },
      { label: '后续动作', value: '成员提交自选班次后进入审批' },
      { label: '提醒频率', value: '未发布前每日提醒' },
    ],
  },
  {
    applicant: '我发起的补卡复核',
    avatar: '我',
    department: '技术二组 · 主管动作',
    submittedAt: '昨天 17:40 发起',
    kind: '补卡',
    kindLabel: '异常复核',
    kindTone: 'bg-orange-100 text-orange-800',
    status: '已同步人事月报',
    statusTone: 'bg-emerald-50 text-emerald-700',
    tone: 'border-slate-200 bg-slate-50',
    summary: '昨天的补卡审批已经通过，并同步到了人事月报中心。',
    note: '主管端审批完成后，人事端重点看回写与留痕，不再重复做日常审批。',
    sync: '同步状态：团队月报 / 人事月报已更新',
    rows: [
      { label: '审批对象', value: '张三 4 月 23 日补卡' },
      { label: '审批结果', value: '已通过', valueTone: 'text-emerald-700 font-semibold' },
      { label: '同步结果', value: '异常已闭环，月报已更新' },
      { label: '留痕状态', value: '已写入日志中心' },
    ],
  },
];

const integrationCards = [
  {
    title: '当前原型审批流',
    status: '已展示',
    desc: '先把补卡、请假、出差、外出、调班的审批边界和回写链路跑通。',
    tone: 'border-blue-100 bg-blue-50 text-blue-900',
  },
  {
    title: '企业微信审批数据',
    status: '待接入',
    desc: '后续可把企微审批单号、审批状态、审批时间和表单明细直接映射进当前卡片结构。',
    tone: 'border-amber-100 bg-amber-50 text-amber-900',
  },
  {
    title: '结果回写与留痕',
    status: '已设计',
    desc: '审批完成后继续回写异常中心、记录页、团队 / 人事月报和日志中心。',
    tone: 'border-emerald-100 bg-emerald-50 text-emerald-900',
  },
];

const sourceMappings = [
  { label: '企微审批单号', value: '外部单据 ID → 当前审批卡片主键' },
  { label: '企微审批状态', value: '审批中 / 已通过 / 已驳回 → 当前状态标签' },
  { label: '表单时间范围', value: '开始时间 / 结束时间 → 当前 rows 明细' },
  { label: '审批意见与附件', value: '审批备注 / 现场照片 → 申请说明与补资料区' },
];

const priorityScenarios = [
  {
    title: '出差中途请假',
    result: '请假优先覆盖对应天数',
    desc: '不要求员工把原出差拆成多张单。请假审批通过后，只覆盖请假日，其余日期仍保留出差口径。',
    tone: 'border-blue-100 bg-blue-50 text-blue-900',
  },
  {
    title: '请假后又来上班并打卡',
    result: '有效打卡优先',
    desc: '如果员工实际到岗并完成有效打卡，就按真实到岗结果回写，不让整天请假覆盖掉实际出勤。',
    tone: 'border-emerald-100 bg-emerald-50 text-emerald-900',
  },
  {
    title: '未排班先自选班次',
    result: '先保住班次口径，再进入主管确认',
    desc: '员工可以先提自选班次避免直接判异常，店长确认后再正式回写排班表和月报。',
    tone: 'border-purple-100 bg-purple-50 text-purple-900',
  },
];

const reminderPreview = {
  title: '主管催办弹窗预览',
  desc: '直营二店有 1 条调班审批已超 24 小时，另有 2 名员工今天仍未排班。',
  cadence: ['首次触发立即弹窗', '未处理时每日 09:30 / 15:00 / 18:00 重复提醒', '月底前持续红点并升级到工作台待办'],
};

function getImpactChips(item: ApprovalItem, pending: boolean) {
  if (pending) {
    if (item.kind === '调班') {
      return ['待店长确认', '通过后修正班次', '同步异常 / 月报'];
    }

    if (item.kind === '出差' || item.kind === '外出') {
      return ['待确认地点', '通过后按场景口径', '月底进入月报'];
    }

    if (item.kind === '请假') {
      return ['待主管审批', '通过后停用缺卡判定', '次月进入员工确认'];
    }

    return ['待主管审批', '待回写异常中心', '待同步团队月报'];
  }

  if (item.status.includes('驳回')) {
    return ['已保留驳回原因', '原结果保持不变', '员工可补资料重提'];
  }

  if (item.status.includes('待成员确认')) {
    return ['已发起提醒', '待成员补充班次', '确认后进入审批'];
  }

  if (item.status.includes('已同步')) {
    return ['审批已完成', '月报已更新', '日志已留痕'];
  }

  return ['审批已完成', '异常已回写', '月报已同步'];
}

function ApprovalCard({ item, pending }: { item: ApprovalItem; pending: boolean }) {
  const impactChips = getImpactChips(item, pending);

  return (
    <div className={`overflow-hidden rounded-3xl border shadow-sm ${item.tone}`}>
      <div className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-700 shadow-sm">
              {item.avatar}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900">{item.applicant}</h2>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.kindTone}`}>{item.kindLabel}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.statusTone}`}>{item.status}</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{item.department}</p>
              <p className="mt-1 text-xs text-slate-400">{item.submittedAt}</p>
            </div>
          </div>
          <div className="rounded-2xl bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
            {item.sync}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {item.rows.map((row) => (
            <div key={row.label} className="rounded-2xl bg-white/80 p-3">
              <p className="text-xs text-slate-500">{row.label}</p>
              <p className={clsx('mt-2 text-sm text-slate-800', row.valueTone)}>{row.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl bg-white/80 p-4">
          <p className="text-sm font-semibold text-slate-900">申请说明</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{item.summary}</p>
          <p className="mt-3 text-xs leading-5 text-slate-500">{item.note}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {impactChips.map((chip) => (
              <span key={chip} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex border-t border-white/70 bg-white/70">
        {pending ? (
          <>
            <button className="flex-1 border-r border-slate-200 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
              驳回
            </button>
            <button className="flex-1 py-3 text-sm font-medium text-blue-600 transition hover:bg-blue-50">
              同意并回写
            </button>
          </>
        ) : (
          <button className="inline-flex flex-1 items-center justify-center py-3 text-sm font-medium text-blue-600 transition hover:bg-blue-50">
            查看同步结果
            <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function ManagerApproval() {
  const [activeTab, setActiveTab] = useState<ApprovalTab>('pending');
  const [activeFilter, setActiveFilter] = useState<ApprovalFilter>('all');
  const [showReminderPreview, setShowReminderPreview] = useState(true);

  const currentList = useMemo(() => {
    const source = activeTab === 'pending' ? pendingApprovals : activeTab === 'processed' ? processedApprovals : mineApprovals;

    if (activeFilter === 'all') {
      return source;
    }

    return source.filter((item) => item.kind === activeFilter);
  }, [activeFilter, activeTab]);

  return (
    <>
      {showReminderPreview ? (
        <div className="pointer-events-none fixed right-6 top-24 z-30 hidden w-80 xl:block">
          <div className="pointer-events-auto rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-indigo-50 p-2 text-indigo-600">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">消息弹窗预览</p>
                  <h2 className="mt-1 text-base font-semibold text-slate-900">{reminderPreview.title}</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReminderPreview(false)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-4 rounded-3xl border border-indigo-100 bg-indigo-50 p-4 text-sm leading-6 text-indigo-900">
              {reminderPreview.desc}
            </p>
            <div className="mt-4 space-y-2 text-xs text-slate-600">
              {reminderPreview.cadence.map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 px-3 py-2">
                  {item}
                </div>
              ))}
            </div>
            <button className="mt-4 w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
              立即处理
            </button>
          </div>
        </div>
      ) : null}

      <header className="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">审批中心</h1>
            <p className="mt-1 text-xs text-gray-500">日常审批优先由主管处理，结果自动同步到异常和月报。</p>
          </div>
          <button className="text-sm font-medium text-blue-600">批量处理</button>
        </div>

        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('pending')}
            className={clsx('flex-1 pb-2 text-sm font-medium transition', activeTab === 'pending' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700')}
          >
            待审批
            <span className="ml-1 inline-flex items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold leading-none text-red-100">
              4
            </span>
          </button>
          <button
            onClick={() => setActiveTab('processed')}
            className={clsx('flex-1 pb-2 text-sm font-medium transition', activeTab === 'processed' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700')}
          >
            已处理
          </button>
          <button
            onClick={() => setActiveTab('mine')}
            className={clsx('flex-1 pb-2 text-sm font-medium transition', activeTab === 'mine' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700')}
          >
            我发起的
          </button>
        </div>
      </header>

      <main className="space-y-4 p-4 pb-20">
        {showReminderPreview ? (
          <section className="rounded-3xl border border-indigo-100 bg-indigo-50 p-4 shadow-sm xl:hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 text-indigo-900">
                <Bell className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
                <div>
                  <p className="text-sm font-semibold">{reminderPreview.title}</p>
                  <p className="mt-2 text-sm leading-6 text-indigo-800">{reminderPreview.desc}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReminderPreview(false)}
                className="rounded-full bg-white p-2 text-indigo-400 shadow-sm transition hover:text-indigo-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </section>
        ) : null}

        <section className="rounded-3xl border border-blue-100 bg-blue-50 p-4 shadow-sm">
          <div className="flex items-start gap-3 text-blue-900">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
            <div>
              <p className="text-sm font-semibold">已按第二阶段沟通补齐主管审批范围</p>
              <p className="mt-2 text-sm leading-6 text-blue-800">
                这里现在不仅看补卡，也承接请假、出差、外出和调班 / 自选排班。审批通过后直接回写异常中心和月报，人事侧重点转为看回写结果与留痕。
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {integrationCards.map((item) => (
            <div key={item.title} className={`rounded-3xl border p-4 shadow-sm ${item.tone}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{item.title}</p>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold">{item.status}</span>
              </div>
              <p className="mt-3 text-sm leading-6 opacity-90">{item.desc}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-base font-semibold">企业微信审批字段映射占位</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              真正接企微时，不需要推倒这页，只要把审批源替换成企微数据，把关键字段映射到当前卡片结构即可。
            </p>
            <div className="mt-4 space-y-3">
              {sourceMappings.map((item) => (
                <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">{item.label}：</span>
                  {item.value}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900">
              <CheckSquare className="h-5 w-5 text-emerald-600" />
              <h2 className="text-base font-semibold">复杂场景优先级</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              把沟通稿里最容易吵起来的交叉场景直接放到审批页，主管处理时能立刻看到优先口径，不用靠记忆拍板。
            </p>
            <div className="mt-4 space-y-3">
              {priorityScenarios.map((item) => (
                <div key={item.title} className={`rounded-2xl border p-4 ${item.tone}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold">{item.result}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 opacity-90">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: '待补卡', value: '1', icon: Clock, tone: 'text-orange-600 bg-orange-50' },
            { label: '待请假', value: '1', icon: Calendar, tone: 'text-blue-600 bg-blue-50' },
            { label: '待出差/外出', value: '1', icon: Plane, tone: 'text-purple-600 bg-purple-50' },
            { label: '待调班', value: '1', icon: RefreshCw, tone: 'text-emerald-600 bg-emerald-50' },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${item.tone}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm text-slate-500">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {[
            { title: '待回写异常中心', value: '2 条', desc: '审批通过后优先更新异常中心，避免主管和员工看到不同结果。', tone: 'border-blue-100 bg-blue-50' },
            { title: '待同步月报', value: '1 条', desc: '涉及请假 / 出差 / 调班的单据要继续同步团队与人事月报。', tone: 'border-amber-100 bg-amber-50' },
            { title: '待补资料', value: '1 条', desc: '驳回原因会保留，员工补充说明后可直接重新提交。', tone: 'border-red-100 bg-red-50' },
          ].map((item) => (
            <div key={item.title} className={`rounded-3xl border p-4 shadow-sm ${item.tone}`}>
              <p className="text-sm text-slate-500">{item.title}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900">
            <Filter className="h-4 w-4 text-slate-500" />
            <p className="text-sm font-semibold">审批类型筛选</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item}
                onClick={() => setActiveFilter(item)}
                className={clsx(
                  'rounded-full px-4 py-2 text-sm font-medium transition',
                  activeFilter === item ? 'bg-gray-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                )}
              >
                {item === 'all' ? '全部类型' : item}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          {currentList.length > 0 ? (
            currentList.map((item) => <ApprovalCard key={`${activeTab}-${item.applicant}-${item.kindLabel}`} item={item} pending={activeTab === 'pending'} />)
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400 shadow-sm">
              当前筛选下暂无记录
            </div>
          )}
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900">
              <CheckSquare className="h-5 w-5 text-emerald-600" />
              <h2 className="text-base font-semibold">审批处理建议</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-4">补卡、请假、出差和调班都先由主管审批，避免人事端承担日常流转。</div>
              <div className="rounded-2xl bg-slate-50 p-4">涉及月报口径变化的单据，要优先处理，避免月底集中堆积。</div>
              <div className="rounded-2xl bg-slate-50 p-4">店长未排班触发的自选班次，要和排班页一起联动确认。</div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-base font-semibold">回写链路</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-4">主管审批通过后，先回写员工异常中心和打卡记录，再同步团队 / 人事月报。</div>
              <div className="rounded-2xl bg-slate-50 p-4">驳回时保留原因，员工可以在申请中心补充说明后再次提交。</div>
              <div className="rounded-2xl bg-slate-50 p-4">真正接入审批流后，这一页的数据结构也可以直接映射企业微信审批数据。</div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
