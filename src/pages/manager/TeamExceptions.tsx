import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, Calendar, CheckSquare, Clock, Filter, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const filters = ['全部异常', '缺卡', '迟到', '待沟通'] as const;
type FilterType = (typeof filters)[number];

const teamExceptions = [
  {
    name: '张三',
    department: '技术二组 · 前端开发',
    type: '缺卡',
    date: '2026-04-25',
    detail: '昨天 18:00 下班缺卡，员工已提交说明，等待主管确认是否补卡。',
    tone: 'border-red-100 bg-red-50 text-red-900',
    actionText: '去审批',
    actionTo: '/manager/approval',
    urgent: true,
  },
  {
    name: '李四',
    department: '技术二组 · 测试工程师',
    type: '迟到',
    date: '2026-04-24',
    detail: '今日上班 09:12 打卡，已迟到 12 分钟，需要判断是否纳入异常。',
    tone: 'border-amber-100 bg-amber-50 text-amber-900',
    actionText: '看规则',
    actionTo: '/manager/approval',
    urgent: true,
  },
  {
    name: '王小明',
    department: '技术二组 · 前端开发',
    type: '待沟通',
    date: '2026-04-26',
    detail: '周六仍未排班，如不处理将影响本周异常口径与排班发布。',
    tone: 'border-purple-100 bg-purple-50 text-purple-900',
    actionText: '去排班',
    actionTo: '/manager/schedule',
    urgent: false,
  },
];

const quickStats = [
  { label: '团队异常', value: '5 条', tone: 'text-red-600' },
  { label: '待审批补卡', value: '3 条', tone: 'text-amber-600' },
  { label: '未排班成员', value: '2 人', tone: 'text-purple-600' },
  { label: '已闭环', value: '8 条', tone: 'text-emerald-600' },
];

export default function ManagerTeamExceptions() {
  const [keyword, setKeyword] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('全部异常');
  const [onlyUrgent, setOnlyUrgent] = useState(false);

  const filteredList = useMemo(() => {
    return teamExceptions.filter((item) => {
      const matchKeyword =
        !keyword ||
        [item.name, item.department, item.type, item.detail].some((part) => part.toLowerCase().includes(keyword.toLowerCase()));
      const matchFilter = activeFilter === '全部异常' || item.type === activeFilter;
      const matchUrgent = !onlyUrgent || item.urgent;
      return matchKeyword && matchFilter && matchUrgent;
    });
  }, [activeFilter, keyword, onlyUrgent]);

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-white/60 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-red-500">团队异常明细</p>
            <h1 className="mt-1 text-xl font-semibold text-gray-900">先把高风险异常逐条处理</h1>
          </div>
          <Link to="/manager/team" className="rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-slate-200">
            返回工作台
          </Link>
        </div>
      </header>

      <main className="space-y-4 p-4 pb-24">
        <section className="rounded-[28px] bg-gradient-to-br from-red-500 via-rose-500 to-orange-500 p-5 text-white shadow-[0_20px_40px_rgba(244,63,94,0.25)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="text-sm text-red-50">今日异常概览</p>
              <h2 className="mt-1 text-2xl font-semibold">有 2 条异常今天必须处理完</h2>
              <p className="mt-2 text-sm leading-6 text-red-50/90">
                这页承接工作台里的“团队异常”卡片，帮助主管从摘要直接进入成员级处理列表。
              </p>
            </div>
            <div className="rounded-3xl bg-white/15 px-4 py-3 text-sm text-white ring-1 ring-white/15">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                今日高风险：缺卡 1 条、迟到 1 条
              </div>
              <div className="mt-2 flex items-center gap-2 text-red-50">
                <Calendar className="h-4 w-4" />
                建议在 18:00 前完成沟通与审批
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickStats.map((item) => (
            <div key={item.label} className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-gray-500">{item.label}</p>
              <p className={`mt-3 text-3xl font-semibold ${item.tone}`}>{item.value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="搜索成员姓名 / 异常类型"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setActiveFilter(item)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeFilter === item ? 'bg-gray-900 text-white' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'}`}
                >
                  {item}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setOnlyUrgent((current) => !current)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${onlyUrgent ? 'border-red-200 bg-red-50 text-red-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-slate-50'}`}
              >
                <Filter className="h-4 w-4" />
                {onlyUrgent ? '仅看高风险中' : '更多筛选'}
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          {filteredList.length > 0 ? (
            filteredList.map((item) => (
              <div key={`${item.name}-${item.type}-${item.date}`} className={`rounded-3xl border p-4 shadow-sm ${item.tone}`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold">{item.name}</h3>
                      <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold">{item.type}</span>
                      <span className="text-xs opacity-80">{item.date}</span>
                    </div>
                    <p className="mt-2 text-sm opacity-90">{item.department}</p>
                    <p className="mt-3 text-sm leading-6 opacity-90">{item.detail}</p>
                  </div>
                  <Link
                    to={item.actionTo}
                    className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    {item.actionText}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400 shadow-sm">
              当前筛选条件下暂无团队异常记录
            </div>
          )}
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-900">
              <CheckSquare className="h-5 w-5 text-amber-600" />
              <h3 className="text-base font-semibold">处理建议</h3>
            </div>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <div className="rounded-2xl bg-slate-50 p-4">优先处理缺卡和已超 24 小时未审批的补卡，避免月底集中堆积。</div>
              <div className="rounded-2xl bg-slate-50 p-4">如果异常由规则或排班导致，先去对应模块修正，再回来看成员明细。</div>
              <div className="rounded-2xl bg-slate-50 p-4">建议主管先与员工确认情况，再执行审批或驳回动作。</div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-900">
              <Clock className="h-5 w-5 text-purple-600" />
              <h3 className="text-base font-semibold">今日处理节奏</h3>
            </div>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <span className="mt-0.5 rounded-full bg-white px-2 py-1 text-xs font-semibold text-gray-700">10:30</span>
                <p>先看工作台里的高风险异常和待审批数量。</p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <span className="mt-0.5 rounded-full bg-white px-2 py-1 text-xs font-semibold text-gray-700">15:00</span>
                <p>检查未排班成员，避免次日继续生成异常。</p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <span className="mt-0.5 rounded-full bg-white px-2 py-1 text-xs font-semibold text-gray-700">18:00</span>
                <p>确保高风险异常闭环，并回到工作台确认数量已下降。</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
