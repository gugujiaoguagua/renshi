import { useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import MobileModalShell from '../../components/mobile/MobileModalShell';
import { employeeExceptionInsights } from '../../data/attendanceInsights';


type ExceptionTabKey = keyof typeof employeeExceptionInsights.tabs;

type ActionDetail = {
  title: string;
  action: string;
  description: string;
};

function buildActionDescription(title: string, action: string) {
  if (action.includes('提交')) {
    return `${title} 的补充说明已进入提交流程，后续会流转到直属主管审批，并继续回写异常中心和月报。`;
  }

  if (action.includes('催办')) {
    return `${title} 当前仍停留在审批中状态，系统会继续按第三阶段催办节奏推动主管处理。`;
  }

  if (action.includes('进度')) {
    return `${title} 目前停留在主管审批环节，审批完成前不会直接进入最终导出口径。`;
  }

  if (action.includes('规则')) {
    return `${title} 当前按“有效打卡 / 审批结果 / 月报回写”规则联动判定，若仍有争议可继续到规则中心查看详细口径。`;
  }

  return `${title} 的处理结果已经同步到异常中心和月度确认页，本条会继续保留在最近 30 天记录里方便复核。`;
}

export default function EmployeeExceptions() {
  const [activeTab, setActiveTab] = useState<ExceptionTabKey>('pending');
  const [selectedAction, setSelectedAction] = useState<ActionDetail | null>(null);
  const [actionMessage, setActionMessage] = useState('');

  const tabEntries = useMemo(() => Object.entries(employeeExceptionInsights.tabs) as Array<[ExceptionTabKey, (typeof employeeExceptionInsights.tabs)[ExceptionTabKey]]>, []);
  const currentGroup = employeeExceptionInsights.tabs[activeTab];

  const handleAction = (record: (typeof currentGroup.records)[number], actionLabel: string) => {
    const description = buildActionDescription(record.title, actionLabel);
    setSelectedAction({ title: record.title, action: actionLabel, description });

    if (actionLabel.includes('提交')) {
      setActionMessage(`${record.title} 已提交，后续将进入主管审批并继续回写异常中心 / 月报。`);
      setActiveTab('processing');
      return;
    }

    if (actionLabel.includes('催办')) {
      setActionMessage(`${record.title} 已进入催办队列，系统会继续在主管工作台和审批中心提醒。`);
      return;
    }

    setActionMessage(`${actionLabel} 已打开，可继续查看 ${record.title} 的处理说明。`);
  };

  return (
    <>
      {selectedAction ? (
        <MobileModalShell
          icon={<AlertCircle className="h-5 w-5" />}
          eyebrow="异常动作反馈"
          title={selectedAction.action}
          description={selectedAction.title}
          onClose={() => setSelectedAction(null)}
          panelClassName="max-w-lg"
        >
          <div className="rounded-[28px] border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
            {selectedAction.description}
          </div>
        </MobileModalShell>
      ) : null}


      <header className="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
        <h1 className="text-center text-lg font-semibold text-gray-900">异常中心</h1>

        <div className="mt-3 flex overflow-x-auto whitespace-nowrap border-b border-gray-100 hide-scrollbar">
          {tabEntries.map(([key, group]) => {
            const isActive = activeTab === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={clsx('relative px-3 pb-2 text-sm font-medium transition', isActive ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700')}
              >
                {group.label} ({group.records.length})
                {key === 'review' && group.records.length > 0 ? <span className="absolute right-1 top-0 h-1.5 w-1.5 rounded-full bg-purple-500"></span> : null}
              </button>
            );
          })}
        </div>
      </header>

      <main className="space-y-4 p-4">
        {actionMessage ? (
          <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900 shadow-sm">
            <p className="font-semibold">当前处理结果</p>
            <p className="mt-2 leading-6">{actionMessage}</p>
          </section>
        ) : null}

        {currentGroup.records.length > 0 ? (
          currentGroup.records.map((item) => (
            <div key={`${activeTab}-${item.title}`} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
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
                  action.to ? (
                    <Link
                      key={action.label}
                      to={action.to}
                      className={clsx('flex-1 text-center rounded-lg py-2 text-sm font-medium transition', action.className)}
                    >
                      {action.label}
                    </Link>
                  ) : (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => handleAction(item, action.label)}
                      className={clsx('flex-1 rounded-lg py-2 text-sm font-medium transition', action.className)}
                    >
                      {action.label}
                    </button>
                  )
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400 shadow-sm">
            当前标签下暂无记录
          </div>
        )}

        <p className="mt-6 text-center text-xs text-gray-400">仅展示当前员工样板最近 10 个工作日记录</p>
      </main>
    </>
  );
}
