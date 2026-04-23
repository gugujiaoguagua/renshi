import { useState } from 'react';
import { clsx } from 'clsx';
import { AlertCircle, CheckSquare, Clock } from 'lucide-react';

type TabKey = 'pending' | 'processing' | 'rejected' | 'done';

type ExceptionItem = {
  title: string;
  date: string;
  detail: string;
  status: string;
  badge: string;
  badgeTone: string;
  actionPrimary: string;
  actionSecondary?: string;
};

const tabs: { key: TabKey; label: string; count: number }[] = [
  { key: 'pending', label: '待处理', count: 2 },
  { key: 'processing', label: '审批中', count: 1 },
  { key: 'rejected', label: '已驳回', count: 1 },
  { key: 'done', label: '已完成', count: 3 },
];

const data: Record<TabKey, ExceptionItem[]> = {
  pending: [
    {
      title: '下班缺卡',
      date: '2026-04-22 周三',
      detail: '系统未检测到你的下班打卡记录，若不处理将影响月报结果。',
      status: '班次：总部标准班 09:00 - 18:00',
      badge: '逾期风险',
      badgeTone: 'bg-red-50 text-red-700',
      actionPrimary: '提交补卡',
      actionSecondary: '查看日记录',
    },
    {
      title: '外勤待确认',
      date: '2026-04-19 周日',
      detail: '外勤打卡地点已记录，但尚未补充业务说明，无法自动转为正常出勤。',
      status: '场景：客户家 / 工地现场',
      badge: '需要说明',
      badgeTone: 'bg-amber-50 text-amber-700',
      actionPrimary: '补充说明',
      actionSecondary: '查看详情',
    },
  ],
  processing: [
    {
      title: '迟到补卡申请',
      date: '2026-04-18 周五',
      detail: '你提交的说明已进入主管审批流程，系统会在审批后回写日报结果。',
      status: '当前处理人：张建国（主管）',
      badge: '主管审批中',
      badgeTone: 'bg-blue-50 text-blue-700',
      actionPrimary: '查看进度',
      actionSecondary: '撤销申请',
    },
  ],
  rejected: [
    {
      title: '缺卡补卡被驳回',
      date: '2026-04-11 周五',
      detail: '主管认为说明材料不充分，需补充现场凭证后重新提交。',
      status: '驳回原因：缺少业务现场佐证',
      badge: '需重新提交',
      badgeTone: 'bg-slate-100 text-slate-700',
      actionPrimary: '重新提交',
      actionSecondary: '查看原因',
    },
  ],
  done: [
    {
      title: '补卡已通过',
      date: '2026-04-05 周六',
      detail: '系统已将该日状态改为正常出勤，并同步更新月报。',
      status: '处理完成：2026-04-06 09:20',
      badge: '已回写',
      badgeTone: 'bg-emerald-50 text-emerald-700',
      actionPrimary: '查看结果',
    },
  ],
};

export default function ExceptionsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const currentItems = data[activeTab];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">待处理异常</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">2 条</p>
          <p className="mt-2 text-sm text-slate-500">异常要在一个地方集中处理，不再散落到多套页面里。</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">审批中</p>
          <p className="mt-3 text-3xl font-semibold text-blue-600">1 条</p>
          <p className="mt-2 text-sm text-slate-500">审批状态和处理人直接展示，避免频繁追问。</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">本月异常闭环率</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-600">86%</p>
          <p className="mt-2 text-sm text-slate-500">系统会把已通过结果自动回写到日报与月报。</p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <div className="hide-scrollbar flex gap-4 overflow-x-auto border-b border-slate-100 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={clsx(
                  'relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition',
                  activeTab === tab.key ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500 hover:text-slate-700',
                )}
              >
                {tab.label}
                <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs text-slate-500 shadow-sm">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-4">
            {currentItems.map((item) => (
              <div key={`${activeTab}-${item.title}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                      <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{item.date}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.badgeTone}`}>
                    {item.badge}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">{item.detail}</p>
                <p className="mt-3 text-sm text-slate-500">{item.status}</p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                    {item.actionPrimary}
                  </button>
                  {item.actionSecondary ? (
                    <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                      {item.actionSecondary}
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
            <h3 className="text-lg font-semibold text-slate-900">处理原则</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <p className="leading-6">先展示异常结果，再说明原因，最后给补卡、说明或查看进度等操作。</p>
              </div>
              <div className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                <p className="leading-6">所有操作都会回写到日报和月报，避免“补了卡但结果没变”的割裂感。</p>
              </div>
              <div className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                <CheckSquare className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                <p className="leading-6">主管和人事看到的是同一条数据，只是可操作权限不同，不是另一套审批系统。</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
            <h3 className="text-lg font-semibold text-slate-900">状态定义</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {[
                '待处理：员工还未补卡或补充说明',
                '审批中：已提交，等待主管 / 人事处理',
                '已驳回：说明不充分，需要重新提交',
                '已完成：结果已回写到日报和月报',
              ].map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
