import { AlertCircle, Download, RefreshCw } from 'lucide-react';

const tableRows = [
  {
    name: '张三',
    code: 'E001',
    department: '技术部',
    attendance: '21.5',
    late: '0 / 0',
    early: '0 / 0',
    missed: '0',
    absence: '0',
    tone: 'bg-white',
  },
  {
    name: '李四',
    code: 'E002',
    department: '运营部',
    attendance: '20.5',
    late: '2 / 45',
    early: '0 / 0',
    missed: '1',
    absence: '0',
    tone: 'bg-red-50',
  },
  {
    name: '王五',
    code: 'E003',
    department: '市场部',
    attendance: '21',
    late: '0 / 0',
    early: '0 / 0',
    missed: '1（待审批）',
    absence: '0',
    tone: 'bg-amber-50',
  },
];

export default function MonthlyPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">统计人数</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">124</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">全勤人数</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-600">89</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">异常扣薪人数</p>
          <p className="mt-3 text-3xl font-semibold text-red-600">12</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">待处理异常 / 审批</p>
          <p className="mt-3 text-3xl font-semibold text-amber-600">5 / 3</p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="grid gap-4 md:grid-cols-3 xl:flex xl:flex-wrap">
            <label className="block text-sm text-slate-600">
              <span className="mb-1 block font-medium">月份</span>
              <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white">
                <option>2026-04</option>
                <option>2026-03</option>
              </select>
            </label>
            <label className="block text-sm text-slate-600">
              <span className="mb-1 block font-medium">组织 / 部门</span>
              <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white">
                <option>全部部门</option>
                <option>技术部</option>
                <option>运营部</option>
              </select>
            </label>
            <label className="block text-sm text-slate-600">
              <span className="mb-1 block font-medium">人员状态</span>
              <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white">
                <option>在职</option>
                <option>离职</option>
              </select>
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
              <RefreshCw className="mr-2 h-4 w-4" />
              重新计算
            </button>
            <button className="inline-flex items-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
              <Download className="mr-2 h-4 w-4" />
              导出报表
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold">当前月报仍有待确认异常</p>
              <p className="mt-1 leading-6 text-amber-800">系统会把补卡、审批、外勤说明统一回写到月报中心；确认前建议先处理黄色和红色标记的员工。</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {['姓名 / 工号', '部门', '出勤天数', '迟到次数 / 分钟', '早退次数 / 分钟', '缺卡次数', '旷工天数', '操作'].map((head) => (
                  <th key={head} className="whitespace-nowrap px-5 py-4 text-left font-semibold">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableRows.map((row) => (
                <tr key={row.code} className={row.tone}>
                  <td className="whitespace-nowrap px-5 py-4">
                    <div className="font-semibold text-slate-900">{row.name}</div>
                    <div className="text-slate-500">{row.code}</div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">{row.department}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-900">{row.attendance}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">{row.late}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">{row.early}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">{row.missed}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">{row.absence}</td>
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-blue-700">日明细</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>显示第 1 到 3 条，共 124 条结果</p>
          <div className="flex gap-2">
            <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 transition hover:bg-slate-100">上一页</button>
            <button className="rounded-xl bg-blue-50 px-3 py-2 font-semibold text-blue-700">1</button>
            <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 transition hover:bg-slate-100">2</button>
            <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 transition hover:bg-slate-100">下一页</button>
          </div>
        </div>
      </section>
    </div>
  );
}
