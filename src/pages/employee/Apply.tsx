import { useState } from 'react';
import { AlertCircle, ArrowRight, Briefcase, Calendar, CheckSquare, Clock, FileText, MapPin, Plane, RefreshCw } from 'lucide-react';

type ApplyType = 'leave' | 'trip' | 'outing' | 'shift';

type SceneValidationConfig = {
  title: string;
  description: string;
  cases: Array<{
    scene: string;
    result: string;
    note: string;
    tone: string;
  }>;
  evidence: string[];
  fallback: string[];
};

const applyCards = [
  {
    id: 'leave' as const,
    title: '请假申请',
    desc: '事假、病假、年假统一走主管审批，审批结果会同步进入月报。',
    icon: Calendar,
    tone: 'border-blue-100 bg-blue-50 text-blue-900',
    activeTone: 'border-blue-300 ring-2 ring-blue-100 bg-blue-50',
  },
  {
    id: 'trip' as const,
    title: '出差申请',
    desc: '出差时间、地点和打卡要求一起提交，避免月底还要人工补解释。',
    icon: Plane,
    tone: 'border-purple-100 bg-purple-50 text-purple-900',
    activeTone: 'border-purple-300 ring-2 ring-purple-100 bg-purple-50',
  },
  {
    id: 'outing' as const,
    title: '外出 / 外勤申请',
    desc: '临时外出、客户拜访、门店支援可统一登记，结果同步异常和月报口径。',
    icon: Briefcase,
    tone: 'border-amber-100 bg-amber-50 text-amber-900',
    activeTone: 'border-amber-300 ring-2 ring-amber-100 bg-amber-50',
  },
  {
    id: 'shift' as const,
    title: '调班 / 自选排班',
    desc: '主管未及时排班时，可提交调班或自选班次申请，减少误判缺卡和迟到。',
    icon: RefreshCw,
    tone: 'border-emerald-100 bg-emerald-50 text-emerald-900',
    activeTone: 'border-emerald-300 ring-2 ring-emerald-100 bg-emerald-50',
  },
];

const recentItems = [
  {
    title: '武汉出差申请',
    detail: '2026-04-28 至 2026-04-30 · 等待主管审批',
    status: '审批中',
    tone: 'bg-amber-50 text-amber-700',
    next: '今天 18:00 前预计给出审批结果，可先撤回修改行程。',
  },
  {
    title: '4 月 24 日外勤说明',
    detail: '客户现场定位已提交，已同步异常中心',
    status: '已通过',
    tone: 'bg-emerald-50 text-emerald-700',
    next: '结果已回写记录页和月报，不需要再单独补解释。',
  },
  {
    title: '门店晚班自选排班',
    detail: '因店长未及时排班，已选择 14:00 - 22:00 班次',
    status: '待确认',
    tone: 'bg-blue-50 text-blue-700',
    next: '店长确认后会自动修正当日异常，不必月底再人工说明。',
  },
];

const draftConfigs: Record<ApplyType, {
  eyebrow: string;
  title: string;
  description: string;
  submitText: string;
  fields: { label: string; value: string; hint: string }[];
  flow: string[];
  syncNotes: string[];
  afterSubmit: { title: string; desc: string }[];
}> = {
  leave: {
    eyebrow: '请假提单草稿',
    title: '请假优先走主管审批，不建议月底再补解释',
    description: '结合第二阶段沟通，把请假直接纳入员工端入口，并明确审批后会同步到异常中心和月报结果。',
    submitText: '提交请假给直属主管',
    fields: [
      { label: '请假类型', value: '事假（半天）', hint: '支持事假 / 病假 / 年假，后续可继续扩展其他假类。' },
      { label: '请假时间', value: '2026-04-30 09:00 - 13:00', hint: '支持半天、整天和跨天申请。' },
      { label: '审批人', value: '直属主管 · 张建国', hint: '日常审批默认先走主管，不直接落到人事。' },
      { label: '月报影响', value: '审批通过后计入月报假期天数', hint: '月底确认时会显示在员工月度结果里。' },
    ],
    flow: ['员工提交请假', '主管审批', '结果回写异常中心 / 月报', '月底进入月度确认'],
    syncNotes: [
      '假期审批结果会直接影响最终考勤结果，不再单独留在申请列表里。',
      '如果当天已经产生有效打卡，后续规则会按“有效打卡优先”处理，不让整天请假覆盖实际到岗。',
      '月底前仍在审批中的单据，会在月度确认页里继续提醒。',
    ],
    afterSubmit: [
      { title: '可撤回修改', desc: '主管未处理前可撤回调整时间或请假类型。' },
      { title: '审批通过即生效', desc: '通过后同步月报假期天数，不再按缺卡或旷工处理。' },
      { title: '月底继续提醒', desc: '若仍审批中，会在月度确认页继续提示。' },
    ],
  },
  trip: {
    eyebrow: '出差提单草稿',
    title: '出差时间、地点和打卡要求一起提交',
    description: '补上沟通稿里“出差地点、现场打卡、月报同步”的信息层，让员工不只是看到入口。',
    submitText: '提交出差给直属主管',
    fields: [
      { label: '出差地点', value: '武汉 · 经销商巡店', hint: '支持填写城市、客户或门店名称。' },
      { label: '出差时间', value: '2026-04-28 至 2026-04-30', hint: '支持多日出差与阶段性行程说明。' },
      { label: '打卡要求', value: '地点 + 现场照片', hint: '酒店 / 宾馆定位默认不足，需要补充客户现场或门店证据。' },
      { label: '月报影响', value: '审批通过后按出差口径计入月报', hint: '避免月底再人工解释出差记录。' },
    ],
    flow: ['员工提交出差', '主管确认场景与地点', '结果同步外勤 / 出差记录', '月底进入团队与人事月报'],
    syncNotes: [
      '出差审批通过后，会联动打卡记录和月报结果，不再与日常打卡脱节。',
      '出差中若再请假，系统按“请假优先覆盖对应天数”处理，不要求员工拆多张出差单。',
      '如果定位或现场照片不满足要求，主管可驳回并要求补充说明。',
    ],
    afterSubmit: [
      { title: '先核地点', desc: '主管会先确认客户或门店地点，再决定是否通过。' },
      { title: '支持补资料', desc: '若照片或地点不足，可直接补充说明后继续处理。' },
      { title: '结果自动联动', desc: '通过后同步出差记录、异常口径和月报结果。' },
    ],
  },
  outing: {
    eyebrow: '外出 / 外勤提单草稿',
    title: '外出、外勤统一承接，避免只打卡不留业务说明',
    description: '把客户拜访、临时外出、门店支援这些常见场景单独承接下来，避免月底只剩一条定位记录。',
    submitText: '提交外出 / 外勤说明',
    fields: [
      { label: '业务场景', value: '客户拜访 · 科技园 T3 栋', hint: '支持客户现场、临时外出、门店支援等场景。' },
      { label: '计划时段', value: '2026-04-25 13:30 - 17:30', hint: '支持半日外出和当天往返。' },
      { label: '打卡方式', value: '外勤打卡 + 地点说明', hint: '建议补充客户 / 门店信息；酒店、商场等非业务地点默认要二次核验。' },
      { label: '异常联动', value: '通过后不再算缺卡 / 异常', hint: '主管审批通过后直接回写异常中心。' },
    ],
    flow: ['员工提交外出 / 外勤', '主管确认业务场景', '外勤记录回写异常中心', '月底归入月报结果'],
    syncNotes: [
      '外勤 / 外出申请通过后，员工记录页、异常中心和月报口径保持一致。',
      '如果考勤组允许“可直接外勤打卡”，后续也可以在规则中继续配置豁免。',
      '建议附上地点和业务说明，减少主管来回沟通。',
    ],
    afterSubmit: [
      { title: '缺资料可补传', desc: '地点、业务说明或现场照片不足时，可以继续补充。' },
      { title: '通过后不记异常', desc: '审批通过会直接覆盖外出时段内的缺卡或异常状态。' },
      { title: '月报保留留痕', desc: '外勤场景和地点会一起进入最终月报导出。' },
    ],
  },
  shift: {
    eyebrow: '调班 / 自选排班草稿',
    title: '主管没排班时，员工也能先提自选班次',
    description: '这是沟通稿里特别提到的缺口：店长未排班时，员工需要有自选排班或调班入口，避免直接判成缺卡。',
    submitText: '提交调班 / 自选排班',
    fields: [
      { label: '班次选择', value: '门店晚班 · 14:00 - 22:00', hint: '班次命名直接按时间段显示，更容易理解。' },
      { label: '申请原因', value: '店长当天未排班，先自选班次上岗', hint: '支持店长未排班 / 与同事调班等说明。' },
      { label: '审批人', value: '门店店长 / 直属主管', hint: '通过后同步到主管排班页和审批中心。' },
      { label: '结果联动', value: '通过后修正当日缺卡 / 迟到口径', hint: '防止未排班直接影响异常和月报。' },
    ],
    flow: ['员工提交调班 / 自选班次', '主管在审批中心确认', '结果回写排班表', '月报按确认后的班次口径计算'],
    syncNotes: [
      '店长未及时排班时，员工可以先自选班次，再由主管集中确认。',
      '调班与自选排班会同步进入主管排班页，不再只停留在员工端。',
      '如果排班已发布，主管仍可在审批后做局部修正并保留记录。',
    ],
    afterSubmit: [
      { title: '先保住当日口径', desc: '提交后至少能避免系统直接把当天判成无班次异常。' },
      { title: '主管确认后回写', desc: '审批通过会自动回写排班表、异常中心和月报。' },
      { title: '驳回仍可重提', desc: '若缺少换班对象或交接说明，可补资料后再次提交。' },
    ],
  },
};

const sceneValidationConfigs: Partial<Record<ApplyType, SceneValidationConfig>> = {
  trip: {
    title: '出差场景校验',
    description: '把“酒店不算、客户现场才算”这类判断直接做成可见规则，主管审批时不再只靠口头理解。',
    cases: [
      {
        scene: '客户门店 / 经销商现场',
        result: '优先通过',
        note: '定位落在客户门店、展厅、经销商办公点，并附现场照片时，可直接按出差口径处理。',
        tone: 'border-emerald-100 bg-emerald-50 text-emerald-900',
      },
      {
        scene: '高铁站 / 机场 / 转场途中',
        result: '需补充行程说明',
        note: '可作为过渡证据，但不能单独替代客户现场，需要补充行程单或后续现场记录。',
        tone: 'border-amber-100 bg-amber-50 text-amber-900',
      },
      {
        scene: '酒店 / 宾馆 / 住处周边',
        result: '默认不通过',
        note: '仅有酒店定位不足以证明实际工作场景，需要补充客户现场或门店证据后再审批。',
        tone: 'border-red-100 bg-red-50 text-red-900',
      },
    ],
    evidence: ['客户或门店名称', '现场照片', '当日计划 / 拜访说明', '必要时补充行程凭证'],
    fallback: ['证据不足先驳回并保留原因', '可补资料后二次提交', '审批通过后同步记录页、月报和异常口径'],
  },
  outing: {
    title: '外勤 / 外出场景校验',
    description: '把临时外出和客户拜访拆成清晰判断标准，避免月底只看到一条定位而看不懂业务背景。',
    cases: [
      {
        scene: '客户现场 / 门店支援 / 园区拜访',
        result: '按外勤口径',
        note: '有明确业务对象和时间段时，可直接作为合法外勤，不再计缺卡。',
        tone: 'border-emerald-100 bg-emerald-50 text-emerald-900',
      },
      {
        scene: '商场 / 社区 / 园区周边',
        result: '需补业务说明',
        note: '定位可能合理，但必须写清客户对象、门店名称或支援任务，否则主管难以判断。',
        tone: 'border-amber-100 bg-amber-50 text-amber-900',
      },
      {
        scene: '酒店 / 餐饮 / 非业务地点',
        result: '默认二次核验',
        note: '非业务场景需要补充照片、联系人或任务说明，否则不能直接覆盖异常。',
        tone: 'border-red-100 bg-red-50 text-red-900',
      },
    ],
    evidence: ['外出对象 / 门店名称', '地点说明', '必要时附现场照片', '返回时间或处理结果'],
    fallback: ['主管可先要求补资料', '考勤组允许免审批时仍保留留痕', '通过后覆盖外出时段内异常结果'],
  },
};

const collisionRules = [
  {
    title: '出差中途请假',
    result: '请假优先覆盖对应天数',
    desc: '员工不需要把原出差拆成多张单，只要请假审批通过，系统自动覆盖那几天的出差口径。',
    tone: 'border-blue-100 bg-blue-50 text-blue-900',
  },
  {
    title: '请假后又来上班并打卡',
    result: '有效打卡优先',
    desc: '如果员工当天实际到岗并完成有效打卡，就按真实出勤回写，不让整天请假覆盖实际工作。',
    tone: 'border-emerald-100 bg-emerald-50 text-emerald-900',
  },
  {
    title: '未排班先自选班次',
    result: '先保住班次，再做主管确认',
    desc: '避免门店当天无班次就直接判缺卡；员工先提班次，店长后确认，结果再统一回写。',
    tone: 'border-purple-100 bg-purple-50 text-purple-900',
  },
];

export default function EmployeeApply() {
  const [activeType, setActiveType] = useState<ApplyType>('leave');

  const activeCard = applyCards.find((item) => item.id === activeType) ?? applyCards[0];
  const draft = draftConfigs[activeType];
  const sceneValidation = sceneValidationConfigs[activeType];

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-5 text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
        <p className="text-sm text-slate-300">员工申请中心</p>
        <h1 className="mt-2 text-2xl font-semibold">请假、出差、外出和调班统一在这里提单</h1>
        <p className="mt-3 text-sm leading-6 text-slate-200">
          第二阶段沟通里提到的请假、出差、外出、调班和自选排班入口，现在不只保留入口，也补上了提单内容层、场景校验和审批同步说明。
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {applyCards.map((item) => {
          const isActive = item.id === activeType;

          return (
            <button
              key={item.title}
              onClick={() => setActiveType(item.id)}
              className={`rounded-3xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${isActive ? item.activeTone : item.tone}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
                  <item.icon className="h-5 w-5" />
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isActive ? 'bg-white text-slate-900' : 'bg-white/70 text-current'}`}>
                  {isActive ? '当前提单' : '切换查看'}
                </span>
              </div>
              <h2 className="mt-4 text-lg font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 opacity-90">{item.desc}</p>
              <span className="mt-4 inline-flex items-center text-sm font-semibold">
                {isActive ? '正在编辑提单' : '进入提单'}
                <ArrowRight className="ml-1 h-4 w-4" />
              </span>
            </button>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-blue-600">{draft.eyebrow}</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">{draft.title}</h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 shadow-sm">
                <activeCard.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">{draft.description}</p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-1">审批人：直属主管</span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">回写：异常中心 / 月报</span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">手机端先提单，再做后续处理</span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {draft.fields.map((field) => (
                <div key={field.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">{field.label}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{field.value}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{field.hint}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-center gap-2 text-blue-900">
                <FileText className="h-4 w-4" />
                <p className="text-sm font-semibold">审批路径</p>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {draft.flow.map((item, index) => (
                  <div key={item} className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                    <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      {index + 1}
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <button className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
              {draft.submitText}
            </button>
          </div>

          <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
            <div className="flex items-start gap-3 text-amber-900">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <h2 className="text-sm font-semibold">审批与月报同步规则</h2>
                <div className="mt-3 space-y-3 text-sm leading-6 text-amber-800">
                  {draft.syncNotes.map((item) => (
                    <div key={item} className="rounded-2xl bg-white/70 p-4">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">最近申请记录</h2>
            </div>
            <div className="mt-4 space-y-3">
              {recentItems.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{item.detail}</p>
                      <p className="mt-2 text-xs leading-5 text-slate-400">{item.next}</p>
                    </div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.tone}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900">
              <CheckSquare className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold">提交后会发生什么</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {draft.afterSubmit.map((item) => (
                <div key={item.title} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-2 leading-6 text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900">
              <CheckSquare className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold">提单说明</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-4">请假、出差、外出、调班统一走主管审批，不把日常审批直接压给人事。</div>
              <div className="rounded-2xl bg-slate-50 p-4">主管审批后会同步异常中心、记录页和月报结果，月底再统一确认。</div>
              <div className="rounded-2xl bg-slate-50 p-4">如果门店当天未排班，可先发起自选排班，避免直接被判缺卡或迟到。</div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900">
              <Clock className="h-5 w-5 text-slate-500" />
              <h2 className="text-lg font-semibold">处理节奏建议</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-4">当天知道自己要请假 / 出差时，尽量在打卡前完成提单。</div>
              <div className="rounded-2xl bg-slate-50 p-4">外勤 / 出差建议同时附带地点和业务说明，主管会更快确认。</div>
              <div className="rounded-2xl bg-slate-50 p-4">月底前把审批中的单据清完，避免影响月度结果确认和主管月报。</div>
            </div>
          </div>

          {sceneValidation ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-slate-900">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold">{sceneValidation.title}</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-500">{sceneValidation.description}</p>

              <div className="mt-4 space-y-3">
                {sceneValidation.cases.map((item) => (
                  <div key={item.scene} className={`rounded-2xl border p-4 ${item.tone}`}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{item.scene}</p>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold">{item.result}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 opacity-90">{item.note}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">建议提交的证据</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    {sceneValidation.evidence.map((item) => (
                      <div key={item} className="rounded-2xl bg-white px-3 py-2">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">证据不足时怎么处理</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    {sceneValidation.fallback.map((item) => (
                      <div key={item} className="rounded-2xl bg-white px-3 py-2">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-slate-900">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold">定位 / 说明补充</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-4">出差和外勤场景建议附带定位、现场照片或业务地点说明，方便主管判断是否符合要求。</div>
                <div className="rounded-2xl bg-slate-50 p-4">后续真正接入企业微信审批或第三方审批流时，这里的字段也可以直接映射过去。</div>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-semibold">交叉场景优先级</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              把二阶段沟通里最容易引起争议的几种场景直接写成可见规则，员工和主管都能在提单时先看到处理口径。
            </p>
            <div className="mt-4 space-y-3">
              {collisionRules.map((item) => (
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
        </div>
      </section>
    </div>
  );
}
