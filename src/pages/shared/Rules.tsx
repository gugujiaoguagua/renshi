import { useMemo, useState } from 'react';
import { AlertCircle, CheckSquare, Clock, Download, FileText, RefreshCw } from 'lucide-react';

import MobileModalShell from '../../components/mobile/MobileModalShell';
import { adminDashboardInsights } from '../../data/attendanceInsights';
import { downloadCsv } from '../../utils/downloadCsv';

type ExportPreset = 'hr' | 'store' | 'finance';
type EmploymentStatus = '在职' | '离职';
type MonthlyRow = (typeof adminDashboardInsights.rows)[number];
type EditableMonthlyRow = MonthlyRow & { __key: string };
type EditDraft = Record<string, string>;
type InlineEditingCell = { rowKey: string; column: string } | null;
type RuleVersionDraft = {
  version: string;
  status: string;
  scope: string;
  owner: string;
  highlight: string;
};

const HR_TEXT_COLUMNS = new Set([
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
]);

function numberOrZero(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : 0;
}

function applyHrColumnEdit(row: EditableMonthlyRow, column: string, raw: string): EditableMonthlyRow {
  if (HR_TEXT_COLUMNS.has(column)) {
    const text = raw;
    switch (column) {
      case '姓名':
        return { ...row, name: text };
      case '工号':
        return { ...row, employeeId: text };
      case '中心':
        return { ...row, orgCenter: text };
      case '一级部门':
        return { ...row, firstDept: text, center: text };
      case '二级部门':
        return { ...row, secondDept: text, department: text };
      case '三级部门':
        return { ...row, thirdDept: text };
      case '四级部门':
        return { ...row, fourthDept: text };
      case '职务':
        return { ...row, role: text };
      case '入职时间':
        return { ...row, onboardDate: text };
      case '离职时间': {
        const offboardDate = text;
        return { ...row, offboardDate, employmentStatus: offboardDate ? '离职' : '在职' };
      }
      default:
        return row;
    }
  }

  const value = numberOrZero(raw);
  switch (column) {
    case '应出勤天数(天)':
      return { ...row, expectedAttendance: value };
    case '计薪天数':
      return { ...row, paidDays: value };
    case '实际出勤天数(天)':
      return { ...row, actualAttendance: value, attendance: value };
    case '法定节假日出勤天数（天）':
      return { ...row, legalHolidayAttendanceDays: value };
    case '迟到/早退扣款金额':
      return { ...row, penaltyAmount: value };
    case '上下班缺卡次数':
      return { ...row, missingInOutCount: value };
    case '缺卡次数(次)':
      return { ...row, missingCount: value };
    case '迟到早退次数（30分钟以内）':
      return { ...row, lateEarlyWithin30: value };
    case '迟到/早退30分钟以上次数':
      return { ...row, lateEarlyAbove30: value };
    case '迟到次数（30分钟以内）':
      return { ...row, lateWithin30: value };
    case '迟到次数（30分钟以上）':
      return { ...row, lateAbove30: value };
    case '早退次数（30分钟以内）':
      return { ...row, earlyWithin30: value };
    case '早退次数（30分钟以上）':
      return { ...row, earlyAbove30: value };
    case '出差(天)':
      return { ...row, tripDays: value, tripDaysSummary: value };
    case '入离职缺勤-非法定（天）':
      return { ...row, entryLeaveAbsentDays: value };
    case '入离职缺勤-法定（天）':
      return { ...row, legalEntryLeaveAbsentDays: value };
    case '旷工（天）':
      return { ...row, absenteeismDays: value, absentDays: value };
    case '事假(天)':
      return { ...row, personalLeaveDays: value };
    case '病假(天)':
      return { ...row, sickLeaveDays: value };
    case '婚假(天)':
      return { ...row, marriageLeaveDays: value };
    case '产假(天)':
      return { ...row, maternityLeaveDays: value };
    case '陪产假(天)':
      return { ...row, paternityLeaveDays: value };
    case '丧假(天)':
      return { ...row, bereavementLeaveDays: value };
    case '产检假(天)':
      return { ...row, prenatalCheckLeaveDays: value };
    case '年假(天)':
      return { ...row, annualLeaveDays: value };
    case '调休(天)':
      return { ...row, compensatoryLeaveDays: value };
    case '其它(天)':
      return { ...row, otherLeaveDays: value };
    default:
      return row;
  }
}

function rebuildRowDerivedFields(row: EditableMonthlyRow): EditableMonthlyRow {
  const lateCount = (row.lateWithin30 ?? 0) + (row.lateAbove30 ?? 0);
  const earlyCount = (row.earlyWithin30 ?? 0) + (row.earlyAbove30 ?? 0);
  const leaveDays = (row.personalLeaveDays ?? 0) + (row.sickLeaveDays ?? 0);
  const employmentStatus: EmploymentStatus = row.offboardDate ? '离职' : '在职';
  const rowTone = row.missingCount > 0 ? 'bg-red-50 transition hover:bg-red-100' : 'bg-white transition hover:bg-gray-50';

  return {
    ...row,
    lateCount,
    earlyCount,
    leaveDays,
    employmentStatus,
    attendance: row.actualAttendance ?? row.attendance,
    absentDays: row.absenteeismDays ?? row.absentDays,
    rowTone,
    writebackSource: row.missingCount > 0 ? '异常中心 / 主管审批' : '日报汇总 / 月报回写',
    approvalStatus: employmentStatus === '离职' ? '已离职' : row.approvalStatus,
  };
}

const initialRuleVersions = [
  {
    version: 'V3.4 门店轮班组',
    status: '今日 18:00 生效',
    scope: '直营门店',
    owner: '李人事',
    highlight: '新增外勤免审批岗位、自选班次回写说明。',
    tone: 'border-amber-100 bg-amber-50 text-amber-900',
  },
  {
    version: 'V3.3 当前线上版',
    status: '已生效',
    scope: '总部 / 工厂',
    owner: '系统默认',
    highlight: '统一缺卡、请假、出差优先级和月报回写口径。',
    tone: 'border-slate-200 bg-slate-50 text-slate-900',
  },
];

const changeDiffs = [
  '变更前：门店外勤默认走审批；变更后：指定岗位可直接外勤打卡，但仍保留地点和说明。',
  '变更前：未排班只能月底人工解释；变更后：允许员工先提自选班次，再进入主管审批。',
  '变更前：审批结果只影响当前页面；变更后：审批通过会同步回写异常中心和月报结果。',
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
  // 严格对齐《考勤报表格式(1).md》- 考勤月报（37 列）
  hr: [
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
    '法定节假日出勤天数（天）',
    '迟到/早退扣款金额',
    '上下班缺卡次数',
    '缺卡次数(次)',
    '迟到早退次数（30分钟以内）',
    '迟到/早退30分钟以上次数',
    '迟到次数（30分钟以内）',
    '迟到次数（30分钟以上）',
    '早退次数（30分钟以内）',
    '早退次数（30分钟以上）',
    '出差(天)',
    '入离职缺勤-非法定（天）',
    '入离职缺勤-法定（天）',
    '旷工（天）',
    '事假(天)',
    '病假(天)',
    '婚假(天)',
    '产假(天)',
    '陪产假(天)',
    '丧假(天)',
    '产检假(天)',
    '年假(天)',
    '调休(天)',
    '其它(天)',
  ],
  store: ['姓名', '门店', '岗位', '班次', '未排班标记', '外勤场景', '出差地点', '调班结果', '缺卡次数', '店长审批人'],
  finance: ['姓名', '工号', '部门', '计薪天数', '迟到扣款分钟', '缺卡扣款', '请假天数', '出差天数', '异常结果', '审批状态'],
};

function getExportValue(row: MonthlyRow, column: string) {
  switch (column) {
    // === 月报模板（HR）===
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
      return row.fourthDept ?? '';
    case '职务':
      return row.role;
    case '入职时间':
      return row.onboardDate ?? '--';
    case '离职时间':
      return row.offboardDate ?? '';
    case '应出勤天数(天)':
      return row.expectedAttendance;
    case '计薪天数':
      return row.paidDays;
    case '实际出勤天数(天)':
      return row.actualAttendance ?? row.attendance;
    case '法定节假日出勤天数（天）':
      return row.legalHolidayAttendanceDays ?? 0;
    case '迟到/早退扣款金额':
      return row.penaltyAmount;
    case '上下班缺卡次数':
      return row.missingInOutCount ?? row.missingCount;
    case '缺卡次数(次)':
      return row.missingCount;
    case '迟到早退次数（30分钟以内）':
      return row.lateEarlyWithin30;
    case '迟到/早退30分钟以上次数':
      return row.lateEarlyAbove30;
    case '迟到次数（30分钟以内）':
      return row.lateWithin30;
    case '迟到次数（30分钟以上）':
      return row.lateAbove30;
    case '早退次数（30分钟以内）':
      return row.earlyWithin30;
    case '早退次数（30分钟以上）':
      return row.earlyAbove30;
    case '出差(天)':
      return row.tripDays;
    case '入离职缺勤-非法定（天）':
      return row.entryLeaveAbsentDays;
    case '入离职缺勤-法定（天）':
      return row.legalEntryLeaveAbsentDays;
    case '旷工（天）':
      return row.absenteeismDays ?? row.absentDays;
    case '事假(天)':
      return row.personalLeaveDays;
    case '病假(天)':
      return row.sickLeaveDays;
    case '婚假(天)':
      return row.marriageLeaveDays ?? 0;
    case '产假(天)':
      return row.maternityLeaveDays ?? 0;
    case '陪产假(天)':
      return row.paternityLeaveDays ?? 0;
    case '丧假(天)':
      return row.bereavementLeaveDays ?? 0;
    case '产检假(天)':
      return row.prenatalCheckLeaveDays ?? 0;
    case '年假(天)':
      return row.annualLeaveDays ?? 0;
    case '调休(天)':
      return row.compensatoryLeaveDays ?? 0;
    case '其它(天)':
      return row.otherLeaveDays ?? 0;

    // === 旧模板（Store / Finance / 演示字段）===
    case '部门':
      return row.department;
    case '门店':
      return row.department.includes('店') ? row.department : '--';
    case '岗位':
      return row.role;
    case '班次':
      return row.shift;
    case '应出勤':
      return row.expectedAttendance;
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
    case '迟到扣款分钟':
      return row.lateMinutes;
    case '缺卡扣款':
      return row.missingCount > 0 ? '待复核' : '0';
    case '外勤天数':
      return row.outingDays;
    case '外勤场景':
      return row.outingDays > 0 ? '总部试点外勤样板' : '--';
    case '出差天数':
      return row.tripDaysSummary ?? row.tripDays;
    case '出差地点':
      return (row.tripDaysSummary ?? row.tripDays) > 0 ? row.center : '--';
    case '请假天数':
      return row.leaveDays;
    case '审批状态':
      return row.approvalStatus;
    case '审批结果':
      return row.approvalStatus;
    case '回写来源':
      return row.writebackSource;
    case '调班结果':
      return row.approvalStatus.includes('调') ? row.approvalStatus : '--';
    case '未排班标记':
      return row.missingCount > 0 ? '存在风险' : '已补齐';
    case '异常结果':
      return row.missingCount > 0 || row.lateCount > 0 || row.earlyCount > 0 ? '需复核' : '正常';
    case '店长审批人':
      return row.department.includes('店') ? '主管样板' : '--';
    default:
      return '--';
  }
}

export default function RulesPage() {
  const [ruleVersions, setRuleVersions] = useState(initialRuleVersions);
  const [ruleActionMessage, setRuleActionMessage] = useState('');
  const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null);
  const [ruleVersionDraft, setRuleVersionDraft] = useState<RuleVersionDraft>({
    version: '',
    status: '',
    scope: '',
    owner: '',
    highlight: '',
  });

  const [editableRows, setEditableRows] = useState<EditableMonthlyRow[]>(() =>
    adminDashboardInsights.rows.map((row, index) => ({
      ...row,
      __key: `${row.month}-${row.employeeId}-${index}`,
    })),
  );

  const availableMonths = Array.from(new Set(editableRows.map((row) => row.month))).sort().reverse();
  const departmentOptions = useMemo(() => Array.from(new Set(editableRows.map((row) => row.department))).sort(), [editableRows]);

  const [activePreset] = useState<ExportPreset>('hr');
  const [monthFilter, setMonthFilter] = useState(availableMonths[0] ?? '2026-04');
  const [departmentFilter, setDepartmentFilter] = useState('全部部门');
  const [statusFilter, setStatusFilter] = useState<EmploymentStatus>('在职');
  const [nameKeyword, setNameKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpPageInput, setJumpPageInput] = useState('');
  const [selectedRow, setSelectedRow] = useState<EditableMonthlyRow | null>(null);
  const [editingRow, setEditingRow] = useState<EditableMonthlyRow | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft>({});
  const [inlineEditingCell, setInlineEditingCell] = useState<InlineEditingCell>(null);
  const [inlineValue, setInlineValue] = useState('');
  const [monthlyActionMessage, setMonthlyActionMessage] = useState('');

  const filteredRows = useMemo(() => {
    const keyword = nameKeyword.trim().toLowerCase();

    return editableRows.filter((row) => {
      const matchMonth = row.month === monthFilter;
      const matchDepartment = departmentFilter === '全部部门' || row.department === departmentFilter;
      const matchStatus = row.employmentStatus === statusFilter;
      const matchName = !keyword || row.name.toLowerCase().includes(keyword) || row.employeeId.toLowerCase().includes(keyword);
      return matchMonth && matchDepartment && matchStatus && matchName;
    });
  }, [departmentFilter, editableRows, monthFilter, nameKeyword, statusFilter]);

  const selectedColumns = exportColumnsByPreset[activePreset];
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentRows = filteredRows.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  const openEditor = (row: EditableMonthlyRow) => {
    setEditingRow(row);
    const nextDraft: EditDraft = {};
    selectedColumns.forEach((column) => {
      const value = getExportValue(row, column);
      nextDraft[column] = value === undefined || value === null ? '' : String(value);
    });
    setEditDraft(nextDraft);
  };

  const closeEditor = () => {
    setEditingRow(null);
    setEditDraft({});
  };

  const handleSaveEditor = () => {
    if (!editingRow) return;

    let updated = editingRow;
    selectedColumns.forEach((column) => {
      updated = applyHrColumnEdit(updated, column, editDraft[column] ?? '');
    });
    updated = rebuildRowDerivedFields(updated);

    setEditableRows((rows) => rows.map((row) => (row.__key === updated.__key ? updated : row)));
    setMonthlyActionMessage(`已更新 ${updated.name}（${updated.employeeId}）的月报字段，导出会同步使用最新值。`);
    closeEditor();
  };

  const openInlineEditor = (row: EditableMonthlyRow, column: string) => {
    setInlineEditingCell({ rowKey: row.__key, column });
    const value = getExportValue(row, column);
    setInlineValue(value === undefined || value === null ? '' : String(value));
  };

  const cancelInlineEditor = () => {
    setInlineEditingCell(null);
    setInlineValue('');
  };

  const saveInlineEditor = () => {
    if (!inlineEditingCell) return;

    setEditableRows((rows) =>
      rows.map((row) => {
        if (row.__key !== inlineEditingCell.rowKey) return row;
        const updated = rebuildRowDerivedFields(applyHrColumnEdit(row, inlineEditingCell.column, inlineValue));
        return updated;
      }),
    );

    setMonthlyActionMessage('已原地更新单元格数据，导出月报会同步使用最新值。');
    cancelInlineEditor();
  };

  const openRuleVersionEditor = (index: number) => {
    const target = ruleVersions[index];
    if (!target) return;

    setEditingRuleIndex(index);
    setRuleVersionDraft({
      version: target.version,
      status: target.status,
      scope: target.scope,
      owner: target.owner,
      highlight: target.highlight,
    });
  };

  const closeRuleVersionEditor = () => {
    setEditingRuleIndex(null);
    setRuleVersionDraft({ version: '', status: '', scope: '', owner: '', highlight: '' });
  };

  const saveRuleVersionEditor = () => {
    if (editingRuleIndex === null) return;

    setRuleVersions((current) =>
      current.map((item, index) => (index === editingRuleIndex ? { ...item, ...ruleVersionDraft } : item)),
    );
    setRuleActionMessage(`已更新版本 ${ruleVersionDraft.version} 的发布信息。`);
    closeRuleVersionEditor();
  };

  const handleCreateVersion = () => {
    const nextVersion = {
      version: `V3.${ruleVersions.length + 4} 新规则草稿`,
      status: '草稿待确认',
      scope: '待选择生效范围',
      owner: '当前人事',
      highlight: '已创建新版本草稿，可继续补充外勤权限、排班口径和导出口径差异。',
      tone: 'border-blue-100 bg-blue-50 text-blue-900',
    };
    setRuleVersions((current) => [nextVersion, ...current]);
    setRuleActionMessage('新规则版本草稿已创建，可点击该版本直接编辑发布内容。');
  };

  const handleRecalculate = () => {
    const keywordText = nameKeyword.trim() ? ` / 人名关键词：${nameKeyword.trim()}` : '';
    setMonthlyActionMessage(`已按 ${monthFilter} / ${departmentFilter} / ${statusFilter}${keywordText} 重新计算，共得到 ${filteredRows.length} 条月报结果。`);
  };

  const handleExport = () => {
    downloadCsv(
      `考勤月报-${monthFilter}.csv`,
      selectedColumns,
      filteredRows.map((row) => selectedColumns.map((column) => getExportValue(row, column))),
    );
    setMonthlyActionMessage(`已按“${exportPresets.find((item) => item.id === activePreset)?.title}”导出 ${filteredRows.length} 条月报记录。`);
  };

  const handleJumpPage = () => {
    const page = Number(jumpPageInput);
    if (!Number.isFinite(page)) return;
    const target = Math.min(totalPages, Math.max(1, Math.floor(page)));
    setCurrentPage(target);
    setJumpPageInput('');
  };

  return (
    <div className="space-y-6">
      {editingRow ? (
        <MobileModalShell
          icon={<FileText className="h-5 w-5" />}
          eyebrow="编辑月报字段"
          title={`${editingRow.name} · ${editingRow.employeeId}`}
          description={`按《考勤报表格式(1)》的 37 列逐项调整，保存后会同步到表格与导出。`}
          onClose={closeEditor}
          panelClassName="max-w-4xl"
        >
          <div className="grid gap-4 md:grid-cols-2">
            {selectedColumns.map((column) => (
              <div key={column} className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600">{column}</label>
                <input
                  value={editDraft[column] ?? ''}
                  onChange={(event) => setEditDraft((current) => ({ ...current, [column]: event.target.value }))}
                  type={HR_TEXT_COLUMNS.has(column) ? 'text' : 'number'}
                  step={HR_TEXT_COLUMNS.has(column) ? undefined : '0.01'}
                  className="block w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={closeEditor}
              className="inline-flex items-center rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSaveEditor}
              className="inline-flex items-center rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              保存
            </button>
          </div>
        </MobileModalShell>
      ) : null}

      {editingRuleIndex !== null ? (
        <MobileModalShell
          icon={<FileText className="h-5 w-5" />}
          eyebrow="编辑发布版本"
          title="规则版本内容"
          description="保存后会直接更新下方发布版本卡片展示内容。"
          onClose={closeRuleVersionEditor}
          panelClassName="max-w-2xl"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1 md:col-span-1">
              <label className="block text-xs font-semibold text-slate-600">版本名称</label>
              <input
                value={ruleVersionDraft.version}
                onChange={(event) => setRuleVersionDraft((current) => ({ ...current, version: event.target.value }))}
                className="block w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-1 md:col-span-1">
              <label className="block text-xs font-semibold text-slate-600">生效状态</label>
              <input
                value={ruleVersionDraft.status}
                onChange={(event) => setRuleVersionDraft((current) => ({ ...current, status: event.target.value }))}
                className="block w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-1 md:col-span-1">
              <label className="block text-xs font-semibold text-slate-600">生效范围</label>
              <input
                value={ruleVersionDraft.scope}
                onChange={(event) => setRuleVersionDraft((current) => ({ ...current, scope: event.target.value }))}
                className="block w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-1 md:col-span-1">
              <label className="block text-xs font-semibold text-slate-600">发布人</label>
              <input
                value={ruleVersionDraft.owner}
                onChange={(event) => setRuleVersionDraft((current) => ({ ...current, owner: event.target.value }))}
                className="block w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600">变更摘要</label>
              <textarea
                value={ruleVersionDraft.highlight}
                onChange={(event) => setRuleVersionDraft((current) => ({ ...current, highlight: event.target.value }))}
                rows={4}
                className="block w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={closeRuleVersionEditor}
              className="inline-flex items-center rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="button"
              onClick={saveRuleVersionEditor}
              className="inline-flex items-center rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              保存版本
            </button>
          </div>
        </MobileModalShell>
      ) : null}

      {selectedRow ? (
        <MobileModalShell
          icon={<FileText className="h-5 w-5" />}
          eyebrow="日明细预览"
          title={`${selectedRow.name} · ${selectedRow.employeeId}`}
          description={`${selectedRow.department} · ${selectedRow.month} · ${selectedRow.shift}`}
          onClose={() => setSelectedRow(null)}
          panelClassName="max-w-2xl"
        >
          <div className="grid gap-4 md:grid-cols-2">
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
        </MobileModalShell>
      ) : null}

      {ruleActionMessage ? (
        <section className="rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900 shadow-sm">
          <p className="font-semibold">规则动作已生效</p>
          <p className="mt-2 leading-6">{ruleActionMessage}</p>
        </section>
      ) : null}

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">月报筛选与结果</h2>
            <p className="mt-1 text-sm text-gray-500">支持点击单元格原地修改，同时保留人名入口的整行编辑；导出会同步最新值。</p>
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
                <option value="全部部门">全部部门</option>
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

        {monthlyActionMessage ? (
          <div className="mt-4 rounded-3xl border border-blue-100 bg-blue-50 p-4 shadow-sm">
            <p className="text-sm font-semibold text-blue-900">操作已完成</p>
            <p className="mt-2 text-sm leading-6 text-blue-800">{monthlyActionMessage}</p>
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

        <div className="mt-4 rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1400px] table-fixed border-collapse">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-600">
                  {selectedColumns.map((column) => (
                    <th key={column} className="whitespace-nowrap px-4 py-3">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((row, index) => (
                    <tr key={row.__key} className={`${index % 2 === 0 ? 'bg-white' : 'bg-rose-50/30'} border-t border-slate-100`}>
                      {selectedColumns.map((column) => {
                        if (column === '姓名') {
                          return (
                            <td key={column} className="whitespace-nowrap px-4 py-3">
                              <div className="flex items-center justify-between gap-3">
                                <button
                                  type="button"
                                  onClick={() => openEditor(row)}
                                  className="text-left text-sm font-semibold text-slate-900 hover:underline"
                                >
                                  {getExportValue(row, column)}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSelectedRow(row)}
                                  className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                                >
                                  日明细
                                </button>
                              </div>
                            </td>
                          );
                        }

                        const value = getExportValue(row, column);
                        const isInlineEditing = inlineEditingCell?.rowKey === row.__key && inlineEditingCell?.column === column;

                        return (
                          <td
                            key={column}
                            className="whitespace-nowrap px-4 py-3 text-sm text-slate-700"
                            onClick={() => openInlineEditor(row, column)}
                            title="点击可直接修改"
                          >
                            {isInlineEditing ? (
                              <input
                                autoFocus
                                value={inlineValue}
                                onChange={(event) => setInlineValue(event.target.value)}
                                onBlur={saveInlineEditor}
                                onClick={(event) => event.stopPropagation()}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter') {
                                    event.preventDefault();
                                    saveInlineEditor();
                                  }
                                  if (event.key === 'Escape') {
                                    event.preventDefault();
                                    cancelInlineEditor();
                                  }
                                }}
                                type={HR_TEXT_COLUMNS.has(column) ? 'text' : 'number'}
                                step={HR_TEXT_COLUMNS.has(column) ? undefined : '0.01'}
                                className="w-28 rounded-lg border border-blue-300 bg-white px-2 py-1 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              />
                            ) : (
                              value
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={selectedColumns.length} className="px-6 py-10 text-center text-sm text-gray-400">
                      当前筛选下暂无月报结果
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
            <p>
              显示第 <span className="font-semibold">{filteredRows.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}</span> 到{' '}
              <span className="font-semibold">{Math.min(safeCurrentPage * pageSize, filteredRows.length)}</span> 条，共{' '}
              <span className="font-semibold">{filteredRows.length}</span> 条结果
              <span className="ml-2 text-slate-500">· 当前已套用 {exportPresets.find((item) => item.id === activePreset)?.title}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((current) => Math.max(1, current - 1))}
                disabled={safeCurrentPage <= 1}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40"
              >
                上一页
              </button>
              <span className="text-xs text-slate-500">第 {safeCurrentPage} / {totalPages} 页</span>
              <button
                type="button"
                onClick={() => setCurrentPage((current) => Math.min(totalPages, current + 1))}
                disabled={safeCurrentPage >= totalPages}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40"
              >
                下一页
              </button>
              <div className="ml-1 inline-flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={jumpPageInput}
                  onChange={(event) => setJumpPageInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleJumpPage();
                    }
                  }}
                  className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-700 outline-none transition focus:border-blue-300"
                  placeholder="页码"
                />
                <button
                  type="button"
                  onClick={handleJumpPage}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  跳转
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">规则发布提醒</h3>
              <p className="mt-1 text-sm text-slate-500">规则页不只看说明，还要能看到版本、生效范围和变更摘要。</p>
            </div>
            <button
              type="button"
              onClick={handleCreateVersion}
              className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              新建规则版本
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {ruleVersions.map((item, index) => (
              <button
                key={`${item.version}-${index}`}
                type="button"
                onClick={() => openRuleVersionEditor(index)}
                className={`w-full rounded-2xl border p-4 text-left transition hover:opacity-95 ${item.tone}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{item.version}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold">{item.status}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold opacity-90">
                  <span className="rounded-full bg-white px-3 py-1">{item.scope}</span>
                  <span className="rounded-full bg-white px-3 py-1">发布人：{item.owner}</span>
                </div>
                <p className="mt-3 text-sm leading-6 opacity-90">{item.highlight}</p>
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex gap-3 rounded-2xl bg-slate-50 p-4">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
              <p className="leading-6">上一次正式发布时间：2026-04-18 14:00，本次门店轮班规则将在今天 18:00 自动切换。</p>
            </div>
            <div className="flex gap-3 rounded-2xl bg-slate-50 p-4">
              <CheckSquare className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
              <p className="leading-6">规则变更后建议自动生成“变更前 / 变更后”对比说明，减少人事和主管理解偏差。</p>
            </div>
            <div className="flex gap-3 rounded-2xl bg-amber-50 p-4 text-amber-900">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <p className="leading-6">如果生效范围涉及门店轮班组，需同步检查自选班次审批、外勤权限和月报导出口径是否一起更新。</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">变更前 / 变更后摘要</p>
            <div className="mt-3 space-y-2">
              {changeDiffs.map((item) => (
                <div key={item} className="rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-700">
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
