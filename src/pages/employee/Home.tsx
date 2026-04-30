import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { Briefcase, Calendar, CheckCircle2, Clock, FileText, MapPin, Plane, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { employeeHomeInsights } from '../../data/attendanceInsights';

type VerificationState = 'idle' | 'checking' | 'success';
type PunchStage = 'idle' | 'location' | 'face' | 'success';
type PunchMode = 'checkOut' | 'outing' | 'trip';

type QuickAction = {
  title: string;
  desc: string;
  note: string;
  status: string;
  icon: LucideIcon;
  to?: string;
  punchMode?: PunchMode;
};

function formatPunchTime(date: Date) {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function EmployeeHome() {
  const [showPunchModal, setShowPunchModal] = useState(false);
  const [activePunchMode, setActivePunchMode] = useState<PunchMode>('checkOut');
  const [completedPunches, setCompletedPunches] = useState<Record<PunchMode, string | null>>({
    checkOut: null,
    outing: null,
    trip: null,
  });
  const [lastSceneMode, setLastSceneMode] = useState<PunchMode | null>(null);
  const [punchStage, setPunchStage] = useState<PunchStage>('idle');
  const [locationState, setLocationState] = useState<VerificationState>('idle');
  const [faceState, setFaceState] = useState<VerificationState>('idle');

  const latest = employeeHomeInsights.latest;
  const defaultLocation = latest.checkOutLocation !== '--' ? latest.checkOutLocation : latest.checkInLocation;
  const pendingReminderCount = employeeHomeInsights.reminderModals.length;
  const isChecking = punchStage === 'location' || punchStage === 'face';

  const punchConfigs = {
    checkOut: {
      triggerLabel: '下班打卡',
      eyebrow: '下班打卡',
      title: '先校验位置和人脸，再写入打卡',
      description: '本次打卡会先检查当前位置，再进行本人识别，通过后才算真正完成打卡。',
      badge: '总部试点',
      locationTitle: '本次打卡地点',
      locationValue: defaultLocation,
      locationHint: '打卡前会先核对当前位置是否落在当前考勤组允许的范围内。',
      locationCheckingText: '正在核验当前位置是否满足下班打卡范围…',
      locationSuccessText: '已在总部试点范围内',
      locationSuccessDesc: '位置已通过校验，可继续进行本人识别。',
      resultTitle: '下班打卡已完成',
      resultDetail: '已完成位置与人脸校验，并写入今日下班打卡结果。',
      resultLocationNote: '总部试点范围内，允许本次打卡。',
      resultFaceNote: '本人识别通过，已完成下班身份确认。',
      cardLabel: '下班打卡',
      pendingStatus: '点击按钮后校验位置与人脸',
      pendingDetail: '打卡前将先核验位置和本人识别',
      doneStatus: '已完成位置与人脸校验',
      doneDetail: `${defaultLocation} · 已写入今日考勤结果`,
    },
    outing: {
      triggerLabel: '外勤打卡',
      eyebrow: '外勤打卡',
      title: '外勤打卡也先校验位置和人脸',
      description: '客户现场或临时外出同样先核验地点与本人识别，通过后再写入外勤打卡结果。',
      badge: '客户现场',
      locationTitle: '本次外勤地点',
      locationValue: '武汉 · 科技园 T3 客户现场',
      locationHint: '会先核对当前位置是否属于本次外勤场景，再进入人脸识别。',
      locationCheckingText: '正在核验当前位置是否符合外勤打卡场景…',
      locationSuccessText: '已匹配当前外勤场景地点',
      locationSuccessDesc: '外勤地点已通过校验，可继续进行本人识别。',
      resultTitle: '外勤打卡已完成',
      resultDetail: '已完成位置与人脸校验，并写入今日外勤打卡结果。',
      resultLocationNote: '客户现场定位通过，已符合外勤打卡要求。',
      resultFaceNote: '本人识别通过，已完成外勤身份确认。',
      cardLabel: '外勤打卡',
      pendingStatus: '点击按钮后校验位置与人脸',
      pendingDetail: '客户现场打卡前先核验位置和本人识别',
      doneStatus: '已完成位置与人脸校验',
      doneDetail: '客户现场 · 已写入今日外勤打卡结果',
    },
    trip: {
      triggerLabel: '出差打卡',
      eyebrow: '出差打卡',
      title: '出差打卡同样先校验位置和人脸',
      description: '出差地点打卡前，先核验当前位置与出差场景，再进行本人识别，通过后再写入结果。',
      badge: '出差地点',
      locationTitle: '本次出差地点',
      locationValue: '武汉 · 经销商巡店门店',
      locationHint: '会先核对当前位置是否命中本次出差行程范围，再进入人脸识别。',
      locationCheckingText: '正在核验当前位置是否属于本次出差行程…',
      locationSuccessText: '已匹配当前出差行程地点',
      locationSuccessDesc: '出差地点已通过校验，可继续进行本人识别。',
      resultTitle: '出差打卡已完成',
      resultDetail: '已完成位置与人脸校验，并写入今日出差打卡结果。',
      resultLocationNote: '出差行程地点已核验通过，允许本次打卡。',
      resultFaceNote: '本人识别通过，已完成出差身份确认。',
      cardLabel: '出差打卡',
      pendingStatus: '点击按钮后校验位置与人脸',
      pendingDetail: '出差地点打卡前先核验位置和本人识别',
      doneStatus: '已完成位置与人脸校验',
      doneDetail: '出差地点 · 已写入今日出差打卡结果',
    },
  } as const;

  const activePunch = punchConfigs[activePunchMode];
  const activePunchCompletedAt = completedPunches[activePunchMode];
  const hasCompletedPunch = Boolean(activePunchCompletedAt);
  const latestScenePunch = lastSceneMode && completedPunches[lastSceneMode]
    ? {
        mode: lastSceneMode,
        time: completedPunches[lastSceneMode]!,
        label: punchConfigs[lastSceneMode].cardLabel,
        detail: punchConfigs[lastSceneMode].doneDetail,
      }
    : null;

  const quickActions: QuickAction[] = [
    { title: '我的打卡记录', desc: '优先查看最近出勤、异常天和处理结果', note: '可追溯规则判定和审批回写', status: '结果核对', icon: Clock, to: '/employee/records' },
    { title: '请假 / 外出申请', desc: '请假、出差、外出、调班统一提单', note: '提交后会同步影响考勤判定', status: '申请入口', icon: Calendar, to: '/employee/apply' },
    { title: '月度确认', desc: '月底处理异常并确认结果', note: '确认后锁定本月统计口径', status: '月底闭环', icon: FileText, to: '/employee/monthly-summary' },
  ];

  useEffect(() => {
    if (!showPunchModal) return;

    let timer: number | undefined;

    if (punchStage === 'location') {
      timer = window.setTimeout(() => {
        setLocationState('success');
        setFaceState('checking');
        setPunchStage('face');
      }, 1000);
    }

    if (punchStage === 'face') {
      timer = window.setTimeout(() => {
        const completedAt = formatPunchTime(new Date());
        setFaceState('success');
        setCompletedPunches((prev) => ({
          ...prev,
          [activePunchMode]: completedAt,
        }));
        if (activePunchMode !== 'checkOut') {
          setLastSceneMode(activePunchMode);
        }
        setPunchStage('success');
      }, 1200);
    }

    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [activePunchMode, punchStage, showPunchModal]);

  const openPunchModal = (mode: PunchMode) => {
    setActivePunchMode(mode);
    setShowPunchModal(true);

    if (completedPunches[mode]) {
      setPunchStage('success');
      setLocationState('success');
      setFaceState('success');
      return;
    }

    setPunchStage('idle');
    setLocationState('idle');
    setFaceState('idle');
  };

  const handleClosePunchModal = () => {
    setShowPunchModal(false);

    if (!hasCompletedPunch) {
      setPunchStage('idle');
      setLocationState('idle');
      setFaceState('idle');
    }
  };

  const handleStartPunch = () => {
    if (isChecking || hasCompletedPunch) return;
    setLocationState('checking');
    setFaceState('idle');
    setPunchStage('location');
  };

  const currentPunchResults = [
    { label: '上班打卡', value: latest.checkInTime, status: latest.checkInStatus, detail: `${latest.checkInLocation} · ${latest.shift}` },
    {
      label: '下班打卡',
      value: completedPunches.checkOut ?? '待打卡',
      status: completedPunches.checkOut ? punchConfigs.checkOut.doneStatus : punchConfigs.checkOut.pendingStatus,
      detail: completedPunches.checkOut ? punchConfigs.checkOut.doneDetail : punchConfigs.checkOut.pendingDetail,
    },
    {
      label: '场景打卡',
      value: latestScenePunch?.time ?? '待打卡',
      status: latestScenePunch ? `${latestScenePunch.label}已完成位置与人脸校验` : '外勤 / 出差点击后同样校验位置与人脸',
      detail: latestScenePunch?.detail ?? '支持外勤和出差打卡，点击后流程与下班打卡一致',
    },
  ];

  const verificationCards = [
    {
      key: 'location',
      title: '位置校验',
      state: locationState,
      summary: locationState === 'success'
        ? activePunch.locationSuccessText
        : locationState === 'checking'
          ? activePunch.locationCheckingText
          : activePunch.locationValue,
      desc: locationState === 'success' ? activePunch.locationSuccessDesc : activePunch.locationHint,
    },
    {
      key: 'face',
      title: '人脸识别',
      state: faceState,
      summary: faceState === 'success' ? '本人识别通过' : faceState === 'checking' ? '正在识别本人信息…' : '等待位置校验完成后开始',
      desc: faceState === 'success' ? '本次打卡已完成本人核验，可直接写入考勤结果。' : '位置通过后再做人脸识别，避免直接进入打卡结果。',
    },
  ] as const;

  return (
    <>
      {showPunchModal ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/35 px-3 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] pt-5 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="flex max-h-[calc(100dvh-7rem)] w-full max-w-md flex-col overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.24)] sm:max-h-[90vh]">
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5 sm:py-5">
              <div>
                <p className="text-sm font-medium text-blue-600">{activePunch.eyebrow}</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">{activePunch.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{activePunch.description}</p>
              </div>
              <button
                type="button"
                onClick={handleClosePunchModal}
                className="shrink-0 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
              <div className="rounded-[24px] border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">{activePunch.locationTitle}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100">{activePunch.badge}</span>
                </div>
                <p className="mt-2 flex items-center text-sm font-medium">
                  <MapPin className="mr-1.5 h-4 w-4" />
                  {activePunch.locationValue}
                </p>
                <p className="mt-1 text-xs leading-5 text-blue-700">{activePunch.locationHint}</p>
              </div>

              <div className="mt-4 space-y-3">
                {verificationCards.map((item, index) => (
                  <div key={item.key} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{index + 1}. {item.title}</p>
                        <p className="mt-2 text-sm font-medium text-slate-900">{item.summary}</p>
                      </div>
                      <span
                        className={clsx(
                          'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
                          item.state === 'success' && 'bg-emerald-50 text-emerald-700',
                          item.state === 'checking' && 'bg-blue-50 text-blue-700',
                          item.state === 'idle' && 'bg-slate-200 text-slate-500',
                        )}
                      >
                        <span
                          className={clsx(
                            'mr-2 h-2.5 w-2.5 rounded-full',
                            item.state === 'success' && 'bg-emerald-500',
                            item.state === 'checking' && 'animate-pulse bg-blue-500',
                            item.state === 'idle' && 'bg-slate-300',
                          )}
                        />
                        {item.state === 'success' ? '已通过' : item.state === 'checking' ? '校验中' : '待开始'}
                      </span>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>

              {punchStage === 'success' ? (
                <div className="mt-4 rounded-[24px] border border-emerald-100 bg-emerald-50 p-4 text-emerald-900">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{activePunch.resultTitle}</p>
                      <p className="mt-1 text-sm leading-6">{activePunchCompletedAt ?? '--:--'} · {activePunch.locationValue} {activePunch.resultDetail}</p>
                      <div className="mt-3 rounded-2xl bg-white/80 px-4 py-3 text-xs leading-6 text-emerald-900 ring-1 ring-emerald-100">
                        <p><span className="font-semibold">位置校验：</span>{activePunch.resultLocationNote}</p>
                        <p className="mt-1"><span className="font-semibold">人脸识别：</span>{activePunch.resultFaceNote}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {pendingReminderCount > 0 ? (
                <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm ring-1 ring-slate-100">
                  <p className="font-semibold text-slate-900">后续提醒</p>
                  <p className="mt-2 leading-6">本次打卡完成后，当前样板里还有 {pendingReminderCount} 条异常/补卡提醒，可稍后去记录页继续处理。</p>
                </div>
              ) : null}
            </div>

            <div className="shrink-0 border-t border-slate-100 px-4 py-4 sm:px-5 sm:py-5">
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleClosePunchModal}
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  {punchStage === 'success' ? '关闭' : '暂不打卡'}
                </button>

                {punchStage === 'success' ? (
                  <Link
                    to="/employee/records"
                    onClick={handleClosePunchModal}
                    className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    查看打卡记录
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartPunch}
                    disabled={isChecking}
                    className={clsx(
                      'flex-1 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition',
                      isChecking ? 'cursor-not-allowed bg-slate-300' : 'bg-blue-600 hover:bg-blue-700',
                    )}
                  >
                    {isChecking ? '正在校验…' : '开始校验并打卡'}
                  </button>
                )}
              </div>
            </div>
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
            <div>{latest.dateText}</div>
            <div className="mt-1 font-medium text-gray-700">第三阶段总部试点</div>
          </div>
        </div>
      </header>

      <main className="space-y-4 p-4">
        <section className="relative min-h-[683px] overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 p-5 text-white shadow-[0_20px_40px_rgba(37,99,235,0.28)] sm:h-auto sm:overflow-visible">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-blue-100">今日班次</p>
              <h2 className="mt-1 text-2xl font-semibold">{employeeHomeInsights.profile.shift.replace('标准班：', '').replace('弹性打卡：', '')}</h2>
              <p className="mt-2 text-sm text-blue-100">{employeeHomeInsights.profile.attendanceGroup} · 当前回放 {latest.dateText}</p>
            </div>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20">第三阶段 100 人样板</span>
          </div>

          <div className="mt-4 hidden flex-wrap gap-2 sm:flex">
            {employeeHomeInsights.statusChips.map((chip) => (
              <span key={chip.label} className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${chip.tone}`}>
                {chip.label}
              </span>
            ))}
          </div>

          <div className="mx-auto mt-5 min-h-[385px] w-[90%] rounded-[28px] bg-white px-5 py-6 text-center text-gray-900 shadow-lg sm:mx-0 sm:h-auto sm:w-auto">
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
                  onClick={() => openPunchModal('checkOut')}
                  className="absolute left-1/2 top-[10px] z-10 inline-flex h-[202px] w-[202px] -translate-x-1/2 items-center justify-center rounded-full bg-blue-600 px-6 text-white shadow-[0_22px_48px_rgba(37,99,235,0.35)] transition hover:bg-blue-700 active:scale-95"
                >
                  <span>
                    <span className="block text-[18px] font-bold leading-8">{completedPunches.checkOut ? '打卡完成' : '下班打卡'}</span>
                    <span className="mt-2 block text-[14px] leading-5 text-blue-100">{completedPunches.checkOut ? `${completedPunches.checkOut} 已完成校验` : '点击后先检查位置和人脸'}</span>
                  </span>
                </button>
                <button type="button" onClick={() => openPunchModal('outing')} className="absolute -bottom-[12px] left-6 flex flex-col items-center">
                  <span className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-sm transition hover:bg-blue-100 active:scale-95">
                    <Briefcase className="h-4 w-4" />
                  </span>
                  <span className="mt-2 text-[11px] font-semibold text-slate-700">外勤打卡</span>
                </button>
                <button type="button" onClick={() => openPunchModal('trip')} className="absolute -bottom-[12px] right-6 flex flex-col items-center">
                  <span className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-sm transition hover:bg-blue-100 active:scale-95">
                    <Plane className="h-4 w-4" />
                  </span>
                  <span className="mt-2 text-[11px] font-semibold text-slate-700">出差打卡</span>
                </button>
              </div>
            </div>
            <div className="mt-4 hidden items-center justify-center gap-4 sm:flex">
              <button
                type="button"
                onClick={() => openPunchModal('outing')}
                className="inline-flex h-[108px] w-[108px] items-center justify-center rounded-full bg-slate-100 text-slate-700 shadow-sm transition hover:bg-slate-200 active:scale-95"
              >
                <span>
                  <Briefcase className="mx-auto h-5 w-5" />
                  <span className="mt-2 block text-sm font-semibold">外勤打卡</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => openPunchModal('checkOut')}
                className="inline-flex h-36 w-36 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_18px_40px_rgba(37,99,235,0.32)] transition hover:bg-blue-700 active:scale-95"
              >
                <span>
                  <span className="block text-2xl font-bold">{completedPunches.checkOut ? '打卡完成' : '下班打卡'}</span>
                  <span className="mt-2 block text-xs text-blue-100">{completedPunches.checkOut ? `${completedPunches.checkOut} 已完成校验` : '点击后先检查位置和人脸'}</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => openPunchModal('trip')}
                className="inline-flex h-[108px] w-[108px] items-center justify-center rounded-full bg-slate-100 text-slate-700 shadow-sm transition hover:bg-slate-200 active:scale-95"
              >
                <span>
                  <Plane className="mx-auto h-5 w-5" />
                  <span className="mt-2 block text-sm font-semibold">出差打卡</span>
                </span>
              </button>
            </div>
            <p className="mt-2 hidden items-center text-xs text-gray-500 sm:inline-flex">
              <MapPin className="mr-1 h-3.5 w-3.5" />
              点击任一打卡按钮后，都会自动完成位置校验与人脸识别
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
            {employeeHomeInsights.stats.map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/10 p-3">
                <p className="text-xs text-blue-100">{item.label}</p>
                <p className="mt-2 text-lg font-semibold">{item.value}</p>
                <p className="text-xs text-blue-100">统一按 100 人样板口径回写</p>
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
                <p className="mt-4 text-sm font-semibold text-gray-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-gray-500">{item.desc}</p>
              </>
            );

            if (item.punchMode) {
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => openPunchModal(item.punchMode!)}
                  className="rounded-3xl bg-white p-4 text-left shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {content}
                </button>
              );
            }

            return item.to ? (
              <Link key={item.title} to={item.to} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-md">
                {content}
              </Link>
            ) : (
              <button key={item.title} type="button" className="rounded-3xl bg-white p-4 text-left shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-md">
                {content}
              </button>
            );
          })}
        </section>
      </main>
    </>
  );
}
