import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { ArrowRight, Bell, CheckCircle2, Paperclip, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { recordPageInsights } from '../../data/attendanceInsights';
import {
  anomalyBurstChip,
  anomalyBurstSoft,
  anomalyBurstSurface,
  anomalyBurstText,
} from '../../styles/attendanceAlertStyles';

type RecordsVariant = keyof typeof recordPageInsights;

type AttachmentItem = {
  name: string;
  sizeLabel: string;
  kindLabel: string;
};

type ReissueDraft = {
  date: string;
  dateText: string;
  shiftLabel: string;
  shiftValue: string;
  timeValue: string;
  timeHint: string;
};

const weekdayLabels = ['一', '二', '三', '四', '五', '六', '日'];

function getCellClasses(state: (typeof recordPageInsights.employee.calendarCells)[number]['state'], isCurrentMonth: boolean, isSelected: boolean) {
  if (!isCurrentMonth) {
    return clsx(
      'border border-transparent bg-slate-50/70 text-slate-300',
      isSelected && 'ring-2 ring-slate-200 ring-offset-1',
    );
  }

  if (state === 'anomaly') {
    return clsx(
      'border border-slate-200 border-b-[6px] border-b-rose-500 bg-white text-slate-900 shadow-sm',
      isSelected && 'ring-2 ring-rose-200 ring-offset-2 ring-offset-white',
    );
  }

  if (state === 'special') {
    return clsx(
      'border border-blue-100 bg-white text-blue-900 shadow-sm sm:bg-blue-50',
      isSelected && 'ring-2 ring-blue-200 ring-offset-2 ring-offset-white',
    );
  }

  if (state === 'normal') {
    return clsx(
      'border border-slate-200 bg-white text-slate-900 shadow-sm',
      isSelected && 'ring-2 ring-blue-200 ring-offset-2 ring-offset-white',
    );
  }

  return clsx(
    'border border-dashed border-slate-200 bg-slate-50 text-slate-500',
    isSelected && 'ring-2 ring-slate-200 ring-offset-2 ring-offset-white',
  );
}

function getDayBadgeClasses(
  state: (typeof recordPageInsights.employee.calendarCells)[number]['state'],
  isCurrentMonth: boolean,
  isSelected: boolean,
) {
  if (!isCurrentMonth) {
    return clsx('bg-transparent text-slate-300', isSelected && 'ring-2 ring-slate-200');
  }

  if (state === 'anomaly') {
    return clsx(
      'text-rose-700',
    );
  }

  if (state === 'special') {
    return clsx('text-blue-700');
  }

  if (state === 'normal') {
    return clsx('text-slate-700');
  }

  return clsx('text-slate-400');
}


function isPlaceholderTime(value?: string) {
  return !value || value.includes('--');
}

function pickEntry(detail: (typeof recordPageInsights.employee.recordsByDate)[string][number] | undefined, label: string) {
  return detail?.entries.find((entry) => entry.label === label);
}

function parseShiftWindow(shift: string) {
  const times = shift.match(/\d{2}:\d{2}/g) ?? [];
  return {
    start: times[0] ?? '09:00',
    end: times[1] ?? times[0] ?? '18:00',
  };
}

function buildReissueDraft(detail: (typeof recordPageInsights.employee.recordsByDate)[string][number]): ReissueDraft {
  const checkInEntry = pickEntry(detail, '上班');
  const checkOutEntry = pickEntry(detail, '下班');
  const { start, end } = parseShiftWindow(detail.shift);
  const checkInMissing = isPlaceholderTime(checkInEntry?.value) || Boolean(checkInEntry?.status && /(缺卡|未打卡|待补)/.test(checkInEntry.status));
  const checkOutMissing = isPlaceholderTime(checkOutEntry?.value) || Boolean(checkOutEntry?.status && /(缺卡|未打卡|待补)/.test(checkOutEntry.status));

  if (checkInMissing && checkOutMissing) {
    return {
      date: detail.date,
      dateText: detail.dateText,
      shiftLabel: '上下班补卡',
      shiftValue: detail.shift,
      timeValue: start,
      timeHint: '当天存在上下班缺卡，先按当前班次的上班时间自动带入。',
    };
  }

  if (checkInMissing || detail.status.includes('迟到')) {
    return {
      date: detail.date,
      dateText: detail.dateText,
      shiftLabel: '上班补卡',
      shiftValue: detail.shift,
      timeValue: !isPlaceholderTime(checkInEntry?.value) ? checkInEntry?.value ?? start : start,
      timeHint: checkInMissing ? '已按当天上班班次时间自动带入。' : '已按当前点击记录的上班异常时间自动带入。',
    };
  }

  if (checkOutMissing || detail.status.includes('早退')) {
    return {
      date: detail.date,
      dateText: detail.dateText,
      shiftLabel: '下班补卡',
      shiftValue: detail.shift,
      timeValue: !isPlaceholderTime(checkOutEntry?.value) ? checkOutEntry?.value ?? end : end,
      timeHint: checkOutMissing ? '已按当天下班班次时间自动带入。' : '已按当前点击记录的下班异常时间自动带入。',
    };
  }

  return {
    date: detail.date,
    dateText: detail.dateText,
    shiftLabel: '异常打卡说明',
    shiftValue: detail.shift,
    timeValue: !isPlaceholderTime(checkInEntry?.value) ? checkInEntry?.value ?? start : start,
    timeHint: '已按当前点击的异常记录自动带入，可直接补充事由。',
  };
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export default function RecordsPage({ variant = 'employee' }: { variant?: RecordsVariant }) {
  const data = recordPageInsights[variant];
  const [selectedDate, setSelectedDate] = useState(data.defaultSelectedDate);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showReissueComposer, setShowReissueComposer] = useState(false);
  const [reissueReason, setReissueReason] = useState('');
  const [uploadMode, setUploadMode] = useState<'skip' | 'upload'>('skip');
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);

  const selectedRecords = useMemo(() => (selectedDate ? data.recordsByDate[selectedDate] ?? [] : []), [data.recordsByDate, selectedDate]);
  const selectedPrimary = selectedRecords[0];
  const selectedCell = selectedDate ? data.calendarCells.find((item) => item.date === selectedDate) : undefined;

  const hasAnomaly = selectedRecords.some((item) => item.isAnomaly);
  const reminderTitle = '补卡说明';
  const reminderDesc = !selectedPrimary
    ? ''
    : selectedPrimary.status.includes('地点')
      ? '请先补充定位说明或由主管核实场景，再决定是否回写到最终口径。'
      : '请先补充补卡说明，再由主管审批并同步月报与异常中心结果。';
  const reissueDraft = useMemo(() => (selectedPrimary ? buildReissueDraft(selectedPrimary) : null), [selectedPrimary]);
  const reasonInvalid = submitAttempted && !reissueReason.trim();

  useEffect(() => {
    setShowReissueComposer(false);
    setReissueReason('');
    setUploadMode('skip');
    setAttachments([]);
    setSubmitAttempted(false);
    setSubmitDone(false);
  }, [selectedDate, showReminderModal]);

  const handleSelectDate = (date: string, openReminder: boolean) => {
    setSelectedDate(date);
    setShowReminderModal(openReminder);
  };

  const handleAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).map((file) => ({
      name: file.name,
      sizeLabel: formatFileSize(file.size),
      kindLabel: file.type.startsWith('image/') ? '图片' : '文件',
    }));
    setAttachments(files);
  };

  const openInlineReissue = () => {
    setShowReissueComposer(true);
    setSubmitAttempted(false);
    setSubmitDone(false);
  };

  const handleSubmitReissue = () => {
    setSubmitAttempted(true);
    if (!reissueReason.trim()) return;
    setSubmitDone(true);
  };

  return (
    <>
      {showReminderModal && selectedPrimary && hasAnomaly ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/35 px-3 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] pt-5 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="flex max-h-[calc(100dvh-7rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.24)] sm:max-h-[92vh]">
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5 sm:py-5">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-blue-50 p-2 text-blue-600 shadow-sm">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">补卡说明入口</p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">{selectedPrimary.dateText}</h2>
                  <p className="mt-1 text-sm text-slate-500">点击红色异常卡片后，已直接打开补卡说明卡片。</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReminderModal(false)}
                className="shrink-0 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
              <div className="space-y-4">
                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">我的打卡记录</p>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold">
                      <span className={`rounded-full px-3 py-1 ${selectedPrimary.statusTone}`}>{selectedPrimary.status}</span>
                      <span className={`rounded-full px-3 py-1 ${selectedPrimary.syncTone}`}>{selectedPrimary.syncStatus}</span>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {selectedPrimary.entries.map((entry) => (
                      <div
                        key={`modal-${selectedPrimary.date}-${entry.label}`}
                        className={clsx('rounded-2xl p-4', selectedPrimary.isAnomaly ? anomalyBurstSoft : 'bg-white')}
                      >
                        <p className="text-sm text-slate-500">{entry.label}</p>
                        <p className="mt-2 text-xl font-semibold text-slate-900">{entry.value}</p>
                        <p className={clsx('mt-1 text-sm font-medium', selectedPrimary.isAnomaly ? anomalyBurstText : 'text-slate-700')}>{entry.status}</p>
                        <p className="mt-2 text-xs leading-5 text-slate-500">{entry.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{reminderTitle}</p>
                      <p className="mt-1 text-xs text-slate-500">点击“去补卡说明”后，直接在当前弹层完成填写和提交，不再跳转页面。</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100">
                      {selectedPrimary.syncStatus}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-700">{reminderDesc}</p>

                  {!showReissueComposer ? (
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">补卡日期</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{reissueDraft?.date ?? selectedPrimary.date}</p>
                        <p className="mt-1 text-xs text-slate-500">已按当前点击日期自动带入</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">补卡班次</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{reissueDraft?.shiftLabel ?? '补卡说明'}</p>
                        <p className="mt-1 text-xs text-slate-500 line-clamp-2">{reissueDraft?.shiftValue ?? selectedPrimary.shift}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">补卡时间</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{reissueDraft?.timeValue ?? '--:--'}</p>
                        <p className="mt-1 text-xs text-slate-500">{reissueDraft?.timeHint ?? '按当前点击记录自动带入'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-4">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">补卡日期</p>
                          <p className="mt-2 text-sm font-semibold text-slate-900">{reissueDraft?.date ?? selectedPrimary.date}</p>
                          <p className="mt-1 text-xs text-slate-500">{reissueDraft?.dateText ?? selectedPrimary.dateText}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">补卡班次</p>
                          <p className="mt-2 text-sm font-semibold text-slate-900">{reissueDraft?.shiftLabel ?? '补卡说明'}</p>
                          <p className="mt-1 text-xs text-slate-500 line-clamp-2">{reissueDraft?.shiftValue ?? selectedPrimary.shift}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">补卡时间</p>
                          <p className="mt-2 text-sm font-semibold text-slate-900">{reissueDraft?.timeValue ?? '--:--'}</p>
                          <p className="mt-1 text-xs text-slate-500">{reissueDraft?.timeHint ?? '按当前点击记录自动带入'}</p>
                        </div>
                      </div>

                      <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-100">
                        <label className="text-sm font-semibold text-slate-900">补卡事由</label>
                        <textarea
                          value={reissueReason}
                          onChange={(event) => setReissueReason(event.target.value)}
                          rows={4}
                          placeholder={`请补充 ${reissueDraft?.shiftLabel ?? '补卡'} 的实际情况，例如到岗原因、现场说明或补卡背景。`}
                          className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                        />
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                          <span>补卡事由需要人工填写，系统只自动带入日期、班次和时间。</span>
                          <span>{reissueReason.length}/200</span>
                        </div>
                        {reasonInvalid ? <p className="mt-2 text-xs font-medium text-rose-600">请先填写补卡事由，再提交当前说明。</p> : null}
                      </div>

                      <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-100">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">附件上传</p>
                            <p className="mt-1 text-xs text-slate-500">可选上传图片或文件，用于补充现场证明、截图、沟通记录等材料。</p>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs font-semibold">
                            <button
                              type="button"
                              onClick={() => {
                                setUploadMode('skip');
                                setAttachments([]);
                              }}
                              className={clsx(
                                'rounded-full px-3 py-1.5 transition',
                                uploadMode === 'skip' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                              )}
                            >
                              暂不上传
                            </button>
                            <button
                              type="button"
                              onClick={() => setUploadMode('upload')}
                              className={clsx(
                                'rounded-full px-3 py-1.5 transition',
                                uploadMode === 'upload' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100',
                              )}
                            >
                              上传图片 / 文件
                            </button>
                          </div>
                        </div>

                        {uploadMode === 'upload' ? (
                          <div className="mt-4 space-y-3">
                            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 px-4 py-6 text-center transition hover:border-blue-300 hover:bg-blue-50">
                              <Paperclip className="h-5 w-5 text-blue-600" />
                              <span className="mt-2 text-sm font-semibold text-slate-900">选择图片或文件</span>
                              <span className="mt-1 text-xs text-slate-500">支持图片、PDF、Word、Excel、TXT 等常见格式</span>
                              <input
                                type="file"
                                multiple
                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                                onChange={handleAttachmentChange}
                                className="sr-only"
                              />
                            </label>

                            {attachments.length > 0 ? (
                              <div className="space-y-2">
                                {attachments.map((file) => (
                                  <div key={`${file.name}-${file.sizeLabel}`} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                                    <div className="min-w-0">
                                      <p className="truncate font-medium text-slate-900">{file.name}</p>
                                      <p className="mt-1 text-xs text-slate-500">{file.kindLabel} · {file.sizeLabel}</p>
                                    </div>
                                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm ring-1 ring-slate-100">已选择</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-500">你也可以先不上传，后续补充附件后再重新提交说明。</div>
                            )}
                          </div>
                        ) : null}
                      </div>

                      {submitDone ? (
                        <div className="rounded-[24px] border border-emerald-100 bg-emerald-50 p-4 text-emerald-900">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold">补卡说明已在当前界面提交</p>
                              <p className="mt-1 text-sm leading-6 text-emerald-800">{reissueDraft?.date ?? selectedPrimary.date} · {reissueDraft?.shiftLabel ?? '补卡说明'} · {reissueDraft?.timeValue ?? '--:--'} 已生成待审批说明，接下来会继续进入主管审批与回写流程。</p>
                              <div className="mt-3 rounded-2xl bg-white/80 px-4 py-3 text-xs leading-6 text-emerald-900 ring-1 ring-emerald-100">
                                <p><span className="font-semibold">补卡事由：</span>{reissueReason}</p>
                                <p className="mt-1"><span className="font-semibold">附件：</span>{uploadMode === 'upload' ? `${attachments.length} 个已选择` : '本次未上传'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}

                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    <div className="rounded-2xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-100">{selectedPrimary.reason}</div>
                    <div className="rounded-2xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-100">{selectedPrimary.trace}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-slate-100 px-4 py-4 sm:px-5 sm:py-5">
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    if (submitDone) {
                      setShowReminderModal(false);
                      return;
                    }
                    if (showReissueComposer) {
                      setShowReissueComposer(false);
                      setSubmitAttempted(false);
                      return;
                    }
                    setShowReminderModal(false);
                  }}
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  {submitDone ? '完成并返回记录页' : showReissueComposer ? '返回查看记录' : '稍后处理'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (submitDone) {
                      setShowReminderModal(false);
                      return;
                    }
                    if (showReissueComposer) {
                      handleSubmitReissue();
                      return;
                    }
                    openInlineReissue();
                  }}
                  className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  {submitDone ? '关闭弹层' : showReissueComposer ? '提交补卡说明' : '去补卡说明'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-semibold text-slate-900">{data.title}</h3>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{data.profile.name} · {data.profile.role}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">{data.description}</p>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <input 
                  type="month" 
                  value="2026-04"
                  className="bg-transparent outline-none cursor-pointer w-28"
                />
              </div>
            </div>

            <div className="mt-5 rounded-[28px] border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold tracking-[0.18em] text-slate-400">
                {weekdayLabels.map((label) => (
                  <div key={label} className="py-2">{label}</div>
                ))}
              </div>

              <div className="mt-2 grid grid-cols-7 gap-2">
                {data.calendarCells.map((cell) => {
                  const isSelected = selectedDate === cell.date;
                  const isAnomaly = cell.state === 'anomaly';
                  return (
                    <button
                      key={cell.key}
                      type="button"
                      onClick={() => handleSelectDate(cell.date, isAnomaly && cell.isCurrentMonth && cell.hasRecord)}
                      className={clsx(
                        'aspect-square min-h-0 rounded-[18px] p-1.5 text-center transition sm:min-h-[108px] sm:rounded-[22px] sm:p-3 sm:text-left',
                        getCellClasses(cell.state, cell.isCurrentMonth, isSelected),
                      )}
                    >
                      <div className="flex h-full flex-col items-center sm:items-start">
                        <div className="flex w-full items-start justify-center sm:justify-between">
                          <span
                            className={clsx(
                              'inline-flex text-sm font-semibold',
                              getDayBadgeClasses(cell.state, cell.isCurrentMonth, isSelected),
                            )}
                          >
                            {cell.dayNumber}
                          </span>
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
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">正常 / 无异常</span>
              <span className={clsx('rounded-full px-3 py-1 font-semibold', anomalyBurstChip)}>异常爆红</span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">请假 / 外勤 / 出差</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500">无记录 / 非采样日</span>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">我的打卡记录</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">{selectedPrimary?.dateText ?? (selectedCell ? `${selectedCell.shortDate} 暂无打卡记录` : '点击日历查看当天记录')}</h3>

                </div>
                {hasAnomaly ? (
                  <button
                    type="button"
                    onClick={() => setShowReminderModal(true)}
                    className="rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    {reminderTitle}
                  </button>
                ) : null}
              </div>

              {selectedPrimary ? (
                <>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                    <span className={`rounded-full px-3 py-1 ${selectedPrimary.statusTone}`}>{selectedPrimary.status}</span>
                    <span className={`rounded-full px-3 py-1 ${selectedPrimary.syncTone}`}>{selectedPrimary.syncStatus}</span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {selectedPrimary.entries.map((entry) => (
                      <div
                        key={`${selectedPrimary.date}-${entry.label}`}
                        className={clsx('rounded-2xl p-4', selectedPrimary.isAnomaly ? anomalyBurstSoft : 'bg-slate-50')}
                      >
                        <p className="text-sm text-slate-500">{entry.label}</p>
                        <p className="mt-2 text-xl font-semibold text-slate-900">{entry.value}</p>
                        <p className={clsx('mt-1 text-sm font-medium', selectedPrimary.isAnomaly ? anomalyBurstText : 'text-slate-700')}>{entry.status}</p>
                        <p className="mt-2 text-xs leading-5 text-slate-500">{entry.detail}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-3">
                    <div className={clsx('rounded-2xl border p-4 text-sm', selectedPrimary.isAnomaly ? anomalyBurstSurface : 'border-slate-200 bg-slate-50 text-slate-700')}>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">结果说明</p>
                      <p className="mt-2 leading-6">{selectedPrimary.reason}</p>
                    </div>
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-500">判定依据</p>
                      <p className="mt-2 leading-6">{selectedPrimary.trace}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {selectedPrimary.actions.map((action) => (
                      <Link key={`${selectedPrimary.date}-${action.label}`} to={action.to} className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                        {action.label}
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-500">
                  这一天在当前 100 人测试样板里没有生成个人打卡记录，通常表示非采样日、周末或未落样本数据。
                </div>
              )}
            </div>

            {selectedPrimary && hasAnomaly ? (
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-blue-600">{reminderTitle}</p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-900">点击异常日后直接进入补卡说明</h3>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">当前界面完成</span>
                </div>

                <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-white px-3 py-1 text-slate-700 shadow-sm ring-1 ring-slate-100">{selectedPrimary.status}</span>
                    <span className="rounded-full bg-white px-3 py-1 text-blue-700 shadow-sm ring-1 ring-blue-100">{selectedPrimary.syncStatus}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{reminderDesc}</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">补卡日期</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{reissueDraft?.date ?? selectedPrimary.date}</p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">补卡班次</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{reissueDraft?.shiftLabel ?? '补卡说明'}</p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">补卡时间</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{reissueDraft?.timeValue ?? '--:--'}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    <div className="rounded-2xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-100">{selectedPrimary.reason}</div>
                    <div className="rounded-2xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-100">{selectedPrimary.trace}</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setShowReminderModal(true)}
                    className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    弹出补卡说明
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReminderModal(true);
                      openInlineReissue();
                    }}
                    className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    去补卡说明
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data.summaryCards.map((card) => (
            <div key={card.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className={`mt-3 text-3xl font-semibold ${card.tone}`}>{card.value}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">{card.desc}</p>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
