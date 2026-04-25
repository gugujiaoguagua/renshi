import { useState } from 'react';
import { AlertCircle, ArrowRight, Briefcase, Calendar, Download, FileText, MapPin, Plane, RefreshCw, Settings, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

type ExportPreset = 'hr' | 'store' | 'finance';

const summaryCards = [
  { label: '统计人数', value: '124', tone: 'text-gray-900' },
  { label: '全勤人数', value: '89', tone: 'text-emerald-600' },
  { label: '异常扣薪人数', value: '12', tone: 'text-red-600', tag: '需复核' },
  { label: '待处理异常 / 审批', value: '5 / 3', tone: 'text-amber-500' },
];

const shortcuts = [
  { title: '异常中心', desc: '先处理缺卡、迟到、待确认记录', to: '/admin/exceptions', icon: AlertCircle },
  { title: '组织与人员', desc: '检查人员归属与组织口径', to: '/admin/organization', icon: Users },
  { title: '班次与规则', desc: '维护班次模板与判定规则', to: '/admin/rules', icon: Settings },
  { title: '排班管理', desc: '查看未排班与发布状态', to: '/admin/schedule', icon: Calendar },
];

const pendingItems = [
  { title: '月底异常处理催办', desc: '市场部仍有 7 人未处理本月异常，建议今日催办。', tone: 'border-amber-100 bg-amber-50 text-amber-900', to: '/admin/exceptions' },
  { title: '审批积压提醒', desc: '运营部待审批补卡 3 条，已超过 24 小时未处理。', tone: 'border-red-100 bg-red-50 text-red-900', to: '/admin/exceptions' },
  { title: '规则生效确认', desc: '技术中心 09:00 - 18:00 班次规则昨天更新，建议核对月报是否已按新规则计算。', tone: 'border-blue-100 bg-blue-50 text-blue-900', to: '/admin/rules' },
];

const exportPresets = [
  {
    id: 'hr' as const,
    title: '人事标准模板',
    desc: '按考勤核对和月度确认使用，兼顾异常、请假、外勤和留痕。',
  },
  {
    id: 'store' as const,
    title: '门店运营模板',
    desc: '突出排班、外勤、调班和门店负责人最关心的字段。',
  },
  {
    id: 'finance' as const,
    title: '薪资核算模板',
    desc: '保留计薪、异常扣款、请假和审批结果，便于对接薪资表。',
  },
];

const exportColumnsByPreset: Record<ExportPreset, string[]> = {
  hr: ['姓名', '工号', '部门', '班次', '应出勤', '实际出勤', '迟到分钟', '缺卡次数', '外勤天数', '出差天数', '请假天数', '审批结果', '回写来源'],
  store: ['姓名', '门店', '岗位', '班次', '未排班标记', '外勤场景', '出差地点', '调班结果', '缺卡次数', '店长审批人'],
  finance: ['姓名', '工号', '部门', '计薪天数', '迟到扣款分钟', '缺卡扣款', '请假天数', '出差天数', '异常结果', '审批状态'],
};

const exportFieldGroups = [
  {
    title: '基础身份字段',
    tag: '必选',
    tone: 'bg-blue-50 text-blue-700',
    items: ['姓名', '工号', '部门', '门店', '岗位'],
  },
  {
    title: '考勤结果字段',
    tag: '核心口径',
    tone: 'bg-emerald-50 text-emerald-700',
    items: ['班次', '应出勤', '实际出勤', '迟到分钟', '早退分钟', '缺卡次数', '旷工天数', '计薪天数'],
  },
  {
    title: '场景补充字段',
    tag: '第二阶段新增',
    tone: 'bg-purple-50 text-purple-700',
    items: ['外勤天数', '外勤场景', '出差天数', '出差地点', '请假天数', '调班结果', '未排班标记'],
  },
  {
    title: '审批与留痕字段',
    tag: '追溯',
    tone: 'bg-amber-50 text-amber-700',
    items: ['审批状态', '审批结果', '回写来源', '店长审批人'],
  },
];

const exportSourceCards = [
  {
    title: '打卡记录',
    desc: '提供时间、地点、班次判定和异常原始结果。',
    tone: 'border-blue-100 bg-blue-50 text-blue-900',
  },
  {
    title: '申请与审批',
    desc: '补充请假、出差、外勤、调班和审批结果来源。',
    tone: 'border-purple-100 bg-purple-50 text-purple-900',
  },
  {
    title: '日志与人工修正',
    desc: '记录规则版本、人工修正原因和最终回写口径。',
    tone: 'border-slate-200 bg-slate-50 text-slate-900',
  },
];

export default function AdminDashboard() {
  const [activePreset, setActivePreset] = useState<ExportPreset>('hr');

  const selectedColumns = exportColumnsByPreset[activePreset];

  return (
    <div className="space-y-6">
      <section className="relative h-[683px] overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 p-5 text-white shadow-[0_20px_40px_rgba(37,99,235,0.28)] sm:h-auto sm:overflow-visible">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-blue-100">今日班次</p>
            <h2 className="mt-1 text-2xl font-semibold">朝 9 晚 6</h2>
            <p className="mt-2 text-sm text-blue-100">09:00 - 18:00 · 当前需完成下班打卡</p>
          </div>
          <Link to="/admin/exceptions" className="hidden rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20 transition hover:bg-white/20 sm:inline-flex">
            异常待处理
          </Link>
        </div>
  
        <div className="mx-auto mt-5 h-[385px] w-[313px] rounded-[28px] bg-white px-5 py-6 text-center text-gray-900 shadow-lg sm:mx-0 sm:h-auto sm:w-auto">
          <p className="text-sm text-gray-500">当前可执行动作</p>
          <div className="mt-4 sm:hidden">
            <div className="relative mx-auto h-[268px] w-[252px]">
              <div className="pointer-events-none absolute left-1/2 top-[10px] z-0 h-[202px] w-[202px] -translate-x-1/2">
                <div className="absolute inset-[-14px] rounded-full bg-blue-300/18 animate-pulse" style={{ animationDuration: '2.8s' }}></div>
                <div className="absolute inset-[-6px] rounded-full border border-blue-200/45 animate-pulse" style={{ animationDuration: '2.8s' }}></div>
              </div>

              <button
                type="button"
                aria-label="下班打卡"
                className="absolute left-1/2 top-[10px] z-10 inline-flex h-[202px] w-[202px] -translate-x-1/2 items-center justify-center rounded-full bg-blue-600 px-6 text-white shadow-[0_22px_48px_rgba(37,99,235,0.35)] transition hover:bg-blue-700 active:scale-95"
              >
                <span>
                  <span className="block text-[18px] font-bold leading-8">下班打卡</span>
                  <span className="mt-2 block text-[14px] leading-5 text-blue-100">范围：总部园区 100m 内</span>
                </span>
              </button>
              <div className="absolute -bottom-[40px] left-6 flex flex-col items-center">
                <button className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-sm transition hover:bg-blue-100 active:scale-95">
                  <Briefcase className="h-4 w-4" />
                </button>
                <span className="mt-2 text-[11px] font-semibold text-slate-700">外勤打卡</span>
              </div>
              <div className="absolute -bottom-[40px] right-6 flex flex-col items-center">
                <button className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-sm transition hover:bg-blue-100 active:scale-95">
                  <Plane className="h-4 w-4" />
                </button>
                <span className="mt-2 text-[11px] font-semibold text-slate-700">出差打卡</span>
              </div>
            </div>
          </div>
          <div className="mt-4 hidden items-center justify-center gap-4 sm:flex">
            <button className="inline-flex h-[108px] w-[108px] items-center justify-center rounded-full bg-slate-100 text-slate-700 shadow-sm transition hover:bg-slate-200 active:scale-95">
              <span>
                <Briefcase className="mx-auto h-5 w-5" />
                <span className="mt-2 block text-sm font-semibold">外勤打卡</span>
              </span>
            </button>
            <button className="inline-flex h-36 w-36 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_18px_40px_rgba(37,99,235,0.32)] transition hover:bg-blue-700 active:scale-95">
              <span>
                <span className="block text-2xl font-bold">下班打卡</span>
                <span className="mt-2 block text-xs text-blue-100">范围：总部园区 100m 内</span>
              </span>
            </button>
            <button className="inline-flex h-[108px] w-[108px] items-center justify-center rounded-full bg-slate-100 text-slate-700 shadow-sm transition hover:bg-slate-200 active:scale-95">
              <span>
                <Plane className="mx-auto h-5 w-5" />
                <span className="mt-2 block text-sm font-semibold">出差打卡</span>
              </span>
            </button>
          </div>
          <p className="mt-2 hidden items-center text-xs text-gray-500 sm:inline-flex">
            <MapPin className="mr-1 h-3.5 w-3.5" />
            总部园区 · 已在打卡范围内
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 rounded-3xl bg-white/10 p-4">
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-xs text-blue-100">上班打卡</p>
            <p className="mt-2 text-lg font-semibold">08:55</p>
            <p className="text-xs text-blue-100">正常</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-xs text-blue-100">下班打卡</p>
            <p className="mt-2 text-lg font-semibold">待完成</p>
            <p className="text-xs text-blue-100">剩余 1 项</p>
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

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-blue-600">人事首页工作台</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">先看风险，再处理月报与异常</h2>
            <p className="mt-3 text-sm leading-6 text-gray-500">
              打卡卡片前置后，月报、异常汇总、待审批和规则提醒继续放在首页下方，减少人事在多个模块之间来回找入口。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-slate-50">
              <RefreshCw className="mr-2 h-4 w-4" />
              重新计算
            </button>
            <button className="inline-flex items-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
              <Download className="mr-2 h-4 w-4" />
              导出月报
            </button>
          </div>
        </div>
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
            {pendingItems.map((item) => (
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

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">导出字段配置</p>
              <h2 className="mt-2 text-xl font-semibold text-gray-900">把“支持按样本扩展”补成真正可见的配置面板</h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                源稿里明确提到导出表头最好支持自定义，所以这里把人事、门店、薪资三类模板和字段分组补成原型层，不再只是文案说明。
              </p>
            </div>
            <button className="inline-flex items-center rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-slate-50">
              <Settings className="mr-2 h-4 w-4" />
              保存字段模板
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {exportPresets.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActivePreset(item.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${activePreset === item.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {item.title}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
            {exportPresets.find((item) => item.id === activePreset)?.desc}
          </div>

          <div className="mt-5 space-y-4">
            {exportFieldGroups.map((group) => (
              <div key={group.title} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{group.title}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${group.tone}`}>{group.tag}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {group.items.map((item) => {
                    const selected = selectedColumns.includes(item);
                    return (
                      <span
                        key={item}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${selected ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200'}`}
                      >
                        {item}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">当前导出结构预览</h2>
                <p className="mt-1 text-sm text-gray-500">按当前模板排出字段顺序，便于确认最终表头。</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{selectedColumns.length} 个字段</span>
            </div>
            <div className="mt-4 space-y-3">
              {selectedColumns.map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-gray-900">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">字段来源说明</h2>
            </div>
            <div className="mt-4 space-y-3">
              {exportSourceCards.map((item) => (
                <div key={item.title} className={`rounded-2xl border p-4 ${item.tone}`}>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 opacity-90">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">月报筛选与结果</h2>
            <p className="mt-1 text-sm text-gray-500">继续保留月报导出能力，并补上外勤 / 出差 / 请假口径和自定义表头说明。</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">月份</label>
              <select className="block w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option>2024-05</option>
                <option>2024-04</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">组织/部门</label>
              <select className="block w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option>全部部门</option>
                <option>技术部</option>
                <option>运营部</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">状态</label>
              <select className="block w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option>在职</option>
                <option>离职</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-900">导出口径已补充</p>
              <p className="mt-1 text-sm leading-6 text-blue-800">
                外勤、出差、请假、补卡回写结果会一起进入月报；上面的字段配置区可以继续按样本切换模板，不再只写一句“支持扩展”。
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-white px-3 py-1 text-blue-700">默认列：出勤 / 迟到 / 缺卡</span>
              <span className="rounded-full bg-white px-3 py-1 text-blue-700">新增列：外勤 / 出差 / 请假</span>
              <span className="rounded-full bg-white px-3 py-1 text-blue-700">支持按模板切换表头</span>
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-3xl border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">姓名 / 工号</th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">部门</th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">出勤天数</th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">迟到次数 / 分钟</th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">早退次数 / 分钟</th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">缺卡次数</th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">旷工天数</th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">外勤 / 出差 / 请假</th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr className="transition hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">张三</div>
                      <div className="ml-2 text-sm text-gray-500">E001</div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">技术部</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">21.5</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">0 / 0</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">0 / 0</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">0</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">0</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">0 / 0 / 0.5 天</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-blue-600">日明细</td>
                </tr>
                <tr className="bg-red-50 transition hover:bg-red-100">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">李四</div>
                      <div className="ml-2 text-sm text-gray-500">E002</div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">运营部</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">20.5</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-red-600">2 / 45</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">0 / 0</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-red-600">1</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">0</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">0 / 0 / 0</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-blue-600">日明细</td>
                </tr>
                <tr className="bg-amber-50 transition hover:bg-amber-100">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">王五</div>
                      <div className="ml-2 text-sm text-gray-500">E003</div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">市场部</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">21</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">0 / 0</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">0 / 0</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-amber-600">1（待审批）</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">0</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-amber-600">1 / 2 / 0</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-blue-600">日明细</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <p className="text-sm text-gray-700">
              显示第 <span className="font-medium">1</span> 到 <span className="font-medium">3</span> 条，共 <span className="font-medium">124</span> 条结果
              <span className="ml-2 text-gray-500">· 当前已套用 {exportPresets.find((item) => item.id === activePreset)?.title}</span>
            </p>
            <div className="inline-flex rounded-full border border-gray-200 bg-slate-50 p-1 text-sm">
              <button className="rounded-full px-3 py-1 text-gray-500 transition hover:bg-white">上一页</button>
              <button className="rounded-full bg-white px-3 py-1 font-medium text-blue-600 shadow-sm">1</button>
              <button className="rounded-full px-3 py-1 text-gray-500 transition hover:bg-white">2</button>
              <button className="rounded-full px-3 py-1 text-gray-500 transition hover:bg-white">下一页</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
