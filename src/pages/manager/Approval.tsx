import { useState } from 'react';
import { clsx } from 'clsx';

type TabKey = 'pending' | 'processed' | 'mine';

type ApprovalItem = {
  applicant: string;
  title: string;
  submittedAt: string;
  type: string;
  typeTone: string;
  detailRows: { label: string; value: string; valueTone?: string }[];
};

const tabs: { key: TabKey; label: string; count: number }[] = [
  { key: 'pending', label: '待审批', count: 3 },
  { key: 'processed', label: '已处理', count: 8 },
  { key: 'mine', label: '我发起的', count: 2 },
];

const approvalData: Record<TabKey, ApprovalItem[]> = {
  pending: [
    {
      applicant: '张',
      title: '张三的补卡申请',
      submittedAt: '今天 09:15 提交',
      type: '迟到补卡',
      typeTone: 'bg-orange-100 text-orange-800',
      detailRows: [
        { label: '补卡日期', value: '2026-04-23（今日）' },
        { label: '应打时间', value: '09:00 上班打卡' },
        { label: '实际打卡', value: '09:12（迟到 12 分）', valueTone: 'text-red-600' },
        { label: '补卡原因', value: '路上堵车，已提前在群内报备。' },
      ],
    },
    {
      applicant: '李',
      title: '李四的外勤说明',
      submittedAt: '昨天 18:30 提交',
      type: '外勤确认',
      typeTone: 'bg-blue-100 text-blue-800',
      detailRows: [
        { label: '补卡日期', value: '2026-04-22（周三）' },
        { label: '业务场景', value: '工地验收现场' },
        { label: '定位结果', value: '已识别外勤地点', valueTone: 'text-blue-600' },
        { label: '补卡原因', value: '需补充外勤结束时间，纳入正常出勤。' },
      ],
    },
  ],
  processed: [
    {
      applicant: '王',
      title: '王五的补卡申请',
      submittedAt: '2026-04-21 18:10 已处理',
      type: '缺卡补卡',
      typeTone: 'bg-emerald-100 text-emerald-800',
      detailRows: [
        { label: '处理结果', value: '已通过并回写日报' },
        { label: '处理人', value: '张主管' },
        { label: '原始状态', value: '下班缺卡' },
        { label: '最终状态', value: '正常出勤', valueTone: 'text-emerald-600' },
      ],
    },
  ],
  mine: [
    {
      applicant: '我',
      title: '团队排班调整申请',
      submittedAt: '2026-04-20 14:30 提交',
      type: '排班变更',
      typeTone: 'bg-slate-100 text-slate-700',
      detailRows: [
        { label: '申请对象', value: '直营二店' },
        { label: '影响日期', value: '2026-04-24 至 2026-04-26' },
        { label: '当前状态', value: '人事确认中', valueTone: 'text-amber-600' },
        { label: '备注', value: '节假日临时加人，需要同步门店班次模板。' },
      ],
    },
  ],
};

export default function ApprovalPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const items = approvalData[activeTab];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">待审批</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">3 条</p>
          <p className="mt-2 text-sm text-slate-500">主管与人事使用同一审批数据，不再拆分独立流程。</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">平均处理时长</p>
          <p className="mt-3 text-3xl font-semibold text-blue-600">5.2 h</p>
          <p className="mt-2 text-sm text-slate-500">重要状态直接展示在卡片顶部，避免反复点进详情。</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">本周通过率</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-600">84%</p>
          <p className="mt-2 text-sm text-slate-500">审批结果会自动更新异常状态、日报和月报。</p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">审批中心</h3>
            <p className="mt-1 text-sm text-slate-500">手机端强调快速同意 / 驳回，电脑端强调信息完整与对比判断。</p>
          </div>
          <button className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">
            批量处理
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'rounded-full px-4 py-2 text-sm font-medium transition',
                activeTab === tab.key ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500 hover:text-slate-700',
              )}
            >
              {tab.label}
              <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs text-slate-500 shadow-sm">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {items.map((item) => (
            <div key={`${activeTab}-${item.title}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-base font-semibold text-blue-600 shadow-sm">
                    {item.applicant}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{item.title}</h4>
                    <p className="mt-1 text-sm text-slate-500">{item.submittedAt}</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.typeTone}`}>{item.type}</span>
              </div>

              <div className="mt-4 space-y-3 rounded-2xl bg-white p-4">
                {item.detailRows.map((row) => (
                  <div key={`${item.title}-${row.label}`} className="flex flex-col gap-1 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0 md:flex-row md:items-start">
                    <span className="w-24 shrink-0 text-sm text-slate-400">{row.label}</span>
                    <span className={clsx('text-sm leading-6 text-slate-700', row.valueTone)}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-3">
                <button className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100">
                  驳回
                </button>
                <button className="flex-1 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                  同意
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
