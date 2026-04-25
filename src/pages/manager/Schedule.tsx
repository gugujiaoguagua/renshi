import { AlertTriangle, ChevronDown, ChevronLeft, ChevronRight, Clock, Copy, RefreshCw, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const pendingShiftRequests = [
  {
    name: '赵六',
    department: '直营二店 · 店员',
    type: '自选排班',
    detail: '店长当天未排班，员工先选择门店晚班 14:00 - 22:00，等待确认。',
    nextStep: '审批通过后自动回写本周班表和异常中心。',
    tone: 'border-emerald-100 bg-emerald-50 text-emerald-900',
  },
  {
    name: '孙敏',
    department: '直营一店 · 店员',
    type: '调班申请',
    detail: '申请和同事互换 4 月 26 日早班，待店长确认后同步排班表。',
    nextStep: '确认后自动覆盖原排班，避免月底仍按旧班次判异常。',
    tone: 'border-blue-100 bg-blue-50 text-blue-900',
  },
];

const scheduleTips = [
  '未发布前，店长会在每天 10:00 / 16:00 收到未排班提醒。',
  '支持引用上周 / 上月排班，减少重复手动排班。',
  '员工自选班次进入审批后，确认结果会直接回写排班页、异常中心和月报口径。',
];

const publishFlow = [
  {
    title: '发布班表',
    desc: '发布后冻结本周排班版本，员工端可以立即看到最终班次。',
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

export default function ManagerSchedule() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h1 className="text-lg font-semibold text-gray-900">排班管理</h1>
          <div className="flex items-center space-x-2 text-sm">
            <button className="flex items-center rounded-md bg-gray-100 px-3 py-1.5 text-gray-700 transition hover:bg-gray-200">
              技术二组 <ChevronDown className="ml-1 h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between bg-gray-50 px-4 py-2">
          <div className="flex items-center space-x-3">
            <button className="text-gray-400 hover:text-gray-600"><ChevronLeft className="h-5 w-5" /></button>
            <span className="text-sm font-medium text-gray-800">2024年 5月 第4周</span>
            <button className="text-gray-400 hover:text-gray-600"><ChevronRight className="h-5 w-5" /></button>
          </div>
          <div className="flex space-x-1 rounded-md bg-gray-200 p-1">
            <button className="rounded bg-white px-3 py-1 text-xs font-medium text-gray-800 shadow-sm">按周</button>
            <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700">按月</button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200 py-2 text-center text-xs font-medium text-gray-500">
          <div>一<br />20</div>
          <div>二<br />21</div>
          <div>三<br />22</div>
          <div>四<br />23</div>
          <div>五<br />24</div>
          <div className="text-red-500">六<br />25</div>
          <div className="text-red-500">日<br />26</div>
        </div>
      </header>

      <main className="mb-16 space-y-3 p-2 pb-24">
        <section className="rounded-3xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
          <div className="flex items-start gap-3 text-amber-900">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold">还有 2 位成员未排班，系统会持续提醒</p>
              <p className="mt-2 text-sm leading-6 text-amber-800">
                根据第二阶段沟通补上提醒说明：只要班表未发布，店长会持续收到提醒，避免“没排班但员工已经上班”的场景反复出现。
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button className="rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Copy className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900">引用上周排班</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">下周排班接近时，直接复用上周模板，减少重复录入。</p>
          </button>
          <button className="rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
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

        <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-3 py-2">
            <div className="flex items-center">
              <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">王</div>
              <span className="text-sm font-medium text-gray-800">王小明 (前端开发)</span>
            </div>
            <span className="text-xs text-gray-500">本周已排 40h</span>
          </div>
          <div className="grid grid-cols-7 gap-px bg-gray-100 p-px">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex h-16 cursor-pointer flex-col items-center justify-center rounded-sm border border-transparent bg-blue-50 text-xs hover:border-blue-300 hover:bg-blue-100">
                <span className="font-medium text-blue-800">朝 9 晚 6</span>
                {i === 1 && <span className="scale-90 text-blue-500">09-18</span>}
              </div>
            ))}
            {[6, 7].map((i) => (
              <div key={i} className="flex h-16 cursor-pointer flex-col items-center justify-center rounded-sm bg-white text-xs hover:bg-gray-50">
                <span className="text-gray-400">休息</span>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-yellow-100 bg-yellow-50 px-3 py-2">
            <div className="flex items-center">
              <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600">李</div>
              <span className="text-sm font-medium text-gray-800">李大华 (测试工程师)</span>
            </div>
            <span className="flex items-center text-xs font-medium text-yellow-600">
              <AlertTriangle className="mr-1 h-3 w-3" />
              存在未排班
            </span>
          </div>
          <div className="grid grid-cols-7 gap-px bg-gray-100 p-px">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex h-16 cursor-pointer flex-col items-center justify-center rounded-sm bg-purple-50 text-xs hover:bg-purple-100">
                <span className="font-medium text-purple-800">14:00-22:00</span>
                {i === 1 && <span className="scale-90 text-purple-500">门店晚班</span>}
              </div>
            ))}
            {[4, 5].map((i) => (
              <div key={i} className="flex h-16 cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed border-red-300 bg-red-50 text-xs hover:bg-red-100">
                <span className="font-medium text-red-500">+ 排班</span>
              </div>
            ))}
            {[6, 7].map((i) => (
              <div key={i} className="flex h-16 cursor-pointer flex-col items-center justify-center rounded-sm bg-white text-xs hover:bg-gray-50">
                <span className="text-gray-400">休息</span>
              </div>
            ))}
          </div>
        </div>

        <section className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900">
              <RefreshCw className="h-5 w-5 text-emerald-600" />
              <h2 className="text-base font-semibold">待确认的自选 / 调班</h2>
            </div>
            <div className="mt-4 space-y-3">
              {pendingShiftRequests.map((item) => (
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
          已排 <span className="font-medium text-gray-900">1/2</span> 人
          <p className="mt-1 text-xs text-gray-400">待确认自选班次 2 条 · 发布后同步异常 / 月报</p>
        </div>
        <div className="flex space-x-2">
          <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
            引用上周
          </button>
          <button className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700">
            发布排班
          </button>
        </div>
      </div>
    </>
  );
}

