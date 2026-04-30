import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Briefcase,
  Calendar,
  Clock3,
  FileText,
  Plane,
  RefreshCw,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

type ApplyType = 'reissue' | 'leave' | 'trip' | 'outing' | 'shift';

const applyCards = [
  {
    id: 'reissue' as const,
    title: '补卡申请',
    desc: '缺卡、迟到、早退等异常先补卡说明，再进入主管审批与回写。',
    icon: Clock3,
    tone: 'border-blue-100 bg-blue-50 text-blue-900',
    activeTone: 'border-blue-300 ring-2 ring-blue-100 bg-blue-50',
  },
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
  reissue: {
    eyebrow: '补卡申请草稿',
    title: '先补卡说明，再进入主管审批与回写',
    description: '从打卡记录里的异常日进入后，直接落到补卡申请卡片，先把时间、班次和原因补齐，再同步给主管审批。',
    submitText: '提交补卡说明',
    fields: [
      { label: '补卡日期', value: '2026-04-26', hint: '默认带入当前异常日，避免重复选择。' },
      { label: '补卡班次', value: '上班未打卡', hint: '按当天异常结果自动识别，可继续修改。' },
      { label: '补卡时间', value: '2026-04-26 09:00', hint: '建议填实际到岗时间，便于主管核对。' },
      { label: '审批人', value: '直属主管 · 张建国', hint: '先走直属主管审批，再同步异常中心和月报。' },
    ],
    flow: ['员工提交补卡说明', '直属主管审批', '结果回写记录页 / 异常中心', '月底进入月度确认'],
    syncNotes: [
      '补卡申请通过后，会同步更新打卡记录、异常中心和月报口径。',
      '无故补卡或说明不完整时，主管可驳回并要求补充资料后重提。',
      '建议在异常当天就补卡说明，避免月底集中追补。',
    ],
    afterSubmit: [
      { title: '优先回写记录页', desc: '审批通过后，记录页当天状态会优先更新。' },
      { title: '异常中心同步关闭', desc: '补卡通过后，同步减少对应异常提醒。' },
      { title: '月底仍可复核', desc: '即使已通过，月底确认页仍能继续查看留痕。' },
    ],
  },
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

type DraftState = Record<ApplyType, { fields: Record<string, string>; note: string }>;
type SubmissionStatus = '草稿' | '待主管审批';

type SubmissionItem = {
  id: string;
  type: ApplyType;
  typeTitle: string;
  status: SubmissionStatus;
  submittedAt: string;
  fields: Record<string, string>;
  note: string;
};

function createInitialDraftState(): DraftState {
  return applyCards.reduce((acc, card) => {
    const config = draftConfigs[card.id];
    const fields = config.fields.reduce<Record<string, string>>((fieldAcc, field) => {
      fieldAcc[field.label] = field.value;
      return fieldAcc;
    }, {});

    acc[card.id] = { fields, note: '' };
    return acc;
  }, {} as DraftState);
}

export default function EmployeeApply() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchType = searchParams.get('type');
  const activeType = applyCards.some((item) => item.id === searchType) ? (searchType as ApplyType) : 'leave';

  const [draftState, setDraftState] = useState<DraftState>(() => createInitialDraftState());
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [editingSubmissionId, setEditingSubmissionId] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState('');

  const activeCard = applyCards.find((item) => item.id === activeType) ?? applyCards[0];
  const draft = draftConfigs[activeType];
  const activeDraft = draftState[activeType];

  const submissionsOfActiveType = useMemo(
    () => submissions.filter((item) => item.type === activeType),
    [activeType, submissions],
  );

  const handleTypeChange = (type: ApplyType) => {
    setSubmitMessage('');
    setEditingSubmissionId(null);
    setSearchParams(type === 'leave' ? {} : { type });
  };

  const handleFieldChange = (label: string, value: string) => {
    setDraftState((current) => ({
      ...current,
      [activeType]: {
        ...current[activeType],
        fields: {
          ...current[activeType].fields,
          [label]: value,
        },
      },
    }));
  };

  const handleNoteChange = (value: string) => {
    setDraftState((current) => ({
      ...current,
      [activeType]: {
        ...current[activeType],
        note: value,
      },
    }));
  };

  const upsertSubmission = (status: SubmissionStatus) => {
    const nowText = new Date().toLocaleString('zh-CN', { hour12: false });
    const basePayload: Omit<SubmissionItem, 'id'> = {
      type: activeType,
      typeTitle: activeCard.title,
      status,
      submittedAt: nowText,
      fields: { ...activeDraft.fields },
      note: activeDraft.note,
    };

    if (editingSubmissionId) {
      const updatedId = editingSubmissionId;
      setSubmissions((current) =>
        current.map((item) => (item.id === updatedId ? { ...item, ...basePayload, id: updatedId } : item)),
      );
      setSubmitMessage(`已更新 ${activeCard.title}（单号 ${updatedId}），当前状态：${status}。`);
      setEditingSubmissionId(null);
      return;
    }

    const id = `AP-${Date.now().toString().slice(-8)}`;
    const newSubmission: SubmissionItem = { id, ...basePayload };
    setSubmissions((current) => [newSubmission, ...current]);
    setSubmitMessage(`已创建 ${activeCard.title}（单号 ${id}），当前状态：${status}。`);
  };

  const handleSaveDraft = () => {
    upsertSubmission('草稿');
  };

  const handleSubmit = () => {
    upsertSubmission('待主管审批');
  };

  const handleEditSubmission = (target: SubmissionItem) => {
    setSearchParams(target.type === 'leave' ? {} : { type: target.type });
    setDraftState((current) => ({
      ...current,
      [target.type]: {
        fields: { ...target.fields },
        note: target.note,
      },
    }));
    setEditingSubmissionId(target.id);
    setSubmitMessage(`已载入单号 ${target.id}，你可以继续修改后保存或提交。`);
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {applyCards.map((item) => {
          const isActive = item.id === activeType;

          return (
            <button
              key={item.title}
              type="button"
              onClick={() => handleTypeChange(item.id)}
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

      <section className="mt-6">
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
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">当前类型：{activeCard.title}</span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {draft.fields.map((field) => (
                <div key={field.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <label className="text-sm text-slate-500">{field.label}</label>
                  <input
                    value={activeDraft.fields[field.label] ?? ''}
                    onChange={(event) => handleFieldChange(field.label, event.target.value)}
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <p className="mt-2 text-xs leading-5 text-slate-500">{field.hint}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <label className="text-sm font-medium text-slate-700">补充说明</label>
              <textarea
                value={activeDraft.note}
                onChange={(event) => handleNoteChange(event.target.value)}
                rows={3}
                placeholder="可补充审批背景、临时调整原因、地点说明等"
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
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

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                保存草稿
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                {editingSubmissionId ? `更新并提交（${editingSubmissionId}）` : draft.submitText}
              </button>
            </div>

            {submitMessage ? (
              <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
                <p className="font-semibold">操作成功</p>
                <p className="mt-2">{submitMessage}</p>
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">最近提单记录（{activeCard.title}）</h3>
            <p className="mt-1 text-sm text-slate-500">点击“继续编辑”可把历史单据加载回表单，继续修改后再提交。</p>

            {submissionsOfActiveType.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                当前类型还没有提单记录，先填写上面的字段并点击“保存草稿”或“提交”。
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {submissionsOfActiveType.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.id}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.submittedAt}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === '待主管审批' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{Object.entries(item.fields).slice(0, 2).map((entry) => `${entry[0]}：${entry[1]}`).join('；')}</p>
                    {item.note ? <p className="mt-2 text-xs text-slate-500">备注：{item.note}</p> : null}
                    <button
                      type="button"
                      onClick={() => handleEditSubmission(item)}
                      className="mt-3 inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      继续编辑
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
