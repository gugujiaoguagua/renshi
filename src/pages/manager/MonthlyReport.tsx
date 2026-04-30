import { useMemo, useState } from 'react';
import { ArrowRight, CheckSquare, Download, FileText, RefreshCw, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import MobileModalShell from '../../components/mobile/MobileModalShell';
import { adminDashboardInsights, managerMonthlyInsights } from '../../data/attendanceInsights';
import { downloadCsv } from '../../utils/downloadCsv';

type EmploymentStatus = '在职' | '离职';
type MonthlyRow = (typeof adminDashboardInsights.rows)[number];

const closeLoopSteps = [
  {
    title: '先补异常',
    desc: '缺卡、补卡和地点异常处理完成后，团队月报会实时刷新。',
  },
  {
    title: '再看员工确认',
    desc: '次月员工确认结果会继续同步到主管视角，避免只在人事侧可见。',
  },
  {
    title: '最后留痕导出',
    desc: '主管补充说明与人工复核结果会写入日志，方便月底回看。',
  },
];

const managerExportColumns = [
  '姓名',
  '工号',
  '中心',
  '一级部门',
  '二级部门',
  '三级部门',
  '四级部门',
  '职务',
  '入职时间',
  '离职时间',
  '应出勤天数(天)',
  '计薪天数',
  '实际出勤天数(天)',
  '缺卡次数(次)',
  '出差(天)',
  '事假(天)',
  '病假(天)',
] as const;

function getExportValue(row: MonthlyRow, column: (typeof managerExportColumns)[number]) {
  switch (column) {
    case '姓名':
      return row.name;
    case '工号':
      return row.employeeId;
    case '中心':
      return row.orgCenter ?? '--';
    case '一级部门':
      return row.firstDept ?? row.center ?? '--';
    case '二级部门':
      return row.secondDept ?? '--';
    case '三级部门':
      return row.thirdDept ?? '--';
    case '四级部门':
      return row.fourthDept ?? '--';
    case '职务':
      return row.role ?? '--';
    case '入职时间':
      return row.onboardDate ?? '--';
    case '离职时间':
      return row.offboardDate || '--';
    case '应出勤天数(天)':
      return row.expectedAttendance ?? 0;
    case '计薪天数':
      return row.paidDays ?? 0;
    case '实际出勤天数(天)':
      return row.actualAttendance ?? 0;
    case '缺卡次数(次)':
      return row.missingCount ?? 0;
    case '出差(天)':
      return row.tripDays ?? 0;
    case '事假(天)':
      return row.personalLeaveDays ?? 0;
    case '病假(天)':
      return row.sickLeaveDays ?? 0;
    default:
      return '';
  }
}

export default function ManagerMonthlyReport() {
  const managerDepartment = managerMonthlyInsights.scopes[0] ?? '';

  const managerRows = useMemo(
    () => adminDashboardInsights.rows.filter((row) => row.department === managerDepartment),
    [managerDepartment],
  );


  const availableMonths = useMemo(
    () => Array.from(new Set(managerRows.map((row) => row.month))).sort().reverse(),
    [managerRows],
  );
  const departmentOptions = useMemo(
    () => (managerDepartment ? [managerDepartment] : []),
    [managerDepartment],
  );

  const [monthFilter, setMonthFilter] = useState(availableMonths[0] ?? '2026-04');
  const [departmentFilter, setDepartmentFilter] = useState(managerDepartment || '');
  const [statusFilter, setStatusFilter] = useState<EmploymentStatus>('在职');
  const [nameKeyword, setNameKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState<MonthlyRow | null>(null);
  const [actionMessage, setActionMessage] = useState('');

  const keyword = nameKeyword.trim().toLowerCase();

  const filteredRows = useMemo(() => {
    return managerRows.filter((row) => {
      const matchMonth = row.month === monthFilter;
      const matchDepartment = !departmentFilter || row.department === departmentFilter;
      const matchStatus = row.employmentStatus === statusFilter;
      const matchName = !keyword || row.name.toLowerCase().includes(keyword) || row.employeeId.toLowerCase().includes(keyword);
      return matchMonth && matchDepartment && matchStatus && matchName;
    });
  }, [departmentFilter, keyword, managerRows, monthFilter, statusFilter]);

  const referenceRows = useMemo(() => {
    return adminDashboardInsights.rows
      .filter((row) => row.month === monthFilter)
      .filter((row) => row.employmentStatus === statusFilter)
      .filter((row) => !keyword || row.name.toLowerCase().includes(keyword) || row.employeeId.toLowerCase().includes(keyword))
      .slice(0, 5)
      .map((row) => ({
        ...row,
        department: managerDepartment || row.department,
        secondDept: managerDepartment || row.secondDept,
      }));
  }, [keyword, managerDepartment, monthFilter, statusFilter]);

  const effectiveRows = filteredRows.length > 0 ? filteredRows : referenceRows;

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(effectiveRows.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentRows = effectiveRows.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);


  const summaryCards = useMemo(() => {
    const perfectCount = filteredRows.filter((row) => row.missingCount === 0 && row.absentDays === 0).length;
    const riskyCount = filteredRows.filter((row) => row.missingCount > 0 || row.absentDays > 0).length;
    const pendingCount = filteredRows.filter((row) => row.approvalStatus.includes('审批中') || row.approvalStatus.includes('复核')).length;

    return [
      { label: '统计人数', value: `${filteredRows.length}`, tone: 'text-slate-900' },
      { label: '全勤人数', value: `${perfectCount}`, tone: 'text-emerald-600' },
      { label: '异常人数', value: `${riskyCount}`, tone: 'text-red-600' },
      { label: '待处理异常/审批', value: `${riskyCount}/${pendingCount}`, tone: 'text-amber-600' },
    ];
  }, [filteredRows]);

  const links = [
    { title: '去补卡审批', desc: '审批通过后，团队月报会同步更新。', to: '/manager/approval' },
    { title: '去看团队异常', desc: '先把高风险异常闭环，再确认月报。', to: '/manager/team-exceptions' },
    { title: '去补排班', desc: '待确认班次会直接影响团队月报口径。', to: '/manager/schedule' },
  ];

  const handleRecalculate = () => {
    const keywordText = nameKeyword.trim() ? ` / 人名关键词：${nameKeyword.trim()}` : '';
    setActionMessage(`已按 ${monthFilter} / ${departmentFilter} / ${statusFilter}${keywordText} 重新计算，共得到 ${effectiveRows.length} 条月报结果。`);
  };

  const handleExport = () => {
    downloadCsv(
      `主管团队月报-${monthFilter}.csv`,
      [...managerExportColumns],
      effectiveRows.map((row) => managerExportColumns.map((column) => getExportValue(row, column))),
    );
    setActionMessage(`已导出 ${effectiveRows.length} 条团队月报记录（主管只读视图）。`);
  };


  return (
    <div className="space-y-6">
      {selectedRow ? (
        <MobileModalShell
          icon={<FileText className="h-5 w-5" />}
          eyebrow="月报明细（只读）"
          title={`${selectedRow.name} · ${selectedRow.employeeId}`}
          description="主管端仅查看，不支持编辑。"
          onClose={() => setSelectedRow(null)}
          panelClassName="max-w-2xl"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">基础信息</p>
              <p className="mt-2 leading-6">组织：{selectedRow.orgCenter} / {selectedRow.secondDept}</p>
              <p className="leading-6">职务：{selectedRow.role}</p>
              <p className="leading-6">状态：{selectedRow.employmentStatus}</p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
              <p className="font-semibold">月报摘要</p>
              <p className="mt-2 leading-6">应出勤：{selectedRow.expectedAttendance} 天</p>
              <p className="leading-6">实际出勤：{selectedRow.actualAttendance} 天</p>
              <p className="leading-6">缺卡：{selectedRow.missingCount} 次</p>
            </div>
          </div>
        </MobileModalShell>
      ) : null}

      <section className="rounded-[32px] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 text-white shadow-[0_20px_50px_rgba(59,130,246,0.22)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-blue-100">主管团队月报</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">月报筛选与结果</h1>

          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm lg:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">月报筛选与结果</h2>
          </div>


          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">月份</label>
              <select
                value={monthFilter}
                onChange={(event) => {
                  setMonthFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {availableMonths.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">组织/部门</label>
              <select
                value={departmentFilter}
                onChange={(event) => {
                  setDepartmentFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {departmentOptions.map((department) => (

                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">状态</label>
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as EmploymentStatus);
                  setCurrentPage(1);
                }}
                className="block w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="在职">在职</option>
                <option value="离职">离职</option>
              </select>
            </div>
          </div>
        </div>

        {actionMessage ? (
          <div className="mt-4 rounded-3xl border border-blue-100 bg-blue-50 p-4 shadow-sm">
            <p className="text-sm font-semibold text-blue-900">操作已完成</p>
            <p className="mt-2 text-sm leading-6 text-blue-800">{actionMessage}</p>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleRecalculate}
            className="inline-flex items-center rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-slate-50"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            重新计算
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Download className="mr-2 h-4 w-4" />
            导出月报
          </button>
          <div className="min-w-[220px] flex-1 sm:max-w-xs">
            <input
              type="text"
              value={nameKeyword}
              onChange={(event) => {
                setNameKeyword(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="搜索人名（模糊匹配）"
              className="block w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-3xl border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-50">
                <tr>
                  {managerExportColumns.map((column) => (
                    <th
                      key={column}
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {currentRows.map((row, index) => (
                  <tr key={`${row.month}-${row.employeeId}-${index}`} className={row.rowTone}>
                    {managerExportColumns.map((column) => {
                      if (column === '姓名') {
                        return (
                          <td key={column} className="whitespace-nowrap px-4 py-4">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm font-semibold text-slate-900">{getExportValue(row, column)}</span>
                              <button
                                type="button"
                                onClick={() => setSelectedRow(row)}
                                className="text-xs font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
                              >
                                日明细
                              </button>
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td key={column} className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                          {getExportValue(row, column)}
                        </td>
                      );
                    })}
                  </tr>
                ))}

              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <p className="text-sm text-gray-700">
              显示第 <span className="font-medium">{effectiveRows.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}</span> 到 <span className="font-medium">{Math.min(safeCurrentPage * pageSize, effectiveRows.length)}</span> 条，共 <span className="font-medium">{effectiveRows.length}</span> 条结果

            </p>
            <div className="inline-flex rounded-full border border-gray-200 bg-slate-50 p-1 text-sm">
              <button
                type="button"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="rounded-full px-3 py-1 text-gray-500 transition enabled:hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                上一页
              </button>
              {Array.from({ length: totalPages }, (_, pageIndex) => pageIndex + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`rounded-full px-3 py-1 transition ${safeCurrentPage === page ? 'bg-white font-medium text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-white'}`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                disabled={safeCurrentPage === totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                className="rounded-full px-3 py-1 text-gray-500 transition enabled:hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className={`mt-4 text-3xl font-semibold ${item.tone}`}>{item.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900">
            <Users className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">确认与回写节奏</h2>
          </div>
          <div className="mt-4 space-y-3">
            {closeLoopSteps.map((item) => (
              <div key={item.title} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900">
            <CheckSquare className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold">关联动作</h2>
          </div>
          <div className="mt-4 space-y-3">
            {links.map((item) => (
              <Link key={item.title} to={item.to} className="group block rounded-2xl bg-slate-50 p-4 transition hover:bg-blue-50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{item.desc}</p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 text-blue-600 transition group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
