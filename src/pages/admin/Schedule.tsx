import { useState } from 'react';
import { AlertTriangle, ArrowRight, Calendar, CheckSquare, Download, Users } from 'lucide-react';
import { downloadCsv } from '../../utils/downloadCsv';

const summaryCards = [
  { label: '本周未排班', value: '4 人', detail: '2 人在直营二店，2 人在技术二组，优先补齐再发布。', tone: 'text-red-600' },
  { label: '待发布班表', value: '2 份', detail: '已编辑但尚未下发，员工端仍看不到最终班次。', tone: 'text-amber-600' },
  { label: '已发布组织', value: '18 个', detail: '其中 16 个已同步完成，2 个等待员工端刷新。', tone: 'text-emerald-600' },
  { label: '排班冲突', value: '1 条', detail: '存在 1 组班次重叠，处理后需重算异常结果。', tone: 'text-purple-600' },
];

const scheduleRows = [
  {
    department: '直营二店',
    owner: '刘主管',
    status: '存在未排班',
    stage: '草稿未完成',
    detail: '周五有 2 名店员尚未排班，若不补齐会继续触发异常中心预警。',
    impact: '会影响明日员工端打卡判定，并继续放大异常中心红点。',
    nextStep: '先补齐缺口，再统一发布门店班表。',
    writeback: '发布成功后，员工端、异常中心和月报口径都会自动刷新。',
    tone: 'border-red-100 bg-red-50',
  },
  {
    department: '技术二组',
    owner: '张建国',
    status: '待发布',
    stage: '已编辑未下发',
    detail: '本周排班已编辑但尚未发布，员工端还看不到最终班次。',
    impact: '若延迟发布，主管侧会持续收到未排班提醒。',
    nextStep: '核对组织归属后执行发布。',
    writeback: '发布后会回写首页摘要和异常规则判定。',
    tone: 'border-amber-100 bg-amber-50',
  },
  {
    department: '工厂朝 8 晚 5',
    owner: '王班长',
    status: '已发布',
    stage: '同步完成',
    detail: '本周班次已同步，暂无排班缺口，但需关注规则生效后的异常变化。',
    impact: '当前可作为模板复用给同班制工厂班组。',
    nextStep: '继续观察规则变更后的重算结果。',
    writeback: '已回写员工端班次和异常中心。',
    tone: 'border-emerald-100 bg-emerald-50',
  },
];

const publishFlow = [
  { title: '补齐草稿', desc: '先解决未排班、组织归属和班次重叠问题。', tone: 'bg-slate-50 text-slate-700 border-slate-200' },
  { title: '执行发布', desc: '发布后把班次下发到员工端和主管端视图。', tone: 'bg-blue-50 text-blue-700 border-blue-100' },
  { title: '结果回写', desc: '异常中心、月报和工作台摘要同步刷新。', tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
];

const publishResults = [
  { org: '直营二店', status: '待发布', detail: '仍缺 2 名店员班次，暂未开始下发。', tone: 'bg-amber-50 text-amber-900 border-amber-100' },
  { org: '技术二组', status: '待确认归属', detail: '2 名新成员组织映射未确认，发布前需先校验。', tone: 'bg-purple-50 text-purple-900 border-purple-100' },
  { org: '工厂朝 8 晚 5', status: '同步成功', detail: '员工端已可见，异常中心已按新班次判定。', tone: 'bg-emerald-50 text-emerald-900 border-emerald-100' },
];

const riskNotes = [
  { title: '门店时效风险', desc: '直营二店若 18:00 前仍未发布班表，员工端明天会继续显示异常风险。', tone: 'bg-amber-50 text-amber-900', icon: AlertTriangle },
  { title: '模板可复用', desc: '工厂朝 8 晚 5已同步完成，可作为排班模板参考。', tone: 'bg-slate-50 text-slate-700', icon: CheckSquare },
  { title: '重算提醒', desc: '规则调整后，已发布但未重算的组织仍需复核异常结果。', tone: 'bg-blue-50 text-blue-900', icon: Calendar },
];

const weeks = ['2026-04 第4周', '2026-05 第1周', '2026-05 第2周'];

export default function AdminSchedule() {
  const [weekIndex, setWeekIndex] = useState(0);
  const [processingRow, setProcessingRow] = useState<(typeof scheduleRows)[number] | null>(null);
  const [actionMessage, setActionMessage] = useState('');

  const handleSwitchWeek = () => {
    setWeekIndex((current) => (current + 1) % weeks.length);
    setActionMessage(`已切换到 ${weeks[(weekIndex + 1) % weeks.length]}，当前排班清单已同步刷新。`);
  };

  const handleExport = () => {
    downloadCsv(
      '组织排班清单.csv',
      ['组织', '负责人', '状态', '阶段', '详情', '下一步'],
      scheduleRows.map((item) => [item.department, item.owner, item.status, item.stage, item.detail, item.nextStep]),
    );
    setActionMessage(`已导出 ${scheduleRows.length} 条组织排班记录。`);
  };

  return (
    <div className="space-y-6">
      {processingRow ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.24)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-blue-600">排班处理面板</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">{processingRow.department}</h2>
                <p className="mt-1 text-sm text-slate-500">负责人：{processingRow.owner}</p>
              </div>
              <button
                type="button"
                onClick={() => setProcessingRow(null)}
                className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-500 transition hover:bg-slate-50"
              >
                关闭
              </button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">当前详情</p>
                <p className="mt-2 leading-6">{processingRow.detail}</p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                <p className="font-semibold">下一步建议</p>
                <p className="mt-2 leading-6">{processingRow.nextStep}</p>
                <p className="mt-2 leading-6">发布后回写：{processingRow.writeback}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <section className="rounded-[32px] bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-6 text-white shadow-[0_20px_50px_rgba(79,70,229,0.2)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-blue-100">人事排班管理</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">先补齐未排班，再发布班表</h1>
            <p className="mt-3 text-sm leading-6 text-blue-50/90">
              这页承接工作台里的排班入口，用于查看组织级未排班、发布状态和潜在冲突，避免继续生成异常。
            </p>
            <p className="mt-3 text-sm font-medium text-blue-100">当前周次：{weeks[weekIndex]}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSwitchWeek}
              className="inline-flex items-center rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
            >
              <Calendar className="mr-2 h-4 w-4" />
              切换周次
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
            >
              <Download className="mr-2 h-4 w-4" />
              导出班表
            </button>
          </div>
        </div>
      </section>

      {actionMessage ? (
        <section className="rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900 shadow-sm">
          <p className="font-semibold">操作已完成</p>
          <p className="mt-2 leading-6">{actionMessage}</p>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <div key={item.label} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">{item.label}</p>
            <p className={`mt-4 text-3xl font-semibold ${item.tone}`}>{item.value}</p>
            <p className="mt-2 text-sm leading-6 text-gray-500">{item.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          {scheduleRows.map((item) => (
            <div key={`${item.department}-${item.status}`} className={`rounded-3xl border p-5 shadow-sm ${item.tone}`}>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">{item.department}</h2>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">{item.status}</span>
                    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-gray-600">{item.stage}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">负责人：{item.owner}</p>
                  <p className="mt-3 text-sm leading-6 text-gray-700">{item.detail}</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl bg-white/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">影响范围</p>
                      <p className="mt-2 text-sm leading-6 text-gray-700">{item.impact}</p>
                    </div>
                    <div className="rounded-2xl bg-white/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">下一步</p>
                      <p className="mt-2 text-sm leading-6 text-gray-700">{item.nextStep}</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl bg-white/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">发布后回写</p>
                    <p className="mt-2 text-sm leading-6 text-gray-700">{item.writeback}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 xl:flex-col xl:items-end">
                  <button
                    type="button"
                    onClick={() => setProcessingRow(item)}
                    className="inline-flex items-center rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    进入处理
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">排班关注点</h3>
            </div>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              {publishFlow.map((item) => (
                <div key={item.title} className={`rounded-2xl border p-4 ${item.tone}`}>
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-2 leading-6 opacity-90">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-emerald-600" />
              <h3 className="text-lg font-semibold text-gray-900">发布结果反馈</h3>
            </div>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              {publishResults.map((item) => (
                <div key={`${item.org}-${item.status}`} className={`rounded-2xl border p-4 ${item.tone}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{item.org}</p>
                    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium">{item.status}</span>
                  </div>
                  <p className="mt-2 leading-6 opacity-90">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-semibold text-gray-900">当前风险</h3>
            </div>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              {riskNotes.map((item) => (
                <div key={item.title} className={`flex items-start gap-3 rounded-2xl p-4 ${item.tone}`}>
                  <item.icon className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 leading-6 opacity-90">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
