import { useState } from 'react';
import { clsx } from 'clsx';

const exceptionTabs = {
  pending: {
    label: '待处理',
    records: [
      {
        title: '下班缺卡',
        date: '2024-05-19 周日',
        dotTone: 'bg-red-500',
        badge: '逾期扣薪风险',
        badgeTone: 'bg-red-50 text-red-700',
        lines: ['班次：周末班 · 09:00 - 18:00', '原因：系统未检测到您的下班打卡记录。', '处理时限：需在今晚 20:00 前补充说明，避免影响计薪。'],
        steps: ['补卡说明', '主管审批', '同步月报'],
        actions: [
          { label: '提交补卡', className: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
          { label: '查看规则', className: 'border border-gray-200 text-gray-600 hover:bg-gray-50' },
        ],
      },
    ],
  },
  processing: {
    label: '审批中',
    records: [
      {
        title: '迟到补卡申请',
        date: '2024-05-17 周五',
        dotTone: 'bg-yellow-400',
        badge: '主管审批中',
        badgeTone: 'bg-yellow-50 text-yellow-700',
        lines: ['说明：早上开会忘记打卡，已跟主管报备。', '当前处理人：张建国（主管）', '预计反馈：今天 18:00 前给出处理结果。'],
        steps: ['已提交', '审批中', '待回写'],
        actions: [
          { label: '查看进度', className: 'border border-gray-200 text-gray-600 hover:bg-gray-50' },
          { label: '撤销申请', className: 'border border-gray-200 text-gray-600 hover:bg-gray-50' },
        ],
      },
    ],
  },
  rejected: {
    label: '已驳回',
    records: [
      {
        title: '4 月 24 日外勤说明',
        date: '2024-04-24 周三',
        dotTone: 'bg-red-500',
        badge: '待补资料',
        badgeTone: 'bg-red-50 text-red-700',
        lines: ['驳回原因：未补充客户名称和现场地点说明。', '处理建议：补充业务说明后重新提交，不需要再新建一条异常。', '影响范围：当前不会计入有效外勤，月底前处理即可恢复月报口径。'],
        steps: ['补充业务说明', '重新提交', '重新进入审批'],
        actions: [
          { label: '补充说明后重提', className: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
          { label: '查看驳回原因', className: 'border border-gray-200 text-gray-600 hover:bg-gray-50' },
        ],
      },
    ],
  },
  done: {
    label: '已完成',
    records: [
      {
        title: '4 月 14 日出差申请',
        date: '2024-04-14 周日',
        dotTone: 'bg-emerald-500',
        badge: '已回写月报',
        badgeTone: 'bg-emerald-50 text-emerald-700',
        lines: ['结果：主管已通过出差申请，打卡结果按出差口径处理。', '同步状态：日报、异常中心和月报结果已一致。', '留痕说明：本条会继续保留在最近 30 天记录里，方便月底复核。'],
        steps: ['审批通过', '结果回写', '月底可复核'],
        actions: [
          { label: '查看结果明细', className: 'border border-gray-200 text-gray-600 hover:bg-gray-50' },
        ],
      },
    ],
  },
} as const;

type ExceptionTabKey = keyof typeof exceptionTabs;

export default function EmployeeExceptions() {
  const [activeTab, setActiveTab] = useState<ExceptionTabKey>('pending');
  const currentGroup = exceptionTabs[activeTab];

  return (
    <>
      <header className="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
        <h1 className="text-center text-lg font-semibold text-gray-900">异常中心</h1>

        <div className="mt-3 flex overflow-x-auto whitespace-nowrap border-b border-gray-100 hide-scrollbar">
          {Object.entries(exceptionTabs).map(([key, group]) => {
            const typedKey = key as ExceptionTabKey;
            const isActive = activeTab === typedKey;

            return (
              <button
                key={key}
                onClick={() => setActiveTab(typedKey)}
                className={clsx(
                  'relative px-3 pb-2 text-sm font-medium transition',
                  isActive ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700',
                )}
              >
                {group.label} ({group.records.length})
                {typedKey === 'rejected' && group.records.length > 0 ? <span className="absolute right-1 top-0 h-1.5 w-1.5 rounded-full bg-red-500"></span> : null}
              </button>
            );
          })}
        </div>
      </header>

      <main className="space-y-4 p-4">
        {currentGroup.records.map((item) => (
          <div key={`${activeTab}-${item.title}`} className="animate-in slide-in-from-bottom-2 fade-in rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-start justify-between border-b border-gray-50 pb-3">
              <div>
                <div className="flex items-center">
                  <span className={clsx('mr-2 h-2 w-2 rounded-full', item.dotTone)}></span>
                  <h2 className="text-base font-medium text-gray-900">{item.title}</h2>
                </div>
                <p className="mt-1 text-sm text-gray-500">{item.date}</p>
              </div>
              <span className={clsx('inline-flex items-center rounded px-2 py-0.5 text-xs font-medium', item.badgeTone)}>{item.badge}</span>
            </div>

            <div className="mb-4 space-y-1 text-sm text-gray-600">
              {item.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {item.steps.map((step) => (
                <span key={step} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {step}
                </span>
              ))}
            </div>

            <div className="flex space-x-3">
              {item.actions.map((action) => (
                <button key={action.label} className={clsx('flex-1 rounded-lg py-2 text-sm font-medium transition', action.className)}>
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-900">异常处理节奏</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
            <div className="rounded-lg bg-white p-3">当天先提异常说明，避免月底集中补解释。</div>
            <div className="rounded-lg bg-white p-3">主管审批结果会自动同步到异常中心和月报。</div>
            <div className="rounded-lg bg-white p-3">若被驳回，直接补资料后重新提交，不需要重复建单。</div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">仅展示最近 30 天的异常记录</p>
      </main>
    </>
  );
}

