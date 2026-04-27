import { useMemo, useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronLeft, ChevronRight, Clock, Copy, RefreshCw, Users, X } from 'lucide-react';
import { Link } from 'react-router-dom';

type Department = '技术二组' | '直营二店';
type ViewMode = 'week' | 'month';
type ShiftCode = 'day' | 'late' | 'off' | 'pending' | 'recommend';

type ShiftCell = {
  code: ShiftCode;
  label: string;
  detail?: string;
};

type ScheduleMember = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  avatarTone: string;
  entries: ShiftCell[];
};

type ShiftRequest = {
  name: string;
  department: string;
  type: string;
  detail: string;
  nextStep: string;
  tone: string;
};

type ScheduleEditor = {
  memberId: string;
  memberName: string;
  dayIndex: number;
  dayLabel: string;
} | null;

const departments: Department[] = ['技术二组', '直营二店'];

const weekOptions = [
  {
    title: '2026年 5月 第4周',
    dates: [
      { label: '一', date: '20' },
      { label: '二', date: '21' },
      { label: '三', date: '22' },
      { label: '四', date: '23' },
      { label: '五', date: '24' },
      { label: '六', date: '25' },
      { label: '日', date: '26' },
    ],
  },
  {
    title: '2026年 5月 第1周',
    dates: [
      { label: '一', date: '27' },
      { label: '二', date: '28' },
      { label: '三', date: '29' },
      { label: '四', date: '30' },
      { label: '五', date: '31' },
      { label: '六', date: '01' },
      { label: '日', date: '02' },
    ],
  },
  {
    title: '2026年 5月 第2周',
    dates: [
      { label: '一', date: '03' },
      { label: '二', date: '04' },
      { label: '三', date: '05' },
      { label: '四', date: '06' },
      { label: '五', date: '07' },
      { label: '六', date: '08' },
      { label: '日', date: '09' },
    ],
  },
] as const;

const shiftOptions: ShiftCell[] = [
  { code: 'day', label: '朝 9 晚 6', detail: '09-18' },
  { code: 'late', label: '门店晚班', detail: '14-22' },
  { code: 'off', label: '休息', detail: '无需打卡' },
  { code: 'recommend', label: '系统推荐', detail: '待发布前确认' },
];

const shiftRequestsByDepartment: Record<Department, ShiftRequest[]> = {
  技术二组: [
    {
      name: '赵六',
      department: '技术二组 · 前端开发',
      type: '自选排班',
      detail: '主管补班前，员工先选择朝 9 晚 6 作为当天班次样本，等待确认。',
      nextStep: '确认后自动回写本周班表和异常中心。',
      tone: 'border-emerald-100 bg-emerald-50 text-emerald-900',
    },
    {
      name: '孙敏',
      department: '技术二组 · 测试工程师',
      type: '调班申请',
      detail: '申请把周五改成休息，周六补班，避免本周迭代联调时间冲突。',
      nextStep: '确认后同步团队月报和排班结果。',
      tone: 'border-blue-100 bg-blue-50 text-blue-900',
    },
  ],
  直营二店: [
    {
      name: '李四',
      department: '直营二店 · 店员',
      type: '自选排班',
      detail: '门店当天未排班，员工先选择门店晚班 14:00 - 22:00，等待店长确认。',
      nextStep: '审批通过后自动回写本周班表和异常中心。',
      tone: 'border-emerald-100 bg-emerald-50 text-emerald-900',
    },
    {
      name: '王敏',
      department: '直营二店 · 店员',
      type: '调班申请',
      detail: '申请与同事互换周六晚班，已补充交接说明，等待主管确认。',
      nextStep: '确认后自动覆盖原排班，避免月底仍按旧班次判异常。',
      tone: 'border-blue-100 bg-blue-50 text-blue-900',
    },
  ],
};

const scheduleTips = [
  '未发布前，店长会在每天 10:00 / 16:00 收到未排班提醒。',
  '支持引用上周模板，减少重复手动排班。',
  '员工自选班次进入审批后，确认结果会直接回写排班页、异常中心和月报口径。',
];

const publishFlow = [
  {
    title: '发布班表',
    desc: '发布后冻结当前周排班版本，员工端可以立即看到最终班次。',
    tone: 'border-blue-100 bg-blue-50',
  },
  {
    title: '复核异常',
    desc: '未排班导致的风险会自动复核，仍异常的继续留在异常中心。',
    tone: 'border-amber-100 bg-amber-50',
  },
  {
    title: '同步月报',
    desc: '自选班次 / 调班审批结果会带入团队月报，不需要月底再人工解释。',
    tone: 'border-emerald-100 bg-emerald-50',
  },
];

const initialScheduleMap: Record<string, ScheduleMember[]> = {
  '技术二组-0': [
    {
      id: 'wang-xm',
      name: '王小明',
      role: '前端开发',
      avatar: '王',
      avatarTone: 'bg-blue-100 text-blue-600',
      entries: [
        { code: 'day', label: '朝 9 晚 6', detail: '09-18' },
        { code: 'day', label: '朝 9 晚 6', detail: '09-18' },
        { code: 'day', label: '朝 9 晚 6', detail: '09-18' },
        { code: 'day', label: '朝 9 晚 6', detail: '09-18' },
        { code: 'day', label: '朝 9 晚 6', detail: '09-18' },
        { code: 'off', label: '休息' },
        { code: 'off', label: '休息' },
      ],
    },
    {
      id: 'li-dh',
      name: '李大华',
      role: '测试工程师',
      avatar: '李',
      avatarTone: 'bg-green-100 text-green-600',
      entries: [
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'late', label: '门店晚班', detail: '门店联调' },
        { code: 'pending', label: '+ 排班' },
        { code: 'pending', label: '+ 排班' },
        { code: 'off', label: '休息' },
        { code: 'off', label: '休息' },
      ],
    },
  ],
  '技术二组-1': [
    {
      id: 'wang-xm',
      name: '王小明',
      role: '前端开发',
      avatar: '王',
      avatarTone: 'bg-blue-100 text-blue-600',
      entries: [
        { code: 'day', label: '朝 9 晚 6', detail: '09-18' },
        { code: 'day', label: '朝 9 晚 6', detail: '09-18' },
        { code: 'day', label: '朝 9 晚 6', detail: '09-18' },
        { code: 'off', label: '休息' },
        { code: 'day', label: '朝 9 晚 6', detail: '09-18' },
        { code: 'off', label: '休息' },
        { code: 'off', label: '休息' },
      ],
    },
    {
      id: 'li-dh',
      name: '李大华',
      role: '测试工程师',
      avatar: '李',
      avatarTone: 'bg-green-100 text-green-600',
      entries: [
        { code: 'recommend', label: '系统推荐', detail: '待确认' },
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'late', label: '门店晚班', detail: '门店联调' },
        { code: 'pending', label: '+ 排班' },
        { code: 'off', label: '休息' },
        { code: 'off', label: '休息' },
      ],
    },
  ],
  '技术二组-2': [
    {
      id: 'wang-xm',
      name: '王小明',
      role: '前端开发',
      avatar: '王',
      avatarTone: 'bg-blue-100 text-blue-600',
      entries: [
        { code: 'day', label: '朝 9 晚 6', detail: '09-18' },
        { code: 'day', label: '朝 9 晚 6', detail: '09-18' },
        { code: 'pending', label: '+ 排班' },
        { code: 'pending', label: '+ 排班' },
        { code: 'day', label: '朝 9 晚 6', detail: '09-18' },
        { code: 'off', label: '休息' },
        { code: 'off', label: '休息' },
      ],
    },
    {
      id: 'li-dh',
      name: '李大华',
      role: '测试工程师',
      avatar: '李',
      avatarTone: 'bg-green-100 text-green-600',
      entries: [
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'off', label: '休息' },
        { code: 'off', label: '休息' },
      ],
    },
  ],
  '直营二店-0': [
    {
      id: 'chen-jy',
      name: '陈佳怡',
      role: '店员',
      avatar: '陈',
      avatarTone: 'bg-amber-100 text-amber-700',
      entries: [
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'off', label: '休息' },
        { code: 'late', label: '门店晚班', detail: '周末营业' },
        { code: 'late', label: '门店晚班', detail: '周末营业' },
      ],
    },
    {
      id: 'zhou-tt',
      name: '周婷婷',
      role: '店员',
      avatar: '周',
      avatarTone: 'bg-rose-100 text-rose-600',
      entries: [
        { code: 'pending', label: '+ 排班' },
        { code: 'pending', label: '+ 排班' },
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'off', label: '休息' },
        { code: 'off', label: '休息' },
      ],
    },
  ],
  '直营二店-1': [
    {
      id: 'chen-jy',
      name: '陈佳怡',
      role: '店员',
      avatar: '陈',
      avatarTone: 'bg-amber-100 text-amber-700',
      entries: [
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'off', label: '休息' },
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'late', label: '门店晚班', detail: '周末营业' },
        { code: 'off', label: '休息' },
      ],
    },
    {
      id: 'zhou-tt',
      name: '周婷婷',
      role: '店员',
      avatar: '周',
      avatarTone: 'bg-rose-100 text-rose-600',
      entries: [
        { code: 'recommend', label: '系统推荐', detail: '待确认' },
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'off', label: '休息' },
        { code: 'off', label: '休息' },
      ],
    },
  ],
  '直营二店-2': [
    {
      id: 'chen-jy',
      name: '陈佳怡',
      role: '店员',
      avatar: '陈',
      avatarTone: 'bg-amber-100 text-amber-700',
      entries: [
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'pending', label: '+ 排班' },
        { code: 'pending', label: '+ 排班' },
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'off', label: '休息' },
        { code: 'off', label: '休息' },
      ],
    },
    {
      id: 'zhou-tt',
      name: '周婷婷',
      role: '店员',
      avatar: '周',
      avatarTone: 'bg-rose-100 text-rose-600',
      entries: [
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'late', label: '门店晚班', detail: '14-22' },
        { code: 'off', label: '休息' },
        { code: 'off', label: '休息' },
      ],
    },
  ],
};

function cloneMembers(members: ScheduleMember[]) {
  return members.map((member) => ({
    ...member,
    entries: member.entries.map((entry) => ({ ...entry })),
  }));
}

function getRecommendedShift(department: Department): ShiftCell {
  return department === '直营二店'
    ? { code: 'recommend', label: '系统推荐', detail: '门店晚班待确认' }
    : { code: 'recommend', label: '系统推荐', detail: '朝 9 晚 6 待确认' };
}

function getCellClassName(cell: ShiftCell) {
  if (cell.code === 'day') {
    return 'border border-transparent bg-blue-50 text-blue-900 hover:border-blue-300 hover:bg-blue-100';
  }

  if (cell.code === 'late') {
    return 'border border-transparent bg-purple-50 text-purple-900 hover:border-purple-300 hover:bg-purple-100';
  }

  if (cell.code === 'recommend') {
    return 'border border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100';
  }

  if (cell.code === 'pending') {
    return 'border-2 border-dashed border-red-300 bg-red-50 text-red-600 hover:bg-red-100';
  }

  return 'border border-transparent bg-white text-slate-500 hover:bg-slate-50';
}

export default function ManagerSchedule() {
  const [selectedDepartment, setSelectedDepartment] = useState<Department>('技术二组');
  const [weekIndex, setWeekIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [scheduleMap, setScheduleMap] = useState<Record<string, ScheduleMember[]>>(() => {
    const nextMap: Record<string, ScheduleMember[]> = {};

    Object.entries(initialScheduleMap).forEach(([key, value]) => {
      nextMap[key] = cloneMembers(value);
    });

    return nextMap;
  });
  const [editor, setEditor] = useState<ScheduleEditor>(null);
  const [actionMessage, setActionMessage] = useState('');
  const [publishedMap, setPublishedMap] = useState<Record<string, boolean>>({});

  const currentKey = `${selectedDepartment}-${weekIndex}`;
  const currentWeek = weekOptions[weekIndex];
  const currentMembers = useMemo(() => scheduleMap[currentKey] ?? [], [currentKey, scheduleMap]);
  const currentRequests = shiftRequestsByDepartment[selectedDepartment];

  const isPublished = publishedMap[currentKey] ?? false;

  const pendingSlots = useMemo(
    () => currentMembers.reduce((total, member) => total + member.entries.filter((entry) => entry.code === 'pending').length, 0),
    [currentMembers],
  );

  const recommendedSlots = useMemo(
    () => currentMembers.reduce((total, member) => total + member.entries.filter((entry) => entry.code === 'recommend').length, 0),
    [currentMembers],
  );

  const scheduledMembers = useMemo(
    () => currentMembers.filter((member) => member.entries.every((entry) => entry.code !== 'pending')).length,
    [currentMembers],
  );

  const monthSummary = useMemo(
    () =>
      currentMembers.map((member) => {
        const filledDays = member.entries.filter((entry) => entry.code === 'day' || entry.code === 'late').length;
        const offDays = member.entries.filter((entry) => entry.code === 'off').length;
        const recommendDays = member.entries.filter((entry) => entry.code === 'recommend').length;
        const missingDays = member.entries.filter((entry) => entry.code === 'pending').length;

        return {
          ...member,
          filledDays,
          offDays,
          recommendDays,
          missingDays,
        };
      }),
    [currentMembers],
  );

  const updateCurrentMembers = (updater: (members: ScheduleMember[]) => ScheduleMember[]) => {
    setScheduleMap((current) => ({
      ...current,
      [currentKey]: updater(current[currentKey] ?? []),
    }));
    setPublishedMap((current) => ({
      ...current,
      [currentKey]: false,
    }));
  };

  const handleSwitchDepartment = () => {
    const currentIndex = departments.indexOf(selectedDepartment);
    const nextDepartment = departments[(currentIndex + 1) % departments.length];
    setSelectedDepartment(nextDepartment);
    setActionMessage(`已切换到 ${nextDepartment}，当前排班数据和审批提醒已同步刷新。`);
  };

  const handleSwitchWeek = (direction: 'prev' | 'next') => {
    setWeekIndex((current) => {
      const nextIndex = direction === 'next' ? (current + 1) % weekOptions.length : (current - 1 + weekOptions.length) % weekOptions.length;
      setActionMessage(`已切换到 ${weekOptions[nextIndex].title}，当前排班样本已同步刷新。`);
      return nextIndex;
    });
  };

  const handleCopyPrevious = () => {
    const previousIndex = (weekIndex - 1 + weekOptions.length) % weekOptions.length;
    const previousKey = `${selectedDepartment}-${previousIndex}`;
    const previousMembers = scheduleMap[previousKey] ?? [];

    updateCurrentMembers(() => cloneMembers(previousMembers));
    setActionMessage(`已引用 ${weekOptions[previousIndex].title} 的排班模板，可继续逐格微调后再发布。`);
  };

  const handleAutoMatch = () => {
    if (pendingSlots === 0) {
      setActionMessage('当前没有未排班格子，系统推荐已是最新状态。');
      return;
    }

    updateCurrentMembers((members) =>
      members.map((member) => ({
        ...member,
        entries: member.entries.map((entry) => (entry.code === 'pending' ? getRecommendedShift(selectedDepartment) : entry)),
      })),
    );
    setActionMessage(`已为 ${pendingSlots} 个未排班格子补上系统推荐班次，发布前仍可继续调整。`);
  };

  const handleOpenEditor = (member: ScheduleMember, dayIndex: number) => {
    const day = currentWeek.dates[dayIndex];
    setEditor({
      memberId: member.id,
      memberName: member.name,
      dayIndex,
      dayLabel: `周${day.label} ${day.date}`,
    });
  };

  const handleApplyShift = (option: ShiftCell) => {
    if (!editor) {
      return;
    }

    updateCurrentMembers((members) =>
      members.map((member) =>
        member.id === editor.memberId
          ? {
              ...member,
              entries: member.entries.map((entry, index) => (index === editor.dayIndex ? { ...option } : entry)),
            }
          : member,
      ),
    );
    setActionMessage(`${editor.memberName} 的 ${editor.dayLabel} 已调整为“${option.label}”。`);
    setEditor(null);
  };

  const handlePublish = () => {
    if (pendingSlots > 0) {
      setActionMessage(`当前还有 ${pendingSlots} 个未排班格子，请先补齐后再发布。`);
      return;
    }

    setPublishedMap((current) => ({
      ...current,
      [currentKey]: true,
    }));
    setActionMessage(`${selectedDepartment} · ${currentWeek.title} 已发布，员工端、异常中心和月报会按当前班次回写。`);
  };

  return (
    <>
      {editor ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.24)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-blue-600">调整单日排班</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">{editor.memberName}</h2>
                <p className="mt-1 text-sm text-slate-500">{editor.dayLabel} · 选择一个班次模板即可立即回写。</p>
              </div>
              <button
                type="button"
                onClick={() => setEditor(null)}
                className="rounded-full border border-slate-200 p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {shiftOptions.map((option) => (
                <button
                  key={`${option.code}-${option.label}`}
                  type="button"
                  onClick={() => handleApplyShift(option)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
                >
                  <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                  <p className="mt-2 text-sm text-slate-500">{option.detail ?? '无额外说明'}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h1 className="text-lg font-semibold text-gray-900">排班管理</h1>
          <div className="flex items-center space-x-2 text-sm">
            <button
              type="button"
              onClick={handleSwitchDepartment}
              className="flex items-center rounded-md bg-gray-100 px-3 py-1.5 text-gray-700 transition hover:bg-gray-200"
            >
              {selectedDepartment}
              <ChevronDown className="ml-1 h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between bg-gray-50 px-4 py-2">
          <div className="flex items-center space-x-3">
            <button type="button" onClick={() => handleSwitchWeek('prev')} className="text-gray-400 transition hover:text-gray-600">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium text-gray-800">{currentWeek.title}</span>
            <button type="button" onClick={() => handleSwitchWeek('next')} className="text-gray-400 transition hover:text-gray-600">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="flex space-x-1 rounded-md bg-gray-200 p-1">
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`rounded px-3 py-1 text-xs font-medium transition ${viewMode === 'week' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              按周
            </button>
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`rounded px-3 py-1 text-xs font-medium transition ${viewMode === 'month' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              按月
            </button>
          </div>
        </div>

        {viewMode === 'week' ? (
          <div className="grid grid-cols-7 gap-px bg-gray-200 py-2 text-center text-xs font-medium text-gray-500">
            {currentWeek.dates.map((day) => (
              <div key={`${day.label}-${day.date}`} className={day.label === '六' || day.label === '日' ? 'text-red-500' : ''}>
                {day.label}
                <br />
                {day.date}
              </div>
            ))}
          </div>
        ) : (
          <div className="border-t border-gray-100 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            当前为月度汇总视图，先看每位成员的已排 / 待补 / 休息情况，再切回按周逐格调整。
          </div>
        )}
      </header>

      <main className="mb-16 space-y-3 p-2 pb-24">
        <section className="rounded-3xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
          <div className="flex items-start gap-3 text-amber-900">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold">
                {pendingSlots > 0 ? `还有 ${pendingSlots} 个排班格未补齐，系统会持续提醒` : '本周排班缺口已补齐，可继续检查后直接发布'}
              </p>
              <p className="mt-2 text-sm leading-6 text-amber-800">
                当前部门：{selectedDepartment}。{isPublished ? '班表已发布，员工端和异常中心会沿用当前版本。' : '只要班表未发布，系统会持续保留提醒，避免“没排班但员工已经上班”的场景反复出现。'}
              </p>
            </div>
          </div>
        </section>

        {actionMessage ? (
          <section className="rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900 shadow-sm">
            <p className="font-semibold">操作已完成</p>
            <p className="mt-2 leading-6">{actionMessage}</p>
          </section>
        ) : null}

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={handleCopyPrevious}
            className="rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Copy className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900">引用上周排班</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">下周排班接近时，直接复用上周模板，减少重复录入。</p>
          </button>
          <button
            type="button"
            onClick={handleAutoMatch}
            className="rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <RefreshCw className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900">自动匹配近似班次</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">未排班但已有打卡时，可先按最接近班次辅助判断，再由店长确认。</p>
          </button>
          <Link to="/manager/approval" className="rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900">查看自选 / 调班审批</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">员工自选班次和调班申请会统一进入审批中心，不再脱节。</p>
          </Link>
        </section>

        {viewMode === 'week' ? (
          <section className="space-y-3">
            {currentMembers.map((member) => {
              const hasPending = member.entries.some((entry) => entry.code === 'pending');
              const cardTone = hasPending ? 'border-yellow-100 bg-yellow-50' : 'border-gray-100 bg-white';

              return (
                <div key={member.id} className={`overflow-hidden rounded-lg border shadow-sm ${cardTone}`}>
                  <div className="flex items-center justify-between border-b px-3 py-2" style={{ borderColor: hasPending ? '#fef3c7' : '#f3f4f6' }}>
                    <div className="flex items-center">
                      <div className={`mr-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${member.avatarTone}`}>{member.avatar}</div>
                      <span className="text-sm font-medium text-gray-800">
                        {member.name} ({member.role})
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      本周已排 {member.entries.filter((entry) => entry.code !== 'pending' && entry.code !== 'off').length * 8}h
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-px bg-gray-100 p-px">
                    {member.entries.map((entry, index) => (
                      <button
                        key={`${member.id}-${currentWeek.dates[index].date}`}
                        type="button"
                        onClick={() => handleOpenEditor(member, index)}
                        className={`flex h-16 flex-col items-center justify-center rounded-sm text-xs transition ${getCellClassName(entry)}`}
                      >
                        <span className="font-medium">{entry.label}</span>
                        {entry.detail ? <span className="scale-90 text-[11px] opacity-80">{entry.detail}</span> : null}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        ) : (
          <section className="grid gap-3 md:grid-cols-2">
            {monthSummary.map((member) => (
              <div key={`${member.id}-month`} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${member.avatarTone}`}>{member.avatar}</div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                        <p className="text-xs text-slate-500">{member.role}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewMode('week')}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
                  >
                    回到按周编辑
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-blue-50 p-3 text-blue-900">
                    <p className="text-xs text-blue-700">已排班</p>
                    <p className="mt-2 text-xl font-semibold">{member.filledDays} 天</p>
                  </div>
                  <div className="rounded-2xl bg-red-50 p-3 text-red-900">
                    <p className="text-xs text-red-700">待补排班</p>
                    <p className="mt-2 text-xl font-semibold">{member.missingDays} 天</p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 p-3 text-amber-900">
                    <p className="text-xs text-amber-700">系统推荐</p>
                    <p className="mt-2 text-xl font-semibold">{member.recommendDays} 天</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3 text-slate-900">
                    <p className="text-xs text-slate-500">休息</p>
                    <p className="mt-2 text-xl font-semibold">{member.offDays} 天</p>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        <section className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900">
              <RefreshCw className="h-5 w-5 text-emerald-600" />
              <h2 className="text-base font-semibold">待确认的自选 / 调班</h2>
            </div>
            <div className="mt-4 space-y-3">
              {currentRequests.map((item) => (
                <div key={`${item.name}-${item.type}`} className={`rounded-2xl border p-4 ${item.tone}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">{item.name}</p>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold">{item.type}</span>
                      </div>
                      <p className="mt-1 text-sm opacity-80">{item.department}</p>
                      <p className="mt-3 text-sm leading-6 opacity-90">{item.detail}</p>
                      <p className="mt-2 text-xs font-medium opacity-80">下一步：{item.nextStep}</p>
                    </div>
                    <Link to="/manager/approval" className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-sm">
                      去审批
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900">
              <Clock className="h-5 w-5 text-blue-600" />
              <h2 className="text-base font-semibold">排班提醒与说明</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {scheduleTips.map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 p-4">
                  {item}
                </div>
              ))}
              <div className="rounded-2xl bg-blue-50 p-4 text-blue-900">
                如果门店当天完全没排班，员工可以先在申请中心发起自选班次，主管稍后统一确认，不再只能靠人工月底解释。
              </div>
              <div className="rounded-2xl bg-amber-50 p-4 text-amber-900">
                当前已排成员：{scheduledMembers}/{currentMembers.length} 人；系统推荐：{recommendedSlots} 格；未排班：{pendingSlots} 格。
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900">
            <RefreshCw className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-semibold">发布后自动回写</h2>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {publishFlow.map((item) => (
              <div key={item.title} className={`rounded-2xl border p-4 ${item.tone}`}>
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="fixed bottom-[56px] z-40 flex w-full max-w-[768px] items-center justify-between border-t border-gray-200 bg-white p-3 shadow-lg">
        <div className="text-sm text-gray-600">
          已排 <span className="font-medium text-gray-900">{scheduledMembers}/{currentMembers.length}</span> 人
          <p className="mt-1 text-xs text-gray-400">
            {isPublished ? '当前周班表已发布 · 员工端和异常中心已按当前版本展示' : `待确认自选班次 ${currentRequests.length} 条 · 发布后同步异常 / 月报`}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleCopyPrevious}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            引用上周
          </button>
          <button
            type="button"
            onClick={handlePublish}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            发布排班
          </button>
        </div>
      </div>
    </>
  );
}
