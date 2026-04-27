import { useMemo, useState } from 'react';
import { AlertCircle, ArrowRight, CheckSquare, Clock, Download, Filter, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { downloadCsv } from '../../utils/downloadCsv';

const summaryCards = [
  { label: '待处理异常', value: '12', tone: 'text-red-600' },
  { label: '待审批补卡', value: '3', tone: 'text-amber-600' },
  { label: '已超时未处理', value: '2', tone: 'text-rose-600' },
  { label: '今日已闭环', value: '8', tone: 'text-emerald-600' },
];

const initialExceptionRows = [
  {
    employee: '李四',
    code: 'E002',
    department: '运营部',
    type: '迟到 + 缺卡',
    status: '待复核',
    risk: '高',
    detail: '本月累计 2 次迟到、1 次缺卡，已影响月报结果，建议今天处理。',
    tone: 'border-red-100 bg-red-50',
  },
  {
    employee: '王五',
    code: 'E003',
    department: '市场部',
    type: '补卡审批中',
    status: '主管处理中',
    risk: '中',
    detail: '员工已提交下班缺卡说明，需要人事确认审批是否回写成功。',
    tone: 'border-amber-100 bg-amber-50',
  },
  {
    employee: '赵六',
    code: 'E026',
    department: '直营二店',
    type: '未排班风险',
    status: '待修正',
    risk: '中',
    detail: '本周仍有 1 天未排班，若不修正将继续产生异常并影响组织口径。',
    tone: 'border-purple-100 bg-purple-50',
  },
];

const actions = [
  { title: '先处理高风险异常', desc: '优先看已影响计薪和月报结果的记录。', to: '/admin/exceptions' },
  { title: '核对规则口径', desc: '确认异常是否由新规则生效导致。', to: '/admin/rules' },
  { title: '查看操作留痕', desc: '若结果有争议，可回溯日志中心。', to: '/admin/logs' },
];

const filterOptions = ['全部', '高风险', '待审批', '待修正', '已闭环'] as const;
type FilterType = (typeof filterOptions)[number];

export default function AdminExceptions() {
  const [rows, setRows] = useState(initialExceptionRows);
  const [keyword, setKeyword] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('全部');
  const [processingRow, setProcessingRow] = useState<(typeof initialExceptionRows)[number] | null>(null);
  const [actionMessage, setActionMessage] = useState('');

  const filteredRows = useMemo(() => {
    return rows.filter((item) => {
      const matchKeyword = !keyword || [item.employee, item.code, item.department, item.type, item.detail].some((part) => part.includes(keyword));
      const matchFilter =
        activeFilter === '全部' ||
        (activeFilter === '高风险' && item.risk === '高') ||
        (activeFilter === '待审批' && item.status.includes('审批')) ||
        (activeFilter === '待修正' && item.status.includes('修正')) ||
        (activeFilter === '已闭环' && item.status === '已闭环');
      return matchKeyword && matchFilter;
    });
  }, [activeFilter, keyword, rows]);

  const handleExport = () => {
    downloadCsv(
      '异常清单.csv',
      ['姓名', '工号', '部门', '异常类型', '状态', '风险', '详情'],
      filteredRows.map((item) => [item.employee, item.code, item.department, item.type, item.status, item.risk, item.detail]),
    );
    setActionMessage(`已导出 ${filteredRows.length} 条异常记录。`);
  };

  const handleProcess = (row: (typeof initialExceptionRows)[number]) => {
    setProcessingRow(row);
    setRows((current) =>
      current.map((item) =>
        item.code === row.code
          ? {
              ...item,
              status: '已闭环',
              risk: '低',
              detail: `${item.detail} 当前已进入人事复核完成状态，并同步回写异常中心 / 月报。`,
              tone: 'border-emerald-100 bg-emerald-50',
            }
          : item,
      ),
    );
    setActionMessage(`${row.employee} 的异常已进入处理完成状态，列表和导出口径已同步刷新。`);
  };

  return (
    <div className="space-y-6">
      {processingRow ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.24)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-blue-600">异常处理结果</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">{processingRow.employee} · {processingRow.type}</h2>
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
                <p className="font-semibold text-slate-900">原始详情</p>
                <p className="mt-2 leading-6">{processingRow.detail}</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
                <p className="font-semibold">处理后状态</p>
                <p className="mt-2 leading-6">已闭环，并已同步更新异常中心与月报口径。</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <section className="rounded-[32px] bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 p-6 text-white shadow-[0_20px_50px_rgba(244,63,94,0.22)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-red-50">人事异常中心</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">先清掉高风险异常，再回看月报</h1>
            <p className="mt-3 text-sm leading-6 text-red-50/90">
              这页承接工作台中的异常汇总入口，把迟到、缺卡、补卡审批和未排班风险放到一个统一处理面板里。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setActiveFilter('高风险')}
              className="inline-flex items-center rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
            >
              <Filter className="mr-2 h-4 w-4" />
              批量筛选
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
            >
              <Download className="mr-2 h-4 w-4" />
              导出异常清单
            </button>
          </div>
        </div>
      </section>

      {actionMessage ? (
        <section className="rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900 shadow-sm">
          <p className="font-semibold">当前操作</p>
          <p className="mt-2 leading-6">{actionMessage}</p>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <div key={item.label} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">{item.label}</p>
            <p className={`mt-4 text-3xl font-semibold ${item.tone}`}>{item.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="w-full bg-transparent text-sm outline-none"
              placeholder="搜索姓名 / 工号 / 部门 / 异常类型"
            />
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            {filterOptions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setActiveFilter(item)}
                className={`rounded-full px-4 py-2 font-medium transition ${activeFilter === item ? 'bg-gray-900 text-white' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {[
          { title: '待确认回写', value: '2 条', desc: '主管已处理，但人事侧还需确认异常和月报是否一致。', tone: 'border-blue-100 bg-blue-50' },
          { title: '待补日志', value: '1 条', desc: '人工修正已完成，但还缺最终修正原因和导出留痕。', tone: 'border-amber-100 bg-amber-50' },
          { title: '待核规则来源', value: '1 条', desc: '异常可能由新规则生效触发，建议先核规则版本再决定是否修正。', tone: 'border-red-100 bg-red-50' },
        ].map((item) => (
          <div key={item.title} className={`rounded-3xl border p-4 shadow-sm ${item.tone}`}>
            <p className="text-sm text-gray-500">{item.title}</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{item.value}</p>
            <p className="mt-2 text-sm leading-6 text-gray-600">{item.desc}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          {filteredRows.length > 0 ? (
            filteredRows.map((item) => (
              <div key={`${item.employee}-${item.type}`} className={`rounded-3xl border p-5 shadow-sm ${item.tone}`}>
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-gray-900">{item.employee}</h2>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600">{item.code}</span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600">{item.type}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{item.department} · 风险等级 {item.risk}</p>
                    <p className="mt-3 text-sm leading-6 text-gray-700">{item.detail}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-gray-700">{item.status}</span>
                    <button
                      type="button"
                      onClick={() => handleProcess(item)}
                      className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition hover:-translate-y-0.5 hover:shadow-sm"
                    >
                      立即处理
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400 shadow-sm">
              当前筛选条件下暂无异常记录
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">处理建议</h3>
            </div>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <div className="rounded-2xl bg-slate-50 p-4">先处理已经影响计薪的异常，再看等待主管审批或待排班修正的记录。</div>
              <div className="rounded-2xl bg-slate-50 p-4">如果异常来自规则变更，建议同步检查日志中心和规则版本说明。</div>
              <div className="rounded-2xl bg-slate-50 p-4">对同部门连续异常，优先检查是否存在排班或组织口径问题。</div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">关联动作</h3>
            </div>
            <div className="mt-4 space-y-3">
              {actions.map((item) => (
                <Link key={item.title} to={item.to} className="group block rounded-2xl bg-slate-50 p-4 transition hover:bg-blue-50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-gray-500">{item.desc}</p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 text-blue-600 transition group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <CheckSquare className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <h3 className="text-sm font-semibold text-emerald-900">已接入首页闭环</h3>
                <p className="mt-1 text-sm leading-6 text-emerald-800">
                  现在可以从人事工作台的“异常中心”入口直接进入这页，再继续跳转到规则和日志相关页面。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
