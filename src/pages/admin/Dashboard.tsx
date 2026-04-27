import { useMemo, useState } from 'react';

import { AlertCircle, ArrowRight, Briefcase, Calendar, Download, FileText, MapPin, Plane, RefreshCw, Settings, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { downloadCsv } from '../../utils/downloadCsv';

type ExportPreset = 'hr' | 'store' | 'finance';
type EmploymentStatus = '在职' | '离职';
type PunchAction = 'checkout' | 'outing' | 'trip';

type MonthlyRow = {
  name: string;
  employeeId: string;
  department: string;
  month: string;
  employmentStatus: EmploymentStatus;
  shift: string;
  attendance: number;
  lateCount: number;
  lateMinutes: number;
  earlyCount: number;
  earlyMinutes: number;
  missingCount: number;
  absentDays: number;
  outingDays: number;
  tripDays: number;
  leaveDays: number;
  approvalStatus: string;
  writebackSource: string;
  detail: string[];
  rowTone: string;
};

const PRESET_STORAGE_KEY = 'attendance-admin-export-preset';

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

const monthlyRows: MonthlyRow[] = [
  {
    name: '张三',
    employeeId: 'E001',
    department: '技术部',
    month: '2026-05',
    employmentStatus: '在职',
    shift: '朝 9 晚 6',
    attendance: 21.5,
    lateCount: 0,
    lateMinutes: 0,
    earlyCount: 0,
    earlyMinutes: 0,
    missingCount: 0,
    absentDays: 0,
    outingDays: 0,
    tripDays: 0,
    leaveDays: 0.5,
    approvalStatus: '请假已审批',
    writebackSource: '异常中心 / 员工确认',
    detail: ['4 月 12 日请假半天已审批通过', '本月无迟到缺卡，计薪口径正常', '月报已同步到人事标准模板'],
    rowTone: 'bg-white transition hover:bg-gray-50',
  },
  {
    name: '李四',
    employeeId: 'E002',
    department: '运营部',
    month: '2026-05',
    employmentStatus: '在职',
    shift: '朝 9 晚 6',
    attendance: 20.5,
    lateCount: 2,
    lateMinutes: 45,
    earlyCount: 0,
    earlyMinutes: 0,
    missingCount: 1,
    absentDays: 0,
    outingDays: 0,
    tripDays: 0,
    leaveDays: 0,
    approvalStatus: '补卡待审批',
    writebackSource: '主管审批 / 异常中心',
    detail: ['1 条缺卡仍待主管补卡审批', '2 次迟到合计 45 分钟，需继续复核扣薪口径', '月报仍保留异常标记，未最终锁定'],
    rowTone: 'bg-red-50 transition hover:bg-red-100',
  },
  {
    name: '王五',
    employeeId: 'E003',
    department: '市场部',
    month: '2026-05',
    employmentStatus: '在职',
    shift: '销售外勤班',
    attendance: 21,
    lateCount: 0,
    lateMinutes: 0,
    earlyCount: 0,
    earlyMinutes: 0,
    missingCount: 1,
    absentDays: 0,
    outingDays: 1,
    tripDays: 2,
    leaveDays: 0,
    approvalStatus: '出差已回写 / 缺卡待确认',
    writebackSource: '出差单 / 记录页 / 月报',
    detail: ['2 天出差已按出差口径计入月报', '1 条外勤记录已回写，但仍有 1 次缺卡待确认', '本行适合用于检查场景回写是否一致'],
    rowTone: 'bg-amber-50 transition hover:bg-amber-100',
  },
  {
    name: '赵六',
    employeeId: 'E004',
    department: '技术部',
    month: '2026-05',
    employmentStatus: '在职',
    shift: '朝 9 晚 6',
    attendance: 20,
    lateCount: 1,
    lateMinutes: 10,
    earlyCount: 0,
    earlyMinutes: 0,
    missingCount: 0,
    absentDays: 0,
    outingDays: 0,
    tripDays: 0,
    leaveDays: 1,
    approvalStatus: '请假已回写',
    writebackSource: '请假单 / 月度确认',
    detail: ['请假 1 天已写回员工确认页', '1 次迟到已保留原始时间供薪资复核', '本月暂无缺卡风险'],
    rowTone: 'bg-white transition hover:bg-gray-50',
  },
  {
    name: '陈晨',
    employeeId: 'E005',
    department: '运营部',
    month: '2026-04',
    employmentStatus: '在职',
    shift: '门店晚班',
    attendance: 22,
    lateCount: 0,
    lateMinutes: 0,
    earlyCount: 0,
    earlyMinutes: 0,
    missingCount: 0,
    absentDays: 0,
    outingDays: 1,
    tripDays: 0,
    leaveDays: 0,
    approvalStatus: '外勤已回写',
    writebackSource: '外勤单 / 日志中心',
    detail: ['上月 1 次外勤已与日志中心对齐', '排班与异常口径一致，可直接作为导出样本', '本行用于验证月份切换后的分页结果'],
    rowTone: 'bg-white transition hover:bg-gray-50',
  },
  {
    name: '孙敏',
    employeeId: 'E006',
    department: '直营门店',
    month: '2026-05',
    employmentStatus: '离职',
    shift: '门店晚班',
    attendance: 9,
    lateCount: 1,
    lateMinutes: 20,
    earlyCount: 1,
    earlyMinutes: 15,
    missingCount: 0,
    absentDays: 0,
    outingDays: 0,
    tripDays: 0,
    leaveDays: 0,
    approvalStatus: '离职结算中',
    writebackSource: '薪资核算模板',
    detail: ['离职员工默认不在“在职”筛选里展示', '保留最后一个计薪月的异常记录便于财务复核', '可切换状态筛选查看该条记录'],
    rowTone: 'bg-slate-50 transition hover:bg-slate-100',
  },
];

const actionLabels: Record<PunchAction, string> = {
  checkout: '下班打卡',
  outing: '外勤打卡',
  trip: '出差打卡',
};

function getExportValue(row: MonthlyRow, column: string) {
  switch (column) {
    case '姓名':
      return row.name;
    case '工号':
      return row.employeeId;
    case '部门':
      return row.department;
    case '门店':
      return row.department.includes('门店') ? row.department : '--';
    case '岗位':
      return row.shift;
    case '班次':
      return row.shift;
    case '应出勤':
      return '22';
    case '实际出勤':
      return row.attendance;
    case '迟到分钟':
      return row.lateMinutes;
    case '早退分钟':
      return row.earlyMinutes;
    case '缺卡次数':
      return row.missingCount;
    case '旷工天数':
      return row.absentDays;
    case '计薪天数':
      return row.attendance - row.leaveDays;
    case '迟到扣款分钟':
      return row.lateMinutes;
    case '缺卡扣款':
      return row.missingCount > 0 ? '待复核' : '0';
    case '外勤天数':
      return row.outingDays;
    case '外勤场景':
      return row.outingDays > 0 ? '客户拜访 / 巡店' : '--';
    case '出差天数':
      return row.tripDays;
    case '出差地点':
      return row.tripDays > 0 ? '武汉 / 长沙' : '--';
    case '请假天数':
      return row.leaveDays;
    case '审批状态':
      return row.approvalStatus;
    case '审批结果':
      return row.approvalStatus;
    case '回写来源':
      return row.writebackSource;
    case '调班结果':
      return row.approvalStatus.includes('调班') ? row.approvalStatus : '--';
    case '未排班标记':
      return row.missingCount > 0 ? '存在风险' : '已补齐';
    case '异常结果':
      return row.missingCount > 0 || row.lateCount > 0 ? '需复核' : '正常';
    case '店长审批人':
      return row.department.includes('门店') ? '李主管' : '--';
    default:
      return '--';
  }
}

export default function AdminDashboard() {
  const [activePreset, setActivePreset] = useState<ExportPreset>(() => {
    if (typeof window === 'undefined') {
      return 'hr';
    }

    const storedPreset = window.localStorage.getItem(PRESET_STORAGE_KEY);
    return storedPreset === 'hr' || storedPreset === 'store' || storedPreset === 'finance' ? storedPreset : 'hr';
  });
  const [monthFilter, setMonthFilter] = useState('2026-05');
  const [departmentFilter, setDepartmentFilter] = useState('全部部门');
  const [statusFilter, setStatusFilter] = useState<EmploymentStatus>('在职');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionMessage, setActionMessage] = useState('');
  const [selectedRow, setSelectedRow] = useState<MonthlyRow | null>(null);
  const [workbenchHint, setWorkbenchHint] = useState('');

  const filteredRows = useMemo(() => {
    return monthlyRows.filter((row) => {
      const matchMonth = row.month === monthFilter;
      const matchDepartment = departmentFilter === '全部部门' || row.department === departmentFilter;
      const matchStatus = row.employmentStatus === statusFilter;
      return matchMonth && matchDepartment && matchStatus;
    });
  }, [departmentFilter, monthFilter, statusFilter]);

  const selectedColumns = exportColumnsByPreset[activePreset];
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / 3));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentRows = filteredRows.slice((safeCurrentPage - 1) * 3, safeCurrentPage * 3);


  const summaryCards = useMemo(() => {
    const perfectCount = filteredRows.filter((row) => row.lateCount === 0 && row.earlyCount === 0 && row.missingCount === 0 && row.absentDays === 0).length;
    const riskyCount = filteredRows.filter((row) => row.lateMinutes > 0 || row.missingCount > 0 || row.absentDays > 0).length;
    const pendingCount = filteredRows.filter((row) => row.approvalStatus.includes('待') || row.approvalStatus.includes('复核')).length;

    return [
      { label: '统计人数', value: `${filteredRows.length}`, tone: 'text-gray-900' },
      { label: '全勤人数', value: `${perfectCount}`, tone: 'text-emerald-600' },
      { label: '异常扣薪人数', value: `${riskyCount}`, tone: 'text-red-600', tag: riskyCount > 0 ? '需复核' : undefined },
      { label: '待处理异常 / 审批', value: `${riskyCount} / ${pendingCount}`, tone: 'text-amber-500' },
    ];
  }, [filteredRows]);

  const handleAdminPunch = (action: PunchAction) => {
    setWorkbenchHint(`当前处于人事视角，点击“${actionLabels[action]}”会优先引导到员工工作台处理本人动作；你也可以继续留在这里处理异常、月报和导出。`);
  };

  const handleRecalculate = () => {
    setActionMessage(`已按 ${monthFilter} / ${departmentFilter} / ${statusFilter} 重新计算，共得到 ${filteredRows.length} 条月报结果。`);
  };

  const handleExport = () => {
    downloadCsv(
      `月报导出-${activePreset}.csv`,
      selectedColumns,
      filteredRows.map((row) => selectedColumns.map((column) => getExportValue(row, column))),
    );
    setActionMessage(`已按“${exportPresets.find((item) => item.id === activePreset)?.title}”导出 ${filteredRows.length} 条月报记录。`);
  };

  const handleSavePreset = () => {
    window.localStorage.setItem(PRESET_STORAGE_KEY, activePreset);
    setActionMessage(`字段模板已保存为“${exportPresets.find((item) => item.id === activePreset)?.title}”，下次进入会默认沿用。`);
  };

  return (
    <div className="space-y-6">
      {selectedRow ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.24)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-blue-600">日明细预览</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">
                  {selectedRow.name} · {selectedRow.employeeId}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{selectedRow.department} · {selectedRow.month} · {selectedRow.shift}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRow(null)}
                className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-500 transition hover:bg-slate-50"
              >
                关闭
              </button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">月度摘要</p>
                <p className="mt-2 leading-6">出勤 {selectedRow.attendance} 天，迟到 {selectedRow.lateCount} 次 / {selectedRow.lateMinutes} 分钟，缺卡 {selectedRow.missingCount} 次。</p>
                <p className="mt-2 leading-6">外勤 {selectedRow.outingDays} 天，出差 {selectedRow.tripDays} 天，请假 {selectedRow.leaveDays} 天。</p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                <p className="font-semibold">审批与回写</p>
                <p className="mt-2 leading-6">当前状态：{selectedRow.approvalStatus}</p>
                <p className="mt-2 leading-6">回写来源：{selectedRow.writebackSource}</p>
              </div>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {selectedRow.detail.map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 p-4 leading-6">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <section className="relative h-[683px] overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 p-5 text-white shadow-[0_20px_40px_rgba(37,99,235,0.28)] sm:h-auto sm:overflow-visible">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-blue-100">今日班次</p>
            <h2 className="mt-1 text-2xl font-semibold">朝 9 晚 6</h2>
            <p className="mt-2 text-sm text-blue-100">09:00 - 18:00 · 当前为人事工作视角，优先处理异常和月报。</p>
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
                <div className="absolute inset-[-14px] animate-pulse rounded-full bg-blue-300/18" style={{ animationDuration: '2.8s' }}></div>
                <div className="absolute inset-[-6px] animate-pulse rounded-full border border-blue-200/45" style={{ animationDuration: '2.8s' }}></div>
              </div>

              <button
                type="button"
                aria-label="下班打卡"
                onClick={() => handleAdminPunch('checkout')}
                className="absolute left-1/2 top-[10px] z-10 inline-flex h-[202px] w-[202px] -translate-x-1/2 items-center justify-center rounded-full bg-blue-600 px-6 text-white shadow-[0_22px_48px_rgba(37,99,235,0.35)] transition hover:bg-blue-700 active:scale-95"
              >
                <span>
                  <span className="block text-[18px] font-bold leading-8">下班打卡</span>
                  <span className="mt-2 block text-[14px] leading-5 text-blue-100">范围：总部园区 100m 内</span>
                </span>
              </button>
              <div className="absolute -bottom-[40px] left-6 flex flex-col items-center">
                <button type="button" onClick={() => handleAdminPunch('outing')} className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-sm transition hover:bg-blue-100 active:scale-95">
                  <Briefcase className="h-4 w-4" />
                </button>
                <span className="mt-2 text-[11px] font-semibold text-slate-700">外勤打卡</span>
              </div>
              <div className="absolute -bottom-[40px] right-6 flex flex-col items-center">
                <button type="button" onClick={() => handleAdminPunch('trip')} className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-sm transition hover:bg-blue-100 active:scale-95">
                  <Plane className="h-4 w-4" />
                </button>
                <span className="mt-2 text-[11px] font-semibold text-slate-700">出差打卡</span>
              </div>
            </div>
          </div>
          <div className="mt-4 hidden items-center justify-center gap-4 sm:flex">
            <button type="button" onClick={() => handleAdminPunch('outing')} className="inline-flex h-[108px] w-[108px] items-center justify-center rounded-full bg-slate-100 text-slate-700 shadow-sm transition hover:bg-slate-200 active:scale-95">
              <span>
                <Briefcase className="mx-auto h-5 w-5" />
                <span className="mt-2 block text-sm font-semibold">外勤打卡</span>
              </span>
            </button>
            <button type="button" onClick={() => handleAdminPunch('checkout')} className="inline-flex h-36 w-36 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_18px_40px_rgba(37,99,235,0.32)] transition hover:bg-blue-700 active:scale-95">
              <span>
                <span className="block text-2xl font-bold">下班打卡</span>
                <span className="mt-2 block text-xs text-blue-100">范围：总部园区 100m 内</span>
              </span>
            </button>
            <button type="button" onClick={() => handleAdminPunch('trip')} className="inline-flex h-[108px] w-[108px] items-center justify-center rounded-full bg-slate-100 text-slate-700 shadow-sm transition hover:bg-slate-200 active:scale-95">
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
            <p className="text-xs text-blue-100">工作台定位</p>
            <p className="mt-2 text-lg font-semibold">人事视角</p>
            <p className="text-xs text-blue-100">优先处理异常 / 月报 / 导出</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-xs text-blue-100">当前结果</p>
            <p className="mt-2 text-lg font-semibold">{filteredRows.length} 条</p>
            <p className="text-xs text-blue-100">已按当前筛选口径展示</p>
          </div>
        </div>
      </section>

      {workbenchHint ? (
        <section className="rounded-3xl border border-blue-100 bg-blue-50 p-4 shadow-sm">
          <p className="text-sm font-semibold text-blue-900">角色引导</p>
          <p className="mt-2 text-sm leading-6 text-blue-800">{workbenchHint}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link to="/employee/home" className="inline-flex items-center rounded-2xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
              切到员工工作台
            </Link>
            <button type="button" onClick={() => setWorkbenchHint('')} className="inline-flex items-center rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50">
              继续留在人事端
            </button>
          </div>
        </section>
      ) : null}

      {actionMessage ? (
        <section className="rounded-3xl border border-blue-100 bg-blue-50 p-4 shadow-sm">
          <p className="text-sm font-semibold text-blue-900">操作已完成</p>
          <p className="mt-2 text-sm leading-6 text-blue-800">{actionMessage}</p>
        </section>
      ) : null}

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
              打卡卡片继续保留在首页首屏，但交互会明确引导回正确角色；真正的人事高频动作继续放在下方，避免来回找入口。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleRecalculate} className="inline-flex items-center rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-slate-50">
              <RefreshCw className="mr-2 h-4 w-4" />
              重新计算
            </button>
            <button type="button" onClick={handleExport} className="inline-flex items-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
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
                源稿里明确提到导出表头最好支持自定义，所以这里继续保留人事、门店、薪资三类模板和字段分组，不再只是文案说明。
              </p>
            </div>
            <button type="button" onClick={handleSavePreset} className="inline-flex items-center rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-slate-50">
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
              <select value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)} className="block w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option value="2026-05">2026-05</option>
                <option value="2026-04">2026-04</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">组织/部门</label>
              <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)} className="block w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option value="全部部门">全部部门</option>
                <option value="技术部">技术部</option>
                <option value="运营部">运营部</option>
                <option value="市场部">市场部</option>
                <option value="直营门店">直营门店</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">状态</label>
              <select value={statusFilter} onChange={(event) => {
                setStatusFilter(event.target.value as EmploymentStatus);
                setCurrentPage(1);
              }} className="block w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">

                <option value="在职">在职</option>
                <option value="离职">离职</option>
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
                {currentRows.length > 0 ? (
                  currentRows.map((row) => (
                    <tr key={row.employeeId} className={row.rowTone}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{row.name}</div>
                          <div className="ml-2 text-sm text-gray-500">{row.employeeId}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{row.department}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{row.attendance}</td>
                      <td className={`whitespace-nowrap px-6 py-4 text-sm ${row.lateMinutes > 0 ? 'font-medium text-red-600' : 'text-gray-500'}`}>
                        {row.lateCount} / {row.lateMinutes}
                      </td>
                      <td className={`whitespace-nowrap px-6 py-4 text-sm ${row.earlyMinutes > 0 ? 'font-medium text-amber-600' : 'text-gray-500'}`}>
                        {row.earlyCount} / {row.earlyMinutes}
                      </td>
                      <td className={`whitespace-nowrap px-6 py-4 text-sm ${row.missingCount > 0 ? 'font-medium text-red-600' : 'text-gray-500'}`}>{row.missingCount}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{row.absentDays}</td>
                      <td className={`whitespace-nowrap px-6 py-4 text-sm ${row.tripDays > 0 || row.outingDays > 0 ? 'font-medium text-amber-600' : 'text-gray-500'}`}>
                        {row.outingDays} / {row.tripDays} / {row.leaveDays} 天
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <button type="button" onClick={() => setSelectedRow(row)} className="text-blue-600 transition hover:text-blue-700 hover:underline">
                          日明细
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center text-sm text-gray-400">
                      当前筛选下暂无月报结果
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <p className="text-sm text-gray-700">
              显示第 <span className="font-medium">{filteredRows.length === 0 ? 0 : (safeCurrentPage - 1) * 3 + 1}</span> 到 <span className="font-medium">{Math.min(safeCurrentPage * 3, filteredRows.length)}</span> 条，共 <span className="font-medium">{filteredRows.length}</span> 条结果

              <span className="ml-2 text-gray-500">· 当前已套用 {exportPresets.find((item) => item.id === activePreset)?.title}</span>
            </p>
            <div className="inline-flex rounded-full border border-gray-200 bg-slate-50 p-1 text-sm">
              <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="rounded-full px-3 py-1 text-gray-500 transition enabled:hover:bg-white disabled:cursor-not-allowed disabled:opacity-50">
                上一页
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`rounded-full px-3 py-1 transition ${safeCurrentPage === page ? 'bg-white font-medium text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-white'}`}

                >
                  {page}
                </button>
              ))}
              <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="rounded-full px-3 py-1 text-gray-500 transition enabled:hover:bg-white disabled:cursor-not-allowed disabled:opacity-50">
                下一页
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
