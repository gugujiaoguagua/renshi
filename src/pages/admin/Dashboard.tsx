import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { AlertCircle, ArrowRight, Briefcase, Calendar, CheckCircle2, Clock3, FileText, MapPin, Plane, Settings, Users, X } from 'lucide-react';

import { Link } from 'react-router-dom';
import { adminDashboardInsights, profileInsights } from '../../data/attendanceInsights';


type PunchMode = 'checkOut' | 'outing' | 'trip';
type PunchStage = 'idle' | 'location' | 'face' | 'success';
type VerificationState = 'idle' | 'checking' | 'success';

const shortcuts = [
  { title: '我的打卡记录', desc: '先查看人事本人日历记录，再继续处理全局异常与月报。', to: '/admin/records', icon: Clock3 },
  { title: '异常中心', desc: '先处理缺卡、迟到、待确认记录', to: '/admin/exceptions', icon: AlertCircle },
  { title: '组织与人员', desc: '检查人员归属与组织口径', to: '/admin/organization', icon: Users },
  { title: '月报中心', desc: '统一汇总月报结果并支持筛选导出', to: '/admin/rules', icon: Settings },
  { title: '排班管理', desc: '查看待确认班次与发布状态', to: '/admin/schedule', icon: Calendar },
];


function formatPunchTime(date: Date) {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}


export default function AdminDashboard() {
  const adminProfile = profileInsights.admin;
  const defaultLocation = `${adminProfile.org} · 人事办公区`;

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

  const summaryCards = adminDashboardInsights.summaryCards(adminDashboardInsights.rows);
  const pendingReminderCount = adminDashboardInsights.pendingItems.length;
  const isChecking = punchStage === 'location' || punchStage === 'face';

  const punchConfigs = {
    checkOut: {
      eyebrow: '人事下班打卡',
      title: '人事本人也先校验位置和人脸，再写入打卡',
      description: '人事视角下，本人下班打卡同样先检查当前位置，再进行本人识别，通过后才算真正完成打卡。',
      badge: '人事本人',
      locationTitle: '本次打卡地点',
      locationValue: defaultLocation,
      locationHint: '打卡前会先核对当前位置是否落在人事当前考勤组允许的范围内。',
      locationCheckingText: '正在核验当前位置是否满足人事下班打卡范围…',
      locationSuccessText: '已在人事考勤范围内',
      locationSuccessDesc: '位置已通过校验，可继续进行本人识别。',
      resultTitle: '人事下班打卡已完成',
      resultDetail: '已完成位置与人脸校验，并写入人事本人今日下班打卡结果。',
      resultLocationNote: '人事办公区定位通过，允许本次打卡。',
      resultFaceNote: '本人识别通过，已完成人事身份确认。',
      pendingStatus: '点击按钮后校验位置与人脸',
      pendingDetail: '人事本人打卡前将先核验位置和本人识别',
      doneStatus: '已完成位置与人脸校验',
      doneDetail: `${defaultLocation} · 已写入人事本人今日打卡结果`,
      cardLabel: '下班打卡',
    },
    outing: {
      eyebrow: '人事外勤打卡',
      title: '人事外勤打卡也先校验位置和人脸',
      description: '人事到分部、门店或现场核查时，同样先核验地点与本人识别，通过后再写入外勤打卡结果。',
      badge: '人事外勤',
      locationTitle: '本次外勤地点',
      locationValue: '武汉 · 门店巡检现场',
      locationHint: '会先核对当前位置是否属于本次人事外勤场景，再进入人脸识别。',
      locationCheckingText: '正在核验当前位置是否符合人事外勤场景…',
      locationSuccessText: '已匹配当前人事外勤地点',
      locationSuccessDesc: '外勤地点已通过校验，可继续进行本人识别。',
      resultTitle: '人事外勤打卡已完成',
      resultDetail: '已完成位置与人脸校验，并写入人事本人今日外勤打卡结果。',
      resultLocationNote: '人事外勤地点定位通过，符合本次打卡要求。',
      resultFaceNote: '本人识别通过，已完成人事外勤身份确认。',
      pendingStatus: '点击按钮后校验位置与人脸',
      pendingDetail: '人事外勤打卡前先核验位置和本人识别',
      doneStatus: '已完成位置与人脸校验',
      doneDetail: '人事外勤现场 · 已写入今日外勤打卡结果',
      cardLabel: '外勤打卡',
    },
    trip: {
      eyebrow: '人事出差打卡',
      title: '人事出差打卡同样先校验位置和人脸',
      description: '人事跨区域巡检或支持月结时，先核验当前位置与出差场景，再进行本人识别，通过后再写入结果。',
      badge: '人事出差',
      locationTitle: '本次出差地点',
      locationValue: '华中区域 · 月结支持点位',
      locationHint: '会先核对当前位置是否命中本次人事出差行程范围，再进入人脸识别。',
      locationCheckingText: '正在核验当前位置是否属于人事出差行程…',
      locationSuccessText: '已匹配当前人事出差地点',
      locationSuccessDesc: '出差地点已通过校验，可继续进行本人识别。',
      resultTitle: '人事出差打卡已完成',
      resultDetail: '已完成位置与人脸校验，并写入人事本人今日出差打卡结果。',
      resultLocationNote: '人事出差行程地点已核验通过，允许本次打卡。',
      resultFaceNote: '本人识别通过，已完成人事出差身份确认。',
      pendingStatus: '点击按钮后校验位置与人脸',
      pendingDetail: '人事出差打卡前先核验位置和本人识别',
      doneStatus: '已完成位置与人脸校验',
      doneDetail: '人事出差地点 · 已写入今日出差打卡结果',
      cardLabel: '出差打卡',
    },
  } as const;

  const activePunch = punchConfigs[activePunchMode];
  const activePunchCompletedAt = completedPunches[activePunchMode];
  const hasCompletedPunch = Boolean(activePunchCompletedAt);
  const latestScenePunch = lastSceneMode && completedPunches[lastSceneMode]
    ? {
        time: completedPunches[lastSceneMode]!,
        label: punchConfigs[lastSceneMode].cardLabel,
        detail: punchConfigs[lastSceneMode].doneDetail,
      }
    : null;

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
    { label: '工作台定位', value: '人事视角', status: '当前优先处理异常 / 月报 / 导出', detail: `${adminProfile.org} · ${adminProfile.role}` },
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
      detail: latestScenePunch?.detail ?? '人事外勤和出差打卡，流程已与员工端保持一致',
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
    <div className="space-y-6">
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
                  <p className="mt-2 leading-6">本次打卡完成后，人事首页里还有 {pendingReminderCount} 条重点提醒，可继续处理异常、月报和导出。</p>
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
                    to="/admin/records"
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



      <section className="relative min-h-[683px] overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 p-5 text-white shadow-[0_20px_40px_rgba(37,99,235,0.28)] sm:h-auto sm:overflow-visible">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-blue-100">当前工作台</p>
            <h2 className="mt-1 text-2xl font-semibold">人事视角 · 先处理异常和月报</h2>
            <p className="mt-2 text-sm text-blue-100">当前样板人事：{adminProfile.name} · {adminProfile.role}</p>
          </div>
          <Link to="/admin/exceptions" className="hidden rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20 transition hover:bg-white/20 sm:inline-flex">
            异常待处理
          </Link>
        </div>

        <div className="mx-auto mt-5 min-h-[385px] w-[313px] max-w-[calc(100vw-2.5rem)] rounded-[28px] bg-white px-5 py-6 text-center text-gray-900 shadow-lg sm:mx-0 sm:h-auto sm:w-auto sm:max-w-none">
          <p className="text-sm text-gray-500">当前可执行动作</p>
          <div className="mt-4 sm:hidden">
            <div className="relative mx-auto h-[268px] w-[252px]">
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
              <div className="absolute -bottom-[40px] left-6 flex flex-col items-center">
                <button type="button" onClick={() => openPunchModal('outing')} className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-sm transition hover:bg-blue-100 active:scale-95">
                  <Briefcase className="h-4 w-4" />
                </button>
                <span className="mt-2 text-[11px] font-semibold text-slate-700">外勤打卡</span>
              </div>
              <div className="absolute -bottom-[40px] right-6 flex flex-col items-center">
                <button type="button" onClick={() => openPunchModal('trip')} className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-sm transition hover:bg-blue-100 active:scale-95">
                  <Plane className="h-4 w-4" />
                </button>
                <span className="mt-2 text-[11px] font-semibold text-slate-700">出差打卡</span>
              </div>
            </div>
          </div>
          <div className="mt-4 hidden items-center justify-center gap-4 sm:flex">
            <button type="button" onClick={() => openPunchModal('outing')} className="inline-flex h-[108px] w-[108px] items-center justify-center rounded-full bg-slate-100 text-slate-700 shadow-sm transition hover:bg-slate-200 active:scale-95">
              <span>
                <Briefcase className="mx-auto h-5 w-5" />
                <span className="mt-2 block text-sm font-semibold">外勤打卡</span>
              </span>
            </button>
            <button type="button" onClick={() => openPunchModal('checkOut')} className="inline-flex h-36 w-36 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_18px_40px_rgba(37,99,235,0.32)] transition hover:bg-blue-700 active:scale-95">
              <span>
                <span className="block text-2xl font-bold">{completedPunches.checkOut ? '打卡完成' : '下班打卡'}</span>
                <span className="mt-2 block text-xs text-blue-100">{completedPunches.checkOut ? `${completedPunches.checkOut} 已完成校验` : '点击后先检查位置和人脸'}</span>
              </span>
            </button>
            <button type="button" onClick={() => openPunchModal('trip')} className="inline-flex h-[108px] w-[108px] items-center justify-center rounded-full bg-slate-100 text-slate-700 shadow-sm transition hover:bg-slate-200 active:scale-95">
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

      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <div key={item.label} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-500">{item.label}</p>
              {item.tag ? <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">{item.tag}</span> : null}
            </div>
            <p className={`mt-4 text-3xl font-semibold ${item.tone}`}>{item.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">首页快捷入口</h2>
              <p className="mt-1 text-sm text-gray-500">优先承接异常、规则、排班和基础数据维护。</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              P0 工作台入口
            </span>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {shortcuts.map((item) => (
              <Link key={item.title} to={item.to} className="group rounded-3xl border border-gray-100 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-blue-100 hover:bg-blue-50/60 hover:shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm ring-1 ring-gray-100">
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-base font-semibold text-gray-900">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-gray-500">{item.desc}</p>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-blue-600">
                  进入模块
                  <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">今日重点提醒</h2>
              <p className="mt-1 text-sm text-gray-500">把必须处理的事直接放到首页。</p>
            </div>
            <FileText className="h-5 w-5 text-gray-400" />
          </div>
          <div className="mt-5 space-y-3">
            {adminDashboardInsights.pendingItems.map((item) => (
              <Link key={item.title} to={item.to} className={`block rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm ${item.tone}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 opacity-90">{item.desc}</p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 opacity-70" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
