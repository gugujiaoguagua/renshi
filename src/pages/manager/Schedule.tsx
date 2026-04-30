import { useEffect, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { ArrowRight, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Copy, RefreshCw, Users } from 'lucide-react';

import { Link } from 'react-router-dom';
import MobileModalShell from '../../components/mobile/MobileModalShell';

import { managerScheduleInsights } from '../../data/attendanceInsights';

import { anomalyBurstChip, anomalyBurstSoft } from '../../styles/attendanceAlertStyles';

type Department = string;
type ShiftCode = 'day' | 'late' | 'off' | 'pending' | 'recommend';
type CalendarState = 'outside' | 'empty' | 'normal' | 'anomaly';

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

type ScheduleDayMember = {
  memberId: string;
  memberName: string;
  role: string;
  avatar: string;
  avatarTone: string;
  entry: ShiftCell;
  weekIndex: number;
  dayIndex: number;
};

type ScheduleCalendarCell = {
  key: string;
  date: string;
  dayNumber: number;
  shortDate: string;
  label: string;
  hint: string;
  isCurrentMonth: boolean;
  hasData: boolean;
  state: CalendarState;
};

const weekdayLabels = ['一', '二', '三', '四', '五', '六', '日'];
const departments = managerScheduleInsights.departments as Department[];
const weekOptions = managerScheduleInsights.weeks;

const shiftOptions: ShiftCell[] = [
  { code: 'day', label: '朝 9 晚 6', detail: '09:00 - 18:00 固定班次' },
  { code: 'late', label: '弹性班', detail: '允许弹性打卡，优先覆盖门店灵活排班' },
  { code: 'off', label: '休息', detail: '当天无需打卡，按休息日口径处理' },
  { code: 'recommend', label: '系统推荐', detail: '先按推荐样板回写，发布前仍可继续调整' },
];

function cloneMembers(members: ScheduleMember[]) {
  return members.map((member) => ({
    ...member,
    entries: member.entries.map((entry) => ({ ...entry })),
  }));
}

function buildInitialScheduleMap() {
  const nextMap: Record<string, ScheduleMember[]> = {};

  Object.entries(managerScheduleInsights.membersByDepartmentAndWeek).forEach(([key, value]) => {
    nextMap[key] = cloneMembers(value as ScheduleMember[]);
  });

  return nextMap;
}

function getRecommendedShift(department: Department): ShiftCell {
  return department.includes('店')
    ? { code: 'recommend', label: '系统推荐', detail: '优先沿用弹性班样板' }
    : { code: 'recommend', label: '系统推荐', detail: '优先沿用朝 9 晚 6' };
}

function formatMonthKeyFromWeekTitle(title?: string) {
  return title?.split(' 第 ')[0] ?? '2026-04';
}

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split('-');
  return `${year}年${Number(month)}月`;
}

function formatDateValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDateText(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  const weekday = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
  return `${dateKey.replace(/-/g, '/')} 星期${weekday}`;
}

function buildScheduleCalendarCells(monthKey: string, dayMembersByDate: Record<string, ScheduleDayMember[]>) {
  const [yearText, monthText] = monthKey.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const firstDay = new Date(year, month - 1, 1);
  const mondayIndex = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();
  const totalCells = Math.ceil((mondayIndex + daysInMonth) / 7) * 7;
  const gridStart = new Date(year, month - 1, 1 - mondayIndex);

  return Array.from({ length: totalCells }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);

    const dateKey = formatDateValue(date);
    const isCurrentMonth = date.getMonth() === month - 1;
    const members = dayMembersByDate[dateKey] ?? [];
    const pendingCount = members.filter((member) => member.entry.code === 'pending').length;
    const assignedCount = members.length - pendingCount;

    const state: CalendarState = !isCurrentMonth
      ? 'outside'
      : members.length === 0
        ? 'empty'
        : pendingCount > 0
          ? 'anomaly'
          : 'normal';

    const label = !isCurrentMonth
      ? `${date.getMonth() + 1}月`
      : members.length === 0
        ? '未排样板'
        : pendingCount > 0
          ? `待排 ${pendingCount} 人`
          : `已排 ${members.length} 人`;

    const hint = !isCurrentMonth
      ? ' '
      : members.length === 0
        ? '点击查看'
        : pendingCount > 0
          ? `${assignedCount}/${members.length} 人已排`
          : `${members[0]?.entry.label ?? '已完成排班'} · 点击调整`;

    return {
      key: `${dateKey}-${index}`,
      date: dateKey,
      dayNumber: date.getDate(),
      shortDate: `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`,
      label,
      hint,
      isCurrentMonth,
      hasData: members.length > 0,
      state,
    } satisfies ScheduleCalendarCell;
  });
}

function getCalendarCellClasses(state: CalendarState, isCurrentMonth: boolean, isSelected: boolean) {
  if (!isCurrentMonth) {
    return clsx('border border-transparent bg-slate-50/70 text-slate-300', isSelected && 'ring-2 ring-slate-200 ring-offset-1');
  }

  if (state === 'anomaly') {
    return clsx(
      'border border-slate-200 border-b-[6px] border-b-rose-500 bg-white text-slate-900 shadow-sm',
      isSelected && 'ring-2 ring-rose-200 ring-offset-2 ring-offset-white',
    );
  }

  if (state === 'normal') {
    return clsx('border border-slate-200 bg-white text-slate-900 shadow-sm', isSelected && 'ring-2 ring-blue-200 ring-offset-2 ring-offset-white');
  }

  return clsx('border border-dashed border-slate-200 bg-slate-50 text-slate-500', isSelected && 'ring-2 ring-slate-200 ring-offset-2 ring-offset-white');
}

function getCalendarDayClasses(state: CalendarState, isCurrentMonth: boolean) {
  if (!isCurrentMonth) return 'text-slate-300';
  if (state === 'anomaly') return 'text-rose-700';
  if (state === 'normal') return 'text-slate-700';
  return 'text-slate-400';
}

function getShiftTone(code: ShiftCode) {
  if (code === 'pending') return anomalyBurstChip;
  if (code === 'day') return 'bg-emerald-50 text-emerald-700';
  if (code === 'late') return 'bg-blue-50 text-blue-700';
  if (code === 'recommend') return 'bg-amber-50 text-amber-700';
  return 'bg-slate-100 text-slate-600';
}

function getShiftCardClasses(code: ShiftCode, isActive = false) {
  const base = code === 'pending'
    ? `border border-rose-100 ${anomalyBurstSoft}`
    : 'border border-slate-200 bg-slate-50 text-slate-900';

  return clsx(base, isActive && (code === 'pending' ? 'ring-2 ring-rose-200 ring-offset-2 ring-offset-white' : 'ring-2 ring-blue-200 ring-offset-2 ring-offset-white'));
}

function getShiftActionText(code: ShiftCode) {
  if (code === 'pending') return '待排班';
  if (code === 'off') return '已设休息';
  if (code === 'recommend') return '已按推荐';
  return '已排班';
}

export default function ManagerSchedule() {
  const [selectedDepartment, setSelectedDepartment] = useState<Department>(departments[0] ?? '总部试点组');
  const [weekIndex, setWeekIndex] = useState(0);
  const [scheduleMap, setScheduleMap] = useState<Record<string, ScheduleMember[]>>(() => buildInitialScheduleMap());

  const [selectedDate, setSelectedDate] = useState('');
  const [dialogDate, setDialogDate] = useState<string | null>(null);
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const [draftShiftCode, setDraftShiftCode] = useState<ShiftCode | null>(null);
  const [showUnscheduledAlert, setShowUnscheduledAlert] = useState(true);


  const currentWeek = weekOptions[weekIndex] ?? weekOptions[0];
  const currentKey = `${selectedDepartment}-${weekIndex}`;
  const currentMembers = useMemo(() => scheduleMap[currentKey] ?? [], [currentKey, scheduleMap]);
  const currentRequests = (managerScheduleInsights.requestsByDepartment[selectedDepartment] ?? []) as ShiftRequest[];
  const monthKey = formatMonthKeyFromWeekTitle(currentWeek?.title);

  const dayMembersByDate = useMemo(() => {
    const result: Record<string, ScheduleDayMember[]> = {};

    weekOptions.forEach((week, currentWeekIndex) => {
      if (!week.title.startsWith(monthKey)) {
        return;
      }

      const weekKey = `${selectedDepartment}-${currentWeekIndex}`;
      const members = scheduleMap[weekKey] ?? [];

      week.dates.forEach((day, dayIndex) => {
        result[day.dateKey] = members.map((member) => ({
          memberId: member.id,
          memberName: member.name,
          role: member.role,
          avatar: member.avatar,
          avatarTone: member.avatarTone,
          entry: member.entries[dayIndex] ?? { code: 'pending', label: '待排班', detail: '当前还没有设置班次' },
          weekIndex: currentWeekIndex,
          dayIndex,
        }));
      });
    });

    return result;
  }, [monthKey, scheduleMap, selectedDepartment]);

  const calendarCells = useMemo(() => buildScheduleCalendarCells(monthKey, dayMembersByDate), [dayMembersByDate, monthKey]);

  const defaultDate = useMemo(() => {
    const riskyDate = Object.entries(dayMembersByDate).find(([, members]) => members.some((member) => member.entry.code === 'pending'))?.[0];
    const firstAvailableDate = Object.keys(dayMembersByDate).sort()[0];
    return riskyDate ?? firstAvailableDate ?? `${monthKey}-01`;
  }, [dayMembersByDate, monthKey]);

  useEffect(() => {
    setSelectedDate((current) => (current && calendarCells.some((cell) => cell.date === current && cell.isCurrentMonth) ? current : defaultDate));
  }, [calendarCells, defaultDate]);

  useEffect(() => {
    if (!dialogDate) {
      setActiveMemberId(null);
      setDraftShiftCode(null);
      return;
    }

    const members = dayMembersByDate[dialogDate] ?? [];
    if (activeMemberId && !members.some((member) => member.memberId === activeMemberId)) {
      setActiveMemberId(null);
      setDraftShiftCode(null);
    }
  }, [activeMemberId, dayMembersByDate, dialogDate]);

  const selectedDateMembers = selectedDate ? dayMembersByDate[selectedDate] ?? [] : [];
  const dialogMembers = dialogDate ? dayMembersByDate[dialogDate] ?? [] : [];
  const activeDialogMember = dialogMembers.find((member) => member.memberId === activeMemberId) ?? null;
  const draftShiftOption = shiftOptions.find((option) => option.code === draftShiftCode) ?? null;
  const selectedCell = calendarCells.find((cell) => cell.date === selectedDate);

  useEffect(() => {
    if (!activeDialogMember) {
      setDraftShiftCode(null);
      return;
    }

    setDraftShiftCode(activeDialogMember.entry.code);
  }, [activeDialogMember]);



  const selectedStats = useMemo(() => {
    return {
      total: selectedDateMembers.length,
      pending: selectedDateMembers.filter((member) => member.entry.code === 'pending').length,
      scheduled: selectedDateMembers.filter((member) => member.entry.code !== 'pending').length,
      flexible: selectedDateMembers.filter((member) => member.entry.code === 'late').length,
    };
  }, [selectedDateMembers]);

  const pendingSlots = useMemo(
    () => currentMembers.reduce((total, member) => total + member.entries.filter((entry) => entry.code === 'pending').length, 0),
    [currentMembers],
  );

  const unscheduledMemberCount = useMemo(
    () => currentMembers.filter((member) => member.entries.some((entry) => entry.code === 'pending')).length,
    [currentMembers],
  );

  const monthPendingSlots = useMemo(
    () => Object.values(dayMembersByDate).reduce((total, members) => total + members.filter((member) => member.entry.code === 'pending').length, 0),
    [dayMembersByDate],
  );

  const updateMembersForWeek = (targetWeekIndex: number, updater: (members: ScheduleMember[]) => ScheduleMember[]) => {
    const targetKey = `${selectedDepartment}-${targetWeekIndex}`;

    setScheduleMap((current) => ({
      ...current,
      [targetKey]: updater(current[targetKey] ?? []),
    }));
  };

  const handleSwitchDepartment = () => {
    const currentIndex = departments.indexOf(selectedDepartment);
    const nextDepartment = departments[(currentIndex + 1) % departments.length] ?? departments[0];
    setSelectedDepartment(nextDepartment);
  };

  const handleSwitchWeek = (direction: 'prev' | 'next') => {
    setWeekIndex((current) => {
      const nextIndex = direction === 'next' ? (current + 1) % weekOptions.length : (current - 1 + weekOptions.length) % weekOptions.length;
      return nextIndex;
    });
  };

  const handleCopyPrevious = () => {
    const previousIndex = (weekIndex - 1 + weekOptions.length) % weekOptions.length;
    const previousKey = `${selectedDepartment}-${previousIndex}`;
    const previousMembers = scheduleMap[previousKey] ?? [];

    updateMembersForWeek(weekIndex, () => cloneMembers(previousMembers));
  };

  const handleAutoMatch = () => {
    if (pendingSlots === 0) {
      return;
    }

    updateMembersForWeek(weekIndex, (members) =>
      members.map((member) => ({
        ...member,
        entries: member.entries.map((entry) => (entry.code === 'pending' ? getRecommendedShift(selectedDepartment) : entry)),
      })),
    );
  };

  const handlePublish = () => {
    if (pendingSlots > 0) {
      return;
    }
  };

  const handleOpenDateScheduler = (date: string, preferredMemberId?: string) => {
    setSelectedDate(date);
    setDialogDate(date);
    setActiveMemberId(preferredMemberId ?? null);
    setDraftShiftCode(null);
  };

  const handleCloseDateScheduler = () => {
    setDialogDate(null);
    setActiveMemberId(null);
    setDraftShiftCode(null);
  };

  const handleApplyShift = (member: ScheduleDayMember, option: ShiftCell) => {
    updateMembersForWeek(member.weekIndex, (members) =>
      members.map((item) =>
        item.id === member.memberId
          ? {
              ...item,
              entries: item.entries.map((entry, index) => (index === member.dayIndex ? { ...option } : entry)),
            }
          : item,
      ),
    );
    setActiveMemberId(null);
    setDraftShiftCode(null);
  };

  const handleConfirmShift = () => {
    if (!activeDialogMember || !draftShiftOption) {
      return;
    }

    handleApplyShift(activeDialogMember, draftShiftOption);
  };



  return (
    <>
      {showUnscheduledAlert && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-5 shadow-2xl">
            <div className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">【爆红】排班提醒</div>
            <p className="mt-4 text-base font-semibold text-slate-900">当前还剩 {unscheduledMemberCount} 人未排班。</p>
            <p className="mt-2 text-sm text-slate-500">请优先处理未排班人员，避免影响出勤统计。</p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowUnscheduledAlert(false)}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {dialogDate ? (
        <MobileModalShell
          icon={<CalendarDays className="h-5 w-5" />}
          eyebrow="主管排班面板"
          title={formatDateText(dialogDate)}
          description="点击日期后，先选择主管名下人员，再选择班次模板即可立即回写。"
          onClose={handleCloseDateScheduler}
          panelClassName="max-w-5xl sm:max-h-[90vh]"
          bodyClassName="p-5 pb-20 lg:p-6 lg:pb-6"
        >
          {dialogMembers.length > 0 ? (
            <div className="space-y-4">

                  <div className="flex items-center gap-2 text-slate-900">
                    <Users className="h-5 w-5 text-blue-600" />
                    <h3 className="text-base font-semibold">主管管理人员</h3>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {dialogMembers.map((member) => {
                    const isPending = member.entry.code === 'pending';
                    const isActive = member.memberId === activeDialogMember?.memberId;
                    return (
                      <button
                        key={`${dialogDate}-${member.memberId}`}
                        type="button"
                        onClick={() => setActiveMemberId(member.memberId)}
                        className={clsx('w-full rounded-[24px] p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm', getShiftCardClasses(member.entry.code, isActive))}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className={clsx('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold', member.avatarTone)}>
                              {member.avatar}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-sm font-semibold text-slate-900">{member.memberName}</p>
                                <span className={clsx('rounded-full px-2 py-0.5 text-[11px] font-semibold', getShiftTone(member.entry.code))}>
                                  {getShiftActionText(member.entry.code)}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-slate-500">{member.role}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          {isPending ? <p className="text-xs font-medium text-rose-600">当前未排班，点击后立即选择班次。</p> : <p className="text-xs text-slate-400">点击可重新选择班次。</p>}
                          <span className="inline-flex items-center text-xs font-semibold text-slate-400">
                            选择班次
                            <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {activeDialogMember ? (
                  <MobileModalShell
                    icon={<Users className="h-5 w-5" />}
                    eyebrow="选择班次"
                    title={activeDialogMember.memberName}
                    description={`${activeDialogMember.role} · 当前：${activeDialogMember.entry.label}`}
                    onClose={() => setActiveMemberId(null)}
                    panelClassName="max-w-4xl"
                    bodyClassName="p-5 lg:p-6"
                    headerAside={(
                      <span className={clsx('rounded-full px-3 py-1 text-xs font-semibold', getShiftTone(activeDialogMember.entry.code))}>
                        {getShiftActionText(activeDialogMember.entry.code)}
                      </span>
                    )}
                    footer={(
                      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={() => setActiveMemberId(null)}
                          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                          取消
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmShift}
                          disabled={!draftShiftOption}
                          className={clsx(
                            'rounded-2xl px-4 py-3 text-sm font-semibold text-white transition',
                            draftShiftOption
                              ? 'bg-slate-900 hover:bg-slate-800'
                              : 'cursor-not-allowed bg-slate-300',
                          )}
                        >
                          确认班次
                        </button>
                      </div>
                    )}
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      {shiftOptions.map((option) => {
                        const isCurrent = draftShiftCode === option.code;
                        return (
                          <button
                            key={`${activeDialogMember.memberId}-${option.code}`}
                            type="button"
                            onClick={() => setDraftShiftCode(option.code)}
                            className={clsx(
                              'rounded-[24px] border p-4 text-left transition hover:-translate-y-0.5',
                              isCurrent
                                ? 'border-blue-300 bg-blue-50 shadow-sm ring-2 ring-blue-100'
                                : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/60',
                            )}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                              <span className={clsx('rounded-full px-2.5 py-1 text-[11px] font-semibold', getShiftTone(option.code))}>{option.code === 'pending' ? '待排' : '可选'}</span>
                            </div>
                            <p className="mt-4 text-sm leading-6 text-slate-500">{option.detail ?? '无额外说明'}</p>
                          </button>
                        );
                      })}
                    </div>
                  </MobileModalShell>
                ) : null}

              </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-500">
              这一天在当前主管样板中还没有生成可编辑的人员排班，通常表示当前月份未覆盖到该天的试点排班数据。
            </div>
          )}
        </MobileModalShell>
      ) : null}


      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-900">排班管理</h1>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleCopyPrevious}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
              >
                引用上周
              </button>
              <button
                type="button"
                onClick={handlePublish}
                className={clsx(
                  'rounded-lg px-3 py-1.5 text-xs font-medium text-white shadow-sm transition',
                  pendingSlots > 0 ? 'cursor-not-allowed bg-slate-300' : 'bg-blue-600 hover:bg-blue-700',
                )}
              >
                发布排班
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSwitchDepartment}
            className="flex items-center rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-200"
          >
            {selectedDepartment}
            <ChevronDown className="ml-1 h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between bg-gray-50 px-4 py-2">
          <div className="flex items-center space-x-3">
            <button type="button" onClick={() => handleSwitchWeek('prev')} className="text-gray-400 transition hover:text-gray-600">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium text-gray-800">{currentWeek?.title ?? '样板周次'}</span>
            <button type="button" onClick={() => handleSwitchWeek('next')} className="text-gray-400 transition hover:text-gray-600">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-100">
            当前月待排 {monthPendingSlots} 格
          </div>
        </div>
      </header>

      <main className="mb-16 space-y-6 p-4 pb-24">
        <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-semibold text-slate-900">排班日历</h3>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{selectedDepartment} · 主管视角</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">界面与打卡记录保持一致，但当前查看的是主管名下成员的排班状态：已排正常展示，未排直接爆红。</p>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <CalendarDays className="h-4 w-4 text-slate-400" />
                {formatMonthLabel(monthKey)}
              </div>
            </div>

            <div className="mt-5 rounded-[28px] border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold tracking-[0.18em] text-slate-400">
                {weekdayLabels.map((label) => (
                  <div key={label} className="py-2">{label}</div>
                ))}
              </div>

              <div className="mt-2 grid grid-cols-7 gap-2">
                {calendarCells.map((cell) => {
                  const isSelected = selectedDate === cell.date;
                  const isAnomaly = cell.state === 'anomaly';
                  return (
                    <button
                      key={cell.key}
                      type="button"
                      onClick={() => {
                        if (!cell.isCurrentMonth) return;
                        handleOpenDateScheduler(cell.date);
                      }}
                      className={clsx(
                        'aspect-square min-h-0 rounded-[18px] p-1.5 text-center transition sm:min-h-[108px] sm:rounded-[22px] sm:p-3 sm:text-left',
                        getCalendarCellClasses(cell.state, cell.isCurrentMonth, isSelected),
                      )}
                    >
                      <div className="flex h-full flex-col items-center sm:items-start">
                        <div className="flex w-full items-start justify-center sm:justify-between">
                          <span className={clsx('inline-flex text-sm font-semibold', getCalendarDayClasses(cell.state, cell.isCurrentMonth))}>
                            {cell.dayNumber}
                          </span>
                          {isAnomaly ? <span className="mt-1 hidden h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_0_4px_rgba(244,114,182,0.16)] sm:block" /> : null}
                        </div>

                        <div className="mt-2 hidden w-full space-y-1 sm:block">
                          <p className={clsx('line-clamp-2 text-xs font-semibold leading-5', !cell.isCurrentMonth && 'text-slate-300')}>
                            {cell.label}
                          </p>
                          <p className={clsx('line-clamp-2 text-[11px] leading-4 opacity-80', !cell.isCurrentMonth && 'text-slate-300')}>
                            {cell.isCurrentMonth ? cell.hint : ''}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 text-xs sm:text-sm">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">已排班 / 正常色</span>
              <span className={clsx('rounded-full px-3 py-1 font-semibold', anomalyBurstChip)}>未排班 / 爆红</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500">样板未覆盖 / 无数据</span>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">当天排班详情</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">{selectedDate ? formatDateText(selectedDate) : '点击日历查看当天排班'}</h3>
                </div>
                {selectedStats.pending > 0 ? (
                  <button
                    type="button"
                    onClick={() => handleOpenDateScheduler(selectedDate)}
                    className="rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    去排班
                  </button>
                ) : null}
              </div>

              {selectedDateMembers.length > 0 ? (
                <>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">总人数 {selectedStats.total}</span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">已排 {selectedStats.scheduled}</span>
                    <span className={clsx('rounded-full px-3 py-1', selectedStats.pending > 0 ? anomalyBurstChip : 'bg-slate-100 text-slate-500')}>待排 {selectedStats.pending}</span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">弹性班 {selectedStats.flexible}</span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {selectedDateMembers.map((member) => (
                      <button
                        key={`${selectedDate}-${member.memberId}`}
                        type="button"
                        onClick={() => handleOpenDateScheduler(selectedDate, member.memberId)}
                        className={clsx('w-full rounded-[24px] border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm', getShiftCardClasses(member.entry.code))}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className={clsx('flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold', member.avatarTone)}>{member.avatar}</div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-sm font-semibold text-slate-900">{member.memberName}</p>
                                <span className={clsx('rounded-full px-2 py-0.5 text-[11px] font-semibold', getShiftTone(member.entry.code))}>
                                  {getShiftActionText(member.entry.code)}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-slate-500">{member.role}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-900">{member.entry.label}</p>
                          </div>
                          <span className="inline-flex items-center text-xs font-semibold text-slate-400">
                            点击调整
                            <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-500">
                  {selectedCell?.isCurrentMonth
                    ? '这一天在当前试点排班样板里还没有落到可编辑的成员数据，可以切换周次或先引用上周排班。'
                    : '请点击当前月份内的日期查看主管名下人员排班。'}
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">排班快捷操作</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">{currentWeek?.title ?? '当前周样板'}</h3>
                </div>
                <Link to="/manager/approval" className="rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100">
                  去审批中心
                </Link>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={handleCopyPrevious}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Copy className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-900">引用上周排班</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">直接复用上一周样板，减少重复录入。</p>
                </button>
                <button
                  type="button"
                  onClick={handleAutoMatch}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                    <RefreshCw className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-900">自动匹配近似班次</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">仅处理当前周待排班格子，先补齐样板再人工复核。</p>
                </button>
                <Link to="/manager/approval" className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-900">查看自选 / 调班审批</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">排班调整和补卡审批统一进入主管审批中心闭环。</p>
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {currentRequests.map((item) => (
                  <div key={`${item.name}-${item.type}`} className={clsx('rounded-[24px] border p-4', item.tone)}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold">{item.name}</p>
                          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold">{item.type}</span>
                        </div>
                        <p className="mt-1 text-xs opacity-80">{item.department}</p>
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
          </section>
        </div>
      </main>

    </>
  );
}
