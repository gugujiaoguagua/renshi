import { attendanceDataset } from './attendanceDataset';

export type RoleType = 'staff' | 'manager' | 'hr_back';

export type Profile = {
  employeeId: string;
  name: string;
  role: string;
  roleType: RoleType;
  prototype: string;
  departmentPath: string;
  center: string;
  secondDept: string;
  thirdDept: string;
  attendanceGroup: string;
  shift: string;
  purpose: string;
};

export type DailyRecord = {
  dateText: string;
  date: string;
  weekday: string;
  name: string;
  employeeId: string;
  center: string;
  secondDept: string;
  thirdDept: string;
  role: string;
  attendanceGroup: string;
  shift: string;
  checkInTime: string;
  checkInStatus: string;
  checkInLocation: string;
  checkOutTime: string;
  checkOutStatus: string;
  checkOutLocation: string;
  standardHours: number;
  actualHours: number;
  request: string;
  result: string;
  lateCount: number;
  lateMinutes: number;
  earlyCount: number;
  earlyMinutes: number;
  absentCount: number;
  absentMinutes: number;
  missingCount: number;
  missingType: string;
  locationIssueCount: number;
  deviceIssueCount: number;
  overtimeStatus: string;
  overtimeHours: number;
  reissueCount: number;
  approvalPunchCount: number;
  outingCount: number;
  outingHours: number;
  tripDays: number;
  personalLeaveHours: number;
  sickLeaveHours: number;
};

export type MonthlyRecord = {
  name: string;
  employeeId: string;

  /** 对应“中心”列，例如：总部中心 */
  orgCenter: string;

  /** 对应“一级/二级/三级/四级部门” */
  center: string;
  secondDept: string;
  thirdDept: string;
  fourthDept: string;

  /** 对应“职务” */
  role: string;

  onboardDate: string;
  offboardDate: string;

  expectedAttendance: number;
  paidDays: number;
  actualAttendance: number;

  /** 对应“法定节假日出勤天数（天）”，测试阶段默认 0 */
  legalHolidayAttendanceDays: number;

  penaltyAmount: number;

  /** 对应“上下班缺卡次数” */
  missingInOutCount: number;

  /** 对应“缺卡次数(次)” */
  missingCount: number;

  lateEarlyWithin30: number;
  lateEarlyAbove30: number;
  lateWithin30: number;
  lateAbove30: number;
  earlyWithin30: number;
  earlyAbove30: number;

  tripDays: number;

  entryLeaveAbsentDays: number;
  legalEntryLeaveAbsentDays: number;
  absenteeismDays: number;

  personalLeaveDays: number;
  sickLeaveDays: number;
  marriageLeaveDays: number;
  maternityLeaveDays: number;
  paternityLeaveDays: number;
  bereavementLeaveDays: number;
  prenatalCheckLeaveDays: number;
  annualLeaveDays: number;
  compensatoryLeaveDays: number;
  otherLeaveDays: number;
};

type RawProfile = {
  employeeId: string;
  name: string;
  role: string;
  roleType: RoleType;
  prototype: string;
  department: string;
  attendanceGroup: string;
  shift: string;
  purpose: string;
};

type RawDailyRecord = {
  '时间': string;
  '姓名': string;
  '工号': string;
  '中心': string;
  '一级部门': string;
  '二级部门': string;
  '三级部门': string;
  '职务': string;
  '考勤组': string;
  '班次': string;
  '最早打卡时间': string;
  '最早打卡状态': string;
  '最早打卡地点': string;
  '最晚打卡时间': string;
  '最晚打卡状态': string;
  '最晚打卡地点': string;
  '标准工作时长(小时)': number;
  '实际工作时长(小时)': number;
  '假勤申请': string;
  '考勤结果': string;
  '迟到次数(次)': number;
  '迟到时长(分钟)': number;
  '早退次数(次)': number;
  '早退时长(分钟)': number;
  '旷工次数(次)': number;
  '旷工时长(分钟)': number;
  '缺卡次数(次)': number;
  '缺卡类型': string;
  '地点异常(次)': number;
  '设备异常(次)': number;
  '加班状态': string;
  '加班时长(小时)': number;
  '补卡次数(次)': number;
  '审批打卡次数(次)': number;
  '外勤次数(次)': number;
  '外出(小时)': number;
  '出差(天)': number;
  '事假(小时)': number;
  '病假(小时)': number;
};

type RawMonthlyRecord = {
  '姓名': string;
  '工号': string;
  '中心': string;
  '一级部门': string;
  '二级部门': string;
  '三级部门': string;
  '职务': string;
  '入职时间': string;
  '离职时间': string;
  '应出勤天数(天)': number;
  '计薪天数': number;
  '实际出勤天数(天)': number;
  '迟到/早退扣款金额': number;
  '缺卡次数(次)': number;
  '迟到早退次数（30分钟以内）': number;
  '迟到/早退30分钟以上次数': number;
  '迟到次数（30分钟以内）': number;
  '迟到次数（30分钟以上）': number;
  '早退次数（30分钟以内）': number;
  '早退次数（30分钟以上）': number;
  '出差(天)': number;
  '入离职缺勤-非法定（天）': number;
  '入离职缺勤-法定（天）': number;
  '旷工（天）': number;
  '事假(天)': number;
  '病假(天)': number;
  '年假(天)': number;
  '调休(天)': number;
  '其它(天)': number;
};

export type ScopeKey = 'employee' | 'manager' | 'admin';


const rawProfiles = attendanceDataset.employeeProfiles as unknown as RawProfile[];
const rawDailyRecords = attendanceDataset.dailyRecords as unknown as RawDailyRecord[];
const rawMonthlyRecords = attendanceDataset.monthlySummary as unknown as RawMonthlyRecord[];

function splitDepartment(path: string) {
  const [center = '', secondDept = '', thirdDept = ''] = path.split('>');
  return { center, secondDept, thirdDept };
}

function normalizeDate(dateText: string) {
  return dateText.split(' ')[0].replace(/\//g, '-');
}

function shortWeekday(dateText: string) {
  return dateText.split(' ')[1] ?? '';
}

function numberValue(value: number | string | undefined) {
  if (typeof value === 'number') {
    return value;
  }
  return Number(value ?? 0);
}

function sortByDateDesc<T extends { date: string }>(items: T[]) {
  return [...items].sort((a, b) => (a.date < b.date ? 1 : -1));
}

function sortByDateAsc<T extends { date: string }>(items: T[]) {
  return [...items].sort((a, b) => (a.date > b.date ? 1 : -1));
}

function formatShortShift(shift: string) {
  if (shift.includes('弹性')) {
    return '弹性班';
  }
  if (shift.includes('标准班')) {
    return '朝 9 晚 6';
  }
  if (shift.includes('09:00-18:00')) {
    return '朝 9 晚 6';
  }
  return shift.replace('标准班：', '').replace('弹性打卡：', '');
}

function isClosedScenario(result: string) {
  return ['补卡通过', '病假', '病假半天', '事假', '外勤', '出差'].includes(result);
}

function isRiskResult(record: DailyRecord) {
  return ['迟到', '早退', '地点异常待核实', '审批中'].includes(record.result) || record.missingCount > 0;
}

function isPendingResult(record: DailyRecord) {
  return record.result === '审批中' || (record.missingCount > 0 && record.approvalPunchCount === 0);
}

function isLocationReview(record: DailyRecord) {
  return record.locationIssueCount > 0 || record.result === '地点异常待核实';
}

function attendanceResultLabel(record: DailyRecord) {
  if (record.result === '正常' && record.overtimeHours > 0) {
    return `正常 · 加班 ${record.overtimeHours}h`;
  }
  if (record.result === '病假半天') {
    return '病假半天';
  }
  if (record.result === '审批中') {
    return '审批中';
  }
  if (record.missingCount > 0 && record.result === '正常') {
    return '缺卡待补';
  }
  return record.result;
}

function buildRequestKind(record: DailyRecord) {
  if (record.tripDays > 0 || record.result === '出差') {
    return '出差';
  }
  if (record.outingCount > 0 || record.result === '外勤') {
    return '外出';
  }
  if (record.personalLeaveHours > 0 || record.sickLeaveHours > 0 || record.result.includes('假')) {
    return '请假';
  }
  if (record.result === '审批中' || record.missingCount > 0 || record.reissueCount > 0) {
    return '补卡';
  }
  return '调班';
}

function buildRequestKindLabel(record: DailyRecord) {
  const kind = buildRequestKind(record);
  if (kind === '请假') {
    if (record.sickLeaveHours > 0 || record.result.includes('病假')) {
      return record.result === '病假半天' ? '病假半天' : '病假申请';
    }
    return '事假申请';
  }
  if (kind === '外出') {
    return '外勤申请';
  }
  if (kind === '出差') {
    return '出差申请';
  }
  if (kind === '补卡') {
    return record.result === '审批中' ? '补卡审批中' : '补卡 / 缺卡处理';
  }
  return '调班确认';
}

function getKindTone(kind: string) {
  if (kind === '补卡') return 'bg-orange-100 text-orange-800';
  if (kind === '请假') return 'bg-blue-100 text-blue-800';
  if (kind === '出差') return 'bg-purple-100 text-purple-800';
  if (kind === '外出') return 'bg-amber-100 text-amber-800';
  return 'bg-emerald-100 text-emerald-800';
}

function getStatusTone(status: string) {
  if (status.includes('通过') || status.includes('已回写') || status.includes('已闭环')) return 'bg-emerald-50 text-emerald-700';
  if (status.includes('待') || status.includes('审批中') || status.includes('处理中')) return 'bg-amber-50 text-amber-700';
  return 'bg-blue-50 text-blue-700';
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

export const profiles: Profile[] = rawProfiles.map((profile) => {
  const parts = splitDepartment(profile.department);
  return {
    employeeId: profile.employeeId,
    name: profile.name,
    role: profile.role,
    roleType: profile.roleType,
    prototype: profile.prototype,
    departmentPath: profile.department,
    center: parts.center,
    secondDept: parts.secondDept,
    thirdDept: parts.thirdDept,
    attendanceGroup: profile.attendanceGroup,
    shift: profile.shift,
    purpose: profile.purpose,
  };
});

export const dailyRecords: DailyRecord[] = rawDailyRecords.map((record) => ({
  dateText: record['时间'],
  date: normalizeDate(record['时间']),
  weekday: shortWeekday(record['时间']),
  name: record['姓名'],
  employeeId: record['工号'],
  center: record['一级部门'],
  secondDept: record['二级部门'],
  thirdDept: record['三级部门'],
  role: record['职务'],
  attendanceGroup: record['考勤组'],
  shift: record['班次'],
  checkInTime: record['最早打卡时间'] || '--:--',
  checkInStatus: record['最早打卡状态'] || '未打卡',
  checkInLocation: record['最早打卡地点'] || '--',
  checkOutTime: record['最晚打卡时间'] || '--:--',
  checkOutStatus: record['最晚打卡状态'] || '未打卡',
  checkOutLocation: record['最晚打卡地点'] || '--',
  standardHours: numberValue(record['标准工作时长(小时)']),
  actualHours: numberValue(record['实际工作时长(小时)']),
  request: record['假勤申请'] || '无',
  result: record['考勤结果'] || '正常',
  lateCount: numberValue(record['迟到次数(次)']),
  lateMinutes: numberValue(record['迟到时长(分钟)']),
  earlyCount: numberValue(record['早退次数(次)']),
  earlyMinutes: numberValue(record['早退时长(分钟)']),
  absentCount: numberValue(record['旷工次数(次)']),
  absentMinutes: numberValue(record['旷工时长(分钟)']),
  missingCount: numberValue(record['缺卡次数(次)']),
  missingType: record['缺卡类型'] || '',
  locationIssueCount: numberValue(record['地点异常(次)']),
  deviceIssueCount: numberValue(record['设备异常(次)']),
  overtimeStatus: record['加班状态'] || '无',
  overtimeHours: numberValue(record['加班时长(小时)']),
  reissueCount: numberValue(record['补卡次数(次)']),
  approvalPunchCount: numberValue(record['审批打卡次数(次)']),
  outingCount: numberValue(record['外勤次数(次)']),
  outingHours: numberValue(record['外出(小时)']),
  tripDays: numberValue(record['出差(天)']),
  personalLeaveHours: numberValue(record['事假(小时)']),
  sickLeaveHours: numberValue(record['病假(小时)']),
}));

export const monthlyRecords: MonthlyRecord[] = rawMonthlyRecords.map((record) => ({
  name: record['姓名'],
  employeeId: record['工号'],

  orgCenter: record['中心'] || '',

  center: record['一级部门'],
  secondDept: record['二级部门'],
  thirdDept: record['三级部门'],
  fourthDept: record['四级部门'] || '',

  role: record['职务'],

  onboardDate: record['入职时间'] || '--',
  offboardDate: record['离职时间'] || '',

  expectedAttendance: numberValue(record['应出勤天数(天)']),
  paidDays: numberValue(record['计薪天数']),
  actualAttendance: numberValue(record['实际出勤天数(天)']),

  // 测试数据里没有该列，导出时先按 0 占位，后续接节假日日历再补齐。
  legalHolidayAttendanceDays: 0,

  penaltyAmount: numberValue(record['迟到/早退扣款金额']),

  missingInOutCount: numberValue(record['上下班缺卡次数']),
  missingCount: numberValue(record['缺卡次数(次)']),

  lateEarlyWithin30: numberValue(record['迟到早退次数（30分钟以内）']),
  lateEarlyAbove30: numberValue(record['迟到/早退30分钟以上次数']),
  lateWithin30: numberValue(record['迟到次数（30分钟以内）']),
  lateAbove30: numberValue(record['迟到次数（30分钟以上）']),
  earlyWithin30: numberValue(record['早退次数（30分钟以内）']),
  earlyAbove30: numberValue(record['早退次数（30分钟以上）']),

  tripDays: numberValue(record['出差(天)']),

  entryLeaveAbsentDays: numberValue(record['入离职缺勤-非法定（天）']),
  legalEntryLeaveAbsentDays: numberValue(record['入离职缺勤-法定（天）']),
  absenteeismDays: numberValue(record['旷工（天）']),

  personalLeaveDays: numberValue(record['事假(天)']),
  sickLeaveDays: numberValue(record['病假(天)']),
  marriageLeaveDays: numberValue(record['婚假(天)']),
  maternityLeaveDays: numberValue(record['产假(天)']),
  paternityLeaveDays: numberValue(record['陪产假(天)']),
  bereavementLeaveDays: numberValue(record['丧假(天)']),
  prenatalCheckLeaveDays: numberValue(record['产检假(天)']),
  annualLeaveDays: numberValue(record['年假(天)']),
  compensatoryLeaveDays: numberValue(record['调休(天)']),
  otherLeaveDays: numberValue(record['其它(天)']),
}));

export const datasetSummary = {
  totalEmployees: attendanceDataset.totalEmployees,
  dailyRecords: dailyRecords.length,
  monthlyRecords: monthlyRecords.length,
  generatedAt: attendanceDataset.generatedAt,
  scenarioWindow: attendanceDataset.scenarioWindow,
  roleDistribution: attendanceDataset.roleDistribution,
};

export const statusCounts = dailyRecords.reduce<Record<string, number>>((result, item) => {
  result[item.result] = (result[item.result] ?? 0) + 1;
  return result;
}, {});

const profileMap = new Map(profiles.map((profile) => [profile.employeeId, profile]));
const monthlyMap = new Map(monthlyRecords.map((record) => [record.employeeId, record]));

function getProfileById(employeeId: string) {
  return profileMap.get(employeeId)!;
}

function getDailyByEmployee(employeeId: string) {
  return sortByDateDesc(dailyRecords.filter((record) => record.employeeId === employeeId));
}

function getMonthlyByEmployee(employeeId: string) {
  return monthlyMap.get(employeeId)!;
}

function buildExceptionLines(record: DailyRecord) {
  const lines = [`班次：${record.shift}`, `结果：${attendanceResultLabel(record)}`];
  if (record.request !== '无') {
    lines.push(`流程：${record.request}`);
  }
  if (record.missingCount > 0) {
    lines.push(`缺卡类型：${record.missingType || '待补充说明'}`);
  }
  if (record.lateMinutes > 0) {
    lines.push(`迟到时长：${record.lateMinutes} 分钟`);
  }
  if (record.earlyMinutes > 0) {
    lines.push(`早退时长：${record.earlyMinutes} 分钟`);
  }
  if (record.locationIssueCount > 0) {
    lines.push(`地点异常：${record.locationIssueCount} 次，需要主管核实`);
  }
  return lines;
}

function buildExceptionSteps(record: DailyRecord) {
  if (record.result === '审批中') {
    return ['已提交', '主管审批中', '待回写月报'];
  }
  if (record.missingCount > 0) {
    return ['补充说明', '提交审批', '同步月报'];
  }
  if (isLocationReview(record)) {
    return ['核对地点', '主管确认', '同步结果'];
  }
  return ['结果生成', '记录留痕', '月报可追溯'];
}

function buildExceptionBadge(record: DailyRecord) {
  if (record.result === '审批中') {
    return { label: '主管审批中', tone: 'bg-amber-50 text-amber-700', dotTone: 'bg-amber-500' };
  }
  if (record.missingCount > 0) {
    return { label: '待补卡处理', tone: 'bg-red-50 text-red-700', dotTone: 'bg-red-500' };
  }
  if (isLocationReview(record)) {
    return { label: '待主管核实', tone: 'bg-purple-50 text-purple-700', dotTone: 'bg-purple-500' };
  }
  return { label: '已回写', tone: 'bg-emerald-50 text-emerald-700', dotTone: 'bg-emerald-500' };
}

function buildApprovalStatus(record: DailyRecord, pending: boolean) {
  if (pending) {
    if (record.result === '审批中') return '待主管审批';
    if (record.tripDays > 0) return '待主管确认地点';
    if (record.personalLeaveHours > 0 || record.sickLeaveHours > 0) return '待主管审批';
    if (record.locationIssueCount > 0) return '待主管核实';
    return '待主管审批';
  }

  if (record.result === '补卡通过') return '已通过';
  if (record.result === '外勤' || record.result === '出差') return '已回写';
  if (record.result.includes('假')) return '已通过';
  return '已同步';
}

function buildApprovalItem(record: DailyRecord, pending: boolean) {
  const profile = getProfileById(record.employeeId);
  const kind = buildRequestKind(record);
  const status = buildApprovalStatus(record, pending);

  return {
    applicant: record.name,
    avatar: record.name.slice(0, 1),
    department: `${profile.secondDept} · ${record.role}`,
    submittedAt: `${record.date} ${record.weekday}`,
    kind,
    kindLabel: buildRequestKindLabel(record),
    kindTone: getKindTone(kind),
    status,
    statusTone: getStatusTone(status),
    tone: pending ? 'border-amber-100 bg-amber-50' : 'border-emerald-100 bg-emerald-50',
    summary: record.request !== '无' ? record.request : `${attendanceResultLabel(record)}，需结合打卡和规则继续确认。`,
    note: pending
      ? '审批通过后会同步回写异常中心、团队月报和人事月报。'
      : '该记录已同步到异常中心和月报，主管侧可继续留痕复核。',
    sync: pending ? '回写目标：异常中心 / 团队月报 / 人事月报' : '同步状态：已回写异常中心 / 月报 / 日志中心',
    rows: [
      { label: '日期', value: `${record.date} ${record.weekday}` },
      { label: '班次', value: record.shift },
      { label: '考勤结果', value: attendanceResultLabel(record) },
      { label: '地点 / 说明', value: record.checkInLocation !== '--' ? `${record.checkInLocation} / ${record.request}` : record.request },
    ],
  };
}

function buildLogItems() {
  const pending = dailyRecords.find((record) => record.result === '审批中');
  const approved = dailyRecords.find((record) => record.result === '补卡通过');
  const locationIssue = dailyRecords.find((record) => isLocationReview(record));

  return [
    pending
      ? {
          type: '审批流转',
          operator: '主管工作台',
          time: `${pending.date} 18:00`,
          target: `${pending.name} ${buildRequestKindLabel(pending)}`,
          detail: `${pending.request} 仍在审批中，导出前不可直接按通过计算。`,
          result: '待回写',
          resultTone: 'bg-amber-50 text-amber-700',
          before: `当前状态：${attendanceResultLabel(pending)}`,
          after: '审批完成后再回写异常中心、月报和导出结果。',
          traces: ['来源：100人总部试点样本', '规则：审批中不可视为已通过', '需继续催办'],
        }
      : null,
    approved
      ? {
          type: '补卡通过',
          operator: '主管审批',
          time: `${approved.date} 16:30`,
          target: `${approved.name} 补卡记录`,
          detail: '补卡已审批通过，异常中心与月报口径同步更新。',
          result: '已回写',
          resultTone: 'bg-emerald-50 text-emerald-700',
          before: '原状态为缺卡 / 待补说明。',
          after: '审批通过后转为补卡通过，可进入最终统计。',
          traces: ['异常中心已同步', '月报已同步', '日志可追溯'],
        }
      : null,
    locationIssue
      ? {
          type: '地点核验',
          operator: '人事复核',
          time: `${locationIssue.date} 19:10`,
          target: `${locationIssue.name} 地点异常`,
          detail: '打卡地点超出办公区域，需要主管和人事共同确认。',
          result: '待核实',
          resultTone: 'bg-blue-50 text-blue-700',
          before: `地点异常 ${locationIssue.locationIssueCount} 次。`,
          after: '确认后再决定是否纳入外勤或保留异常。',
          traces: ['地点留痕已保留', '可回到异常中心继续处理', '导出前需确认'],
        }
      : null,
  ].filter(Boolean) as Array<{
    type: string;
    operator: string;
    time: string;
    target: string;
    detail: string;
    result: string;
    resultTone: string;
    before: string;
    after: string;
    traces: string[];
  }>;
}

const employeeSample = profiles.find((profile) => profile.roleType === 'staff')!;
const managerSample = profiles.find((profile) => profile.roleType === 'manager')!;
const adminSample = profiles.find((profile) => profile.roleType === 'hr_back')!;

const employeeEvents = getDailyByEmployee(employeeSample.employeeId);
const employeeMonthly = getMonthlyByEmployee(employeeSample.employeeId);
const managerSelfEvents = getDailyByEmployee(managerSample.employeeId);
const managerSelfMonthly = getMonthlyByEmployee(managerSample.employeeId);
const adminSelfEvents = getDailyByEmployee(adminSample.employeeId);
const adminSelfMonthly = getMonthlyByEmployee(adminSample.employeeId);
const managerScopeProfiles = profiles.filter((profile) => profile.center === managerSample.center);
const managerScopeIds = new Set(managerScopeProfiles.map((profile) => profile.employeeId));
const managerScopeEvents = sortByDateDesc(dailyRecords.filter((record) => managerScopeIds.has(record.employeeId)));
const managerScopeMonthly = monthlyRecords.filter((record) => managerScopeIds.has(record.employeeId));
const managerScopeSecondDepartments = unique(managerScopeProfiles.map((profile) => profile.secondDept)).sort();


const adminExceptionRecords = sortByDateDesc(
  dailyRecords.filter((record) => isRiskResult(record)).map((record) => ({
    date: record.date,
    employee: record.name,
    code: record.employeeId,
    department: record.secondDept,
    type: attendanceResultLabel(record),
    status: record.result === '审批中' ? '主管处理中' : record.missingCount > 0 ? '待复核' : isLocationReview(record) ? '待核实' : '待修正',
    risk: record.result === '审批中' || record.missingCount > 0 ? '高' : '中',
    detail: `${record.dateText} · ${record.role} · ${record.request !== '无' ? record.request : '系统已记录异常，需要继续跟进。'}`,
    tone: record.result === '审批中' || record.missingCount > 0 ? 'border-red-100 bg-red-50' : 'border-amber-100 bg-amber-50',
  })),
);

function buildWeekDates(start: string, end: string) {
  return unique(
    sortByDateAsc(dailyRecords.filter((record) => record.date >= start && record.date <= end)).map((record) => `${record.date}|${record.weekday}`),
  ).map((item) => {
    const [date, weekday] = item.split('|');
    return { label: weekday.replace('星期', ''), date: date.slice(8), dateKey: date };
  });
}

const scheduleWeeks = [
  {
    title: '2026-04 第 1 周',
    dates: buildWeekDates('2026-04-06', '2026-04-10'),
  },
  {
    title: '2026-04 第 2 周',
    dates: buildWeekDates('2026-04-13', '2026-04-17'),
  },
];


function buildScheduleCell(record: DailyRecord | undefined) {
  if (!record) {
    return { code: 'pending', label: '待补班次', detail: '无样本' };
  }

  if (record.result === '审批中') {
    return { code: 'pending', label: '待确认', detail: '审批中' };
  }

  if (record.missingCount > 0) {
    return { code: 'pending', label: '缺卡', detail: record.missingType || '待补说明' };
  }

  if (record.result === '出差') {
    return { code: 'off', label: '出差', detail: '已审批' };
  }

  if (record.result.includes('假')) {
    return { code: 'off', label: record.result, detail: '已审批' };
  }

  return {
    code: record.shift.includes('弹性') ? 'late' : 'day',
    label: formatShortShift(record.shift),
    detail: record.result === '正常' ? '正常' : attendanceResultLabel(record),
  };
}

function buildScheduleMembers(secondDept: string, weekIndex: number) {
  const week = scheduleWeeks[weekIndex];
  const members = managerScopeProfiles.filter((profile) => profile.secondDept === secondDept).slice(0, 6);

  return members.map((member) => ({
    id: member.employeeId,
    name: member.name,
    role: member.role,
    avatar: member.name.slice(0, 1),
    avatarTone: member.roleType === 'manager' ? 'bg-indigo-100 text-indigo-600' : member.shift.includes('弹性') ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-600',
    entries: week.dates.map((dateItem) => buildScheduleCell(dailyRecords.find((record) => record.employeeId === member.employeeId && record.date === dateItem.dateKey))),
  }));
}

export const layoutCounts = {
  employeePending: employeeEvents.filter((record) => isPendingResult(record) || isLocationReview(record)).length,
  managerApproval: managerScopeEvents.filter((record) => record.result === '审批中' || record.missingCount > 0).length,
  adminNotifications: adminExceptionRecords.filter((item) => item.risk === '高').length,
};

export const homeProfiles = {
  employee: employeeSample,
  manager: managerSample,
  admin: adminSample,
};

export const employeeHomeInsights = (() => {
  const latest = employeeEvents[0];
  const pendingItems = employeeEvents.filter((record) => isPendingResult(record));
  const locationItems = employeeEvents.filter((record) => isLocationReview(record));
  const closedSpecials = employeeEvents.filter((record) => isClosedScenario(record.result));

  return {
    profile: employeeSample,
    latest,
    stats: [
      { label: '应出勤天数', value: `${employeeMonthly.expectedAttendance} 天` },
      { label: '实际出勤', value: `${employeeMonthly.actualAttendance} 天` },
      { label: '未闭环异常', value: `${pendingItems.length + locationItems.length} 条` },
      { label: '补卡 / 请假回写', value: `${closedSpecials.length} 条` },
    ],
    statusChips: [
      { label: `样本员工：${employeeSample.name}`, tone: 'bg-white/15 text-white ring-white/20' },
      { label: employeeSample.attendanceGroup, tone: 'bg-emerald-400/15 text-emerald-50 ring-emerald-200/20' },
      { label: `${pendingItems.length} 条待处理`, tone: 'bg-amber-400/15 text-amber-50 ring-amber-100/20' },
      { label: '第三阶段总部试点', tone: 'bg-blue-400/15 text-blue-50 ring-blue-100/20' },
    ],
    todoItems: [
      pendingItems[0]
        ? {
            title: '缺卡 / 补卡待处理',
            desc: `${pendingItems[0].dateText} · ${attendanceResultLabel(pendingItems[0])}，需要继续补充说明并等待主管审批。`,
            deadline: '建议当天闭环',
            impact: '未处理会继续占用异常名额，并影响月底确认。',
            to: '/employee/apply?type=reissue',
            tone: 'bg-red-50 text-red-700 border-red-100',
            action: '去补卡说明',
          }
        : null,
      locationItems[0]
        ? {
            title: '地点异常核实',
            desc: `${locationItems[0].dateText} · 打卡地点待主管核实，确认后才会同步最终口径。`,
            deadline: '月底前完成核实',
            impact: '若不核实，会继续停留在待确认状态。',
            to: '/employee/exceptions',
            tone: 'bg-amber-50 text-amber-700 border-amber-100',
            action: '查看异常',
          }
        : null,
      {
        title: '月度结果确认',
        desc: `当前月报已按 ${datasetSummary.scenarioWindow} 汇总，确认前先检查是否还有审批中记录。`,
        deadline: '次月 2 日 18:00 截止',
        impact: '确认后会锁定当前月报口径，不再重复提醒。',
        to: '/employee/monthly-summary',
        tone: 'bg-blue-50 text-blue-700 border-blue-100',
        action: '去确认',
      },
    ].filter(Boolean),
    reminderModals: [
      pendingItems[0]
        ? {
            title: '缺卡补卡提醒',
            desc: `${pendingItems[0].dateText} 的${attendanceResultLabel(pendingItems[0])}还没闭环，请尽快补充说明。`,
            to: '/employee/exceptions',
            primaryText: '去补卡',
            level: '高优先级',
            tone: 'border-red-100 bg-red-50 text-red-900',
            cadence: ['首次发现立即弹窗', '当天 16:00 再提醒 1 次', '月底前每天 09:30 持续催办'],
          }
        : {
            title: '今日打卡提醒',
            desc: '当前样本员工暂无缺卡，但仍建议按工作日持续核对结果。',
            to: '/employee/records',
            primaryText: '查看记录',
            level: '常规提醒',
            tone: 'border-blue-100 bg-blue-50 text-blue-900',
            cadence: ['工作日打卡后展示当日结果', '异常出现时自动升级提醒', '月底前保留首页入口'],
          },
      {
        title: '月底异常清理提醒',
        desc: `本样本窗口共有 ${pendingItems.length + locationItems.length} 条待确认记录，建议月结前统一清掉。`,
        to: '/employee/exceptions',
        primaryText: '查看异常',
        level: '月底必看',
        tone: 'border-amber-100 bg-amber-50 text-amber-900',
        cadence: ['月底前 3 天开始每日提醒', '异常未清时保持首页红点', '超时后按当前结果进入月报'],
      },
      {
        title: '月度结果确认提醒',
        desc: `请在确认前先核对 ${employeeMonthly.missingCount} 次缺卡、${employeeMonthly.personalLeaveDays + employeeMonthly.sickLeaveDays} 天请假和审批状态。`,
        to: '/employee/monthly-summary',
        primaryText: '去确认',
        level: '次月确认',
        tone: 'border-blue-100 bg-blue-50 text-blue-900',
        cadence: ['次月 1 日推送提醒', '次月 2 日上午再次弹窗', '超时后自动默认确认'],
      },
    ],
  };
})();

export const employeeExceptionInsights = (() => {
  const pending = employeeEvents.filter((record) => record.missingCount > 0 && record.result !== '审批中' && record.result !== '补卡通过');
  const processing = employeeEvents.filter((record) => record.result === '审批中');
  const review = employeeEvents.filter((record) => isLocationReview(record));
  const done = employeeEvents.filter((record) => isClosedScenario(record.result) || record.result === '迟到' || record.result === '早退');

  const convert = (record: DailyRecord) => {
    const badge = buildExceptionBadge(record);
    return {
      title: `${attendanceResultLabel(record)} · ${record.date}`,
      date: record.dateText,
      dotTone: badge.dotTone,
      badge: badge.label,
      badgeTone: badge.tone,
      lines: buildExceptionLines(record),
      steps: buildExceptionSteps(record),
      actions: record.result === '审批中'
        ? [
            { label: '查看进度', className: 'border border-gray-200 text-gray-600 hover:bg-gray-50' },
            { label: '催办主管', className: 'border border-gray-200 text-gray-600 hover:bg-gray-50' },
          ]
        : record.missingCount > 0
          ? [
              { label: '提交补卡', className: 'bg-blue-50 text-blue-600 hover:bg-blue-100', to: '/employee/apply?type=reissue' },
              { label: '查看规则', className: 'border border-gray-200 text-gray-600 hover:bg-gray-50' },
            ]
          : [
              { label: '查看结果明细', className: 'border border-gray-200 text-gray-600 hover:bg-gray-50' },
            ],
    };
  };

  return {
    tabs: {
      pending: { label: '待处理', records: pending.map(convert) },
      processing: { label: '审批中', records: processing.map(convert) },
      review: { label: '待核实', records: review.map(convert) },
      done: { label: '已完成', records: done.map(convert) },
    },
  };
})();

export const employeeMonthlyInsights = {
  profile: employeeSample,
  summaryCards: [
    { label: '应出勤天数', value: `${employeeMonthly.expectedAttendance} 天`, tone: 'text-slate-900' },
    { label: '计薪天数', value: `${employeeMonthly.paidDays} 天`, tone: 'text-emerald-600' },
    { label: '缺卡次数', value: `${employeeMonthly.missingCount} 次`, tone: 'text-red-600' },
    { label: '请假 / 出差', value: `${employeeMonthly.personalLeaveDays + employeeMonthly.sickLeaveDays + employeeMonthly.tripDays} 天`, tone: 'text-blue-600' },
  ],
  detailRows: employeeEvents.filter((record) => record.result !== '正常').map((record) => ({
    date: record.date,
    type: attendanceResultLabel(record),
    status: record.result === '审批中' ? '审批中' : isClosedScenario(record.result) ? '已回写' : '待处理',
    note: record.request !== '无' ? record.request : `${record.checkInTime} - ${record.checkOutTime}，按 ${record.shift} 判定。`,
    tone: record.result === '审批中' ? 'border-amber-100 bg-amber-50' : isClosedScenario(record.result) ? 'border-emerald-100 bg-emerald-50' : 'border-red-100 bg-red-50',
  })),
  pendingText: `当前员工样本共有 ${employeeEvents.filter((record) => isPendingResult(record) || isLocationReview(record)).length} 条记录需要在确认前继续处理。`,
};

type RecordCalendarState = 'outside' | 'empty' | 'normal' | 'special' | 'anomaly';

type RecordCalendarCell = {
  key: string;
  date: string;
  dayNumber: number;
  shortDate: string;
  label: string;
  hint: string;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  hasRecord: boolean;
  isToday: boolean;
  state: RecordCalendarState;
};

type RecordDayDetail = {
  date: string;
  dateText: string;
  shift: string;
  status: string;
  statusTone: string;
  syncStatus: string;
  syncTone: string;
  reason: string;
  trace: string;
  isAnomaly: boolean;
  actions: Array<{ label: string; to: string }>;
  entries: Array<{ label: string; value: string; status: string; detail: string }>;
};

type RecordPageInsight = {
  scope: ScopeKey;
  title: string;
  description: string;
  profile: Profile;
  monthLabel: string;
  defaultSelectedDate: string;
  summaryCards: Array<{ label: string; value: string; desc: string; tone: string }>;
  calendarCells: RecordCalendarCell[];
  recordsByDate: Record<string, RecordDayDetail[]>;
  weeklyTrend: Array<{ label: string; detail: string }>;
};

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split('-');
  return `${year}年${Number(month)}月`;
}

function formatDateValue(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function isCalendarAnomaly(record: DailyRecord) {
  return isRiskResult(record) || isPendingResult(record) || isLocationReview(record);
}

function buildCalendarState(record?: DailyRecord): RecordCalendarState {
  if (!record) return 'empty';
  if (isCalendarAnomaly(record)) return 'anomaly';
  if (isClosedScenario(record.result) || record.result.includes('假') || record.result === '外勤' || record.result === '出差') return 'special';
  return 'normal';
}

function buildCalendarLabel(record?: DailyRecord) {
  if (!record) return '无记录';
  if (record.result === '迟到') return record.lateMinutes > 0 ? `迟到${record.lateMinutes}分` : '迟到';
  if (record.result === '早退') return record.earlyMinutes > 0 ? `早退${record.earlyMinutes}分` : '早退';
  if (record.result === '审批中') return '审批中';
  if (record.missingCount > 0) return record.missingType || '缺卡';
  if (isLocationReview(record)) return '地点待核实';
  if (record.result === '正常' && record.overtimeHours > 0) return `加班${record.overtimeHours}h`;
  return attendanceResultLabel(record);
}

function buildCalendarHint(record?: DailyRecord) {
  if (!record) return '点击查看';
  if (record.request !== '无') return record.request;
  return `${record.checkInTime} / ${record.checkOutTime}`;
}

function buildCalendarCells(events: DailyRecord[]) {
  const latest = events[0];
  const monthKey = latest?.date.slice(0, 7) ?? '2026-04';
  const [yearText, monthText] = monthKey.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const firstDay = new Date(year, month - 1, 1);
  const mondayIndex = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();
  const prevMonthDays = new Date(year, month - 1, 0).getDate();
  const cells: RecordCalendarCell[] = [];
  const recordMap = new Map(events.map((record) => [record.date, record]));
  const todayDate = latest?.date ?? `${monthKey}-01`;

  for (let index = mondayIndex - 1; index >= 0; index -= 1) {
    const day = prevMonthDays - index;
    const date = month === 1 ? formatDateValue(year - 1, 12, day) : formatDateValue(year, month - 1, day);
    cells.push({
      key: date,
      date,
      dayNumber: day,
      shortDate: date.slice(5),
      label: '上月',
      hint: '',
      isCurrentMonth: false,
      isWeekend: false,
      hasRecord: false,
      isToday: false,
      state: 'outside',
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = formatDateValue(year, month, day);
    const record = recordMap.get(date);
    const currentDate = new Date(year, month - 1, day);
    cells.push({
      key: date,
      date,
      dayNumber: day,
      shortDate: date.slice(5),
      label: buildCalendarLabel(record),
      hint: buildCalendarHint(record),
      isCurrentMonth: true,
      isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
      hasRecord: Boolean(record),
      isToday: date === todayDate,
      state: buildCalendarState(record),
    });
  }

  const trailingCount = Math.ceil(cells.length / 7) * 7 - cells.length;
  for (let day = 1; day <= trailingCount; day += 1) {
    const date = month === 12 ? formatDateValue(year + 1, 1, day) : formatDateValue(year, month + 1, day);
    cells.push({
      key: date,
      date,
      dayNumber: day,
      shortDate: date.slice(5),
      label: '下月',
      hint: '',
      isCurrentMonth: false,
      isWeekend: false,
      hasRecord: false,
      isToday: false,
      state: 'outside',
    });
  }

  return { monthKey, cells };
}

function buildRecordDetail(record: DailyRecord, scope: ScopeKey): RecordDayDetail {
  const actionsByScope: Record<ScopeKey, Array<{ label: string; to: string }>> = {
    employee: [
      { label: '查看异常中心', to: '/employee/exceptions' },
      { label: '查看月度确认', to: '/employee/monthly-summary' },
    ],
    manager: [
      { label: '去审批中心', to: '/manager/approval' },
      { label: '查看团队异常', to: '/manager/team-exceptions' },
    ],
    admin: [
      { label: '查看异常中心', to: '/admin/exceptions' },
      { label: '查看日志中心', to: '/admin/logs' },
    ],
  };

  const isAnomaly = isCalendarAnomaly(record);
  return {
    date: record.date,
    dateText: record.dateText,
    shift: record.shift,
    status: attendanceResultLabel(record),
    statusTone: record.result === '审批中'
      ? 'bg-amber-100 text-amber-800'
      : isClosedScenario(record.result)
        ? 'bg-blue-100 text-blue-800'
        : isAnomaly
          ? 'bg-red-100 text-red-800'
          : 'bg-emerald-100 text-emerald-800',
    syncStatus: record.result === '审批中' || record.missingCount > 0 ? '待回写' : '已同步月报',
    syncTone: record.result === '审批中' || record.missingCount > 0 ? 'bg-white text-amber-700' : 'bg-white text-emerald-700',
    reason: record.request !== '无' ? record.request : `${record.checkInTime} / ${record.checkOutTime} 已进入考勤结果。`,
    trace: `依据 ${record.shift}、${record.attendanceGroup} 与 ${record.checkInLocation} / ${record.checkOutLocation} 判定。`,
    isAnomaly,
    actions: actionsByScope[scope],
    entries: [
      { label: '上班', value: record.checkInTime, status: record.checkInStatus, detail: `${record.checkInLocation} · ${record.shift}` },
      { label: '下班', value: record.checkOutTime, status: record.checkOutStatus, detail: `${record.checkOutLocation} · ${attendanceResultLabel(record)}` },
      { label: '申请 / 说明', value: record.request === '无' ? '无' : record.request, status: record.result, detail: `补卡 ${record.reissueCount} 次 · 审批打卡 ${record.approvalPunchCount} 次` },
    ],
  };
}

function buildRecordPageInsights(scope: ScopeKey, profile: Profile, monthly: MonthlyRecord, events: DailyRecord[], title: string, description: string): RecordPageInsight {
  const { monthKey, cells } = buildCalendarCells(events);
  const anomalyDates = unique(events.filter((record) => isCalendarAnomaly(record)).map((record) => record.date));
  const specialDates = unique(events.filter((record) => buildCalendarState(record) === 'special').map((record) => record.date));
  const pendingCount = events.filter((record) => record.result === '审批中' || record.missingCount > 0 || isLocationReview(record)).length;
  const recordsByDate = sortByDateDesc(events).reduce<Record<string, RecordDayDetail[]>>((result, record) => {
    if (!result[record.date]) {
      result[record.date] = [];
    }
    result[record.date].push(buildRecordDetail(record, scope));
    return result;
  }, {});
  const defaultSelectedDate = anomalyDates[0] ?? events[0]?.date ?? `${monthKey}-01`;

  return {
    scope,
    title,
    description,
    profile,
    monthLabel: formatMonthLabel(monthKey),
    defaultSelectedDate,
    summaryCards: [
      { label: '本月出勤', value: `${monthly.actualAttendance} 天`, desc: '日报和月报保持同一口径，可继续下钻到日明细。', tone: 'text-slate-900' },
      { label: '异常天数', value: `${anomalyDates.length} 天`, desc: '迟到、早退、缺卡、审批中和地点待核实都会爆红提醒。', tone: 'text-rose-700' },
      { label: '待回写', value: `${pendingCount} 条`, desc: '审批未完成前，会继续保留待处理状态。', tone: 'text-amber-600' },
      { label: '场景打卡', value: `${specialDates.length} 天`, desc: '请假、外勤、出差等特殊场景统一进入同一日历。', tone: 'text-blue-700' },
    ],
    calendarCells: cells,
    recordsByDate,
    weeklyTrend: [
      { label: `正常 ${events.filter((record) => record.result === '正常').length} 天`, detail: '完整打卡直接进入月报' },
      { label: `异常 ${anomalyDates.length} 天`, detail: '异常天会统一爆红并支持直接查看原因' },
      { label: `补卡/审批 ${events.filter((record) => record.result === '审批中' || record.result === '补卡通过').length} 条`, detail: '审批结束后会同步回写' },
      { label: `请假/外勤 ${specialDates.length} 天`, detail: '特殊场景不丢失原始定位和说明' },
    ],
  };
}

export const recordPageInsights: Record<ScopeKey, RecordPageInsight> = {
  employee: buildRecordPageInsights('employee', employeeSample, employeeMonthly, employeeEvents, '我的打卡记录', ''),
  manager: buildRecordPageInsights('manager', managerSample, managerSelfMonthly, managerSelfEvents, '我的打卡记录', ''),
  admin: buildRecordPageInsights('admin', adminSample, adminSelfMonthly, adminSelfEvents, '我的打卡记录', ''),
};


export const employeeRecordInsights = recordPageInsights.employee;


const managerToday = managerScopeEvents[0]?.date ?? '2026-04-17';
const managerTodayRecords = managerScopeEvents.filter((record) => record.date === managerToday);
const managerPendingApprovals = managerScopeEvents.filter((record) => record.result === '审批中' || record.missingCount > 0).slice(0, 8);
const managerProcessedApprovals = managerScopeEvents.filter((record) => isClosedScenario(record.result)).slice(0, 8);
const managerExceptionList = managerScopeEvents.filter((record) => isRiskResult(record)).slice(0, 16);

export const managerHomeInsights = (() => {
  const presentCount = managerTodayRecords.filter((record) => ['正常', '迟到', '早退', '补卡通过'].includes(record.result)).length;
  const outingTripCount = managerTodayRecords.filter((record) => record.result === '外勤' || record.result === '出差').length;
  const leaveCount = managerTodayRecords.filter((record) => record.result.includes('假')).length;
  const attentionCount = managerTodayRecords.filter((record) => isPendingResult(record) || isLocationReview(record)).length;

  return {
    profile: managerSample,
    headerDate: managerToday,
    summaryCards: [
      { label: '今日出勤', value: `${presentCount}/${managerTodayRecords.length}`, detail: `样板团队覆盖 ${managerScopeProfiles.length} 人，按 ${managerToday} 回放。`, tone: 'text-gray-900', to: undefined },
      { label: '待审批', value: `${managerPendingApprovals.length}`, detail: '补卡 / 审批中记录需要主管继续处理。', tone: 'text-amber-600', to: '/manager/approval' },
      { label: '团队异常', value: `${managerExceptionList.length}`, detail: '迟到、缺卡、地点异常和审批中都纳入异常明细。', tone: 'text-red-600', to: '/manager/team-exceptions' },
      { label: '待补班次', value: `${managerPendingApprovals.length}`, detail: '当前用待确认班次样板承接第三阶段排班校准。', tone: 'text-purple-600', to: '/manager/schedule' },
    ],
    teamBuckets: [
      { label: '已到岗', value: `${presentCount}`, detail: '正常 / 迟到 / 早退 / 补卡通过', tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
      { label: '外勤 / 出差', value: `${outingTripCount}`, detail: '场景已登记', tone: 'bg-blue-50 text-blue-700 border-blue-100' },
      { label: '请假中', value: `${leaveCount}`, detail: '已按假期口径处理', tone: 'bg-slate-50 text-slate-700 border-slate-200' },
      { label: '异常待处理', value: `${attentionCount}`, detail: '需今天继续跟进', tone: 'bg-amber-50 text-amber-700 border-amber-100' },
    ],
    urgentItems: [
      {
        title: '补卡待审批',
        desc: `当前还有 ${managerPendingApprovals.length} 条补卡 / 审批中记录，建议优先处理避免月底积压。`,
        deadline: '建议当天闭环',
        impact: '审批结果会直接回写到异常中心和团队月报。',
        to: '/manager/approval',
        tone: 'border-amber-100 bg-amber-50 text-amber-900',
      },
      {
        title: '本周存在待确认班次',
        desc: `当前排班样板里有 ${managerPendingApprovals.length} 个格子仍需确认，适合验证第三阶段排班闭环。`,
        deadline: '发布前补齐',
        impact: '待确认班次会继续放大异常提示。',
        to: '/manager/schedule',
        tone: 'border-purple-100 bg-purple-50 text-purple-900',
      },
      {
        title: '团队异常集中处理',
        desc: `样板团队已有 ${managerExceptionList.length} 条异常记录，建议今天统一跟进。`,
        deadline: '月底前需全部清零',
        impact: '否则团队月报会带着未确认结果进入人事工作台。',
        to: '/manager/team-exceptions',
        tone: 'border-red-100 bg-red-50 text-red-900',
      },
    ],
    followUpQueue: managerExceptionList.slice(0, 3).map((record) => ({
      name: record.name,
      status: attendanceResultLabel(record),
      reason: record.request !== '无' ? record.request : `${record.dateText} · ${record.checkInTime} / ${record.checkOutTime} 需要继续确认。`,
      nextStep: record.result === '审批中' ? '去审批中心催办或处理。' : record.missingCount > 0 ? '先补卡，再回看异常是否消失。' : '先核对结果，再决定是否人工修正。',
      tone: record.result === '审批中' ? 'bg-amber-50 text-amber-900 border-amber-100' : record.missingCount > 0 ? 'bg-red-50 text-red-900 border-red-100' : 'bg-purple-50 text-purple-900 border-purple-100',
    })),
  };
})();

export const managerScheduleInsights = {
  departments: managerScopeSecondDepartments.slice(0, 2),
  weeks: scheduleWeeks,
  membersByDepartmentAndWeek: managerScopeSecondDepartments.slice(0, 2).reduce<Record<string, ReturnType<typeof buildScheduleMembers>>>((result, department) => {
    scheduleWeeks.forEach((_, index) => {
      result[`${department}-${index}`] = buildScheduleMembers(department, index);
    });
    return result;
  }, {}),
  requestsByDepartment: managerScopeSecondDepartments.slice(0, 2).reduce<Record<string, Array<{ name: string; department: string; type: string; detail: string; nextStep: string; tone: string }>>>((result, department) => {
    const members = managerScopeProfiles.filter((profile) => profile.secondDept === department).slice(0, 2);
    result[department] = members.map((member) => ({
      name: member.name,
      department: `${department} · ${member.role}`,
      type: '待确认班次',
      detail: `${member.shift} 当前已用于第三阶段试点排班样板，若补卡 / 审批中未处理，发布前建议再复核。`,
      nextStep: '确认后同步排班页、异常中心和团队月报。',
      tone: 'border-emerald-100 bg-emerald-50 text-emerald-900',
    }));
    return result;
  }, {}),
};

export const managerApprovalInsights = {
  pendingApprovals: managerPendingApprovals.map((record) => buildApprovalItem(record, true)),
  processedApprovals: managerProcessedApprovals.map((record) => buildApprovalItem(record, false)),
  mineApprovals: managerExceptionList.slice(0, 2).map((record) => ({
    applicant: `我发起的${record.name}跟进`,
    avatar: '我',
    department: `${record.secondDept} · 主管动作`,
    submittedAt: `${record.date} ${record.weekday}`,
    kind: '调班',
    kindLabel: '闭环催办',
    kindTone: 'bg-blue-100 text-blue-800',
    status: '待成员确认',
    statusTone: 'bg-blue-50 text-blue-700',
    tone: 'border-blue-100 bg-blue-50',
    summary: `${record.name} 当前仍有 ${attendanceResultLabel(record)}，已发起催办提醒。`,
    note: '用于承接第三阶段“提醒从提示升级为催办”的链路。',
    sync: '同步状态：待回写主管工作台',
    rows: [
      { label: '触发场景', value: attendanceResultLabel(record) },
      { label: '覆盖成员', value: record.name },
      { label: '下一步', value: '成员处理后继续进入主管审批' },
      { label: '提醒频率', value: '未闭环前每日提醒' },
    ],
  })),
  reminderPreview: {
    title: '主管催办弹窗预览',
    desc: `当前样板团队有 ${managerPendingApprovals.length} 条待审批记录，${managerExceptionList.length} 条异常仍需继续闭环。`,
    cadence: ['首次触发立即弹窗', '未处理时每日 09:30 / 15:00 / 18:00 重复提醒', '月底前持续红点并升级到工作台待办'],
  },
  stats: [
    { label: '待补卡', value: `${managerPendingApprovals.filter((item) => buildRequestKind(item) === '补卡').length}` },
    { label: '待请假', value: `${managerPendingApprovals.filter((item) => buildRequestKind(item) === '请假').length}` },
    { label: '待出差/外出', value: `${managerPendingApprovals.filter((item) => buildRequestKind(item) === '出差' || buildRequestKind(item) === '外出').length}` },
    { label: '待调班', value: `${managerExceptionList.slice(0, 2).length}` },
  ],
};

export const managerExceptionInsights = {
  quickStats: [
    { label: '团队异常', value: `${managerExceptionList.length} 条`, tone: 'text-red-600' },
    { label: '待审批补卡', value: `${managerPendingApprovals.length} 条`, tone: 'text-amber-600' },
    { label: '未闭环地点异常', value: `${managerExceptionList.filter((item) => isLocationReview(item)).length} 条`, tone: 'text-purple-600' },
    { label: '已闭环', value: `${managerProcessedApprovals.length} 条`, tone: 'text-emerald-600' },
  ],
  items: managerExceptionList.map((record) => ({
    name: record.name,
    department: `${record.secondDept} · ${record.role}`,
    type: attendanceResultLabel(record),
    date: record.date,
    detail: record.request !== '无' ? record.request : `${record.checkInTime} / ${record.checkOutTime}，需要结合规则继续确认。`,
    tone: record.result === '审批中' ? 'border-amber-100 bg-amber-50 text-amber-900' : record.missingCount > 0 ? 'border-red-100 bg-red-50 text-red-900' : 'border-purple-100 bg-purple-50 text-purple-900',
    actionText: record.result === '审批中' ? '去审批' : record.missingCount > 0 ? '去审批' : '看规则',
    actionTo: record.result === '审批中' || record.missingCount > 0 ? '/manager/approval' : '/manager/schedule',
    urgent: record.result === '审批中' || record.missingCount > 0,
  })),
};

export const managerMonthlyInsights = {
  scopes: managerScopeSecondDepartments.slice(0, 2),
  rowsByScope: managerScopeSecondDepartments.slice(0, 2).reduce<Record<string, Array<{
    name: string;
    post: string;
    attendance: string;
    abnormal: string;
    fieldFlow: string;
    status: string;
    note: string;
    tone: string;
    scope: string;
  }>>>((result, scope) => {
    result[scope] = managerScopeMonthly.filter((item) => item.secondDept === scope).slice(0, 8).map((item) => ({
      name: item.name,
      post: `${scope} · ${item.role}`,
      attendance: `${item.actualAttendance} 天`,
      abnormal: `${item.missingCount + item.lateWithin30 + item.lateAbove30 + item.earlyWithin30 + item.earlyAbove30} 项`,
      fieldFlow: `${item.tripDays} / ${item.personalLeaveDays} / ${item.sickLeaveDays} 天`,
      status: item.missingCount > 0 ? '待处理' : '已确认',
      note: item.missingCount > 0 ? '仍有缺卡或异常待闭环，需要主管继续跟进。' : '当前结果可直接纳入团队月报。',
      tone: item.missingCount > 0 ? 'border-red-100 bg-red-50' : 'border-emerald-100 bg-emerald-50',
      scope,
    }));
    return result;
  }, {}),
};

export const adminDashboardInsights = {
  rows: monthlyRecords.map((item) => {
    const profile = getProfileById(item.employeeId);
    return {
      name: item.name,
      employeeId: item.employeeId,

      // 兼容页面现有用法
      department: item.secondDept,
      center: item.center,
      role: item.role,
      month: '2026-04',
      employmentStatus: item.offboardDate ? '离职' : '在职',
      shift: profile.shift,

      // 月报模板字段（用于导出）
      orgCenter: item.orgCenter,
      firstDept: item.center,
      secondDept: item.secondDept,
      thirdDept: item.thirdDept,
      fourthDept: item.fourthDept,
      onboardDate: item.onboardDate,
      offboardDate: item.offboardDate,
      expectedAttendance: item.expectedAttendance,
      paidDays: item.paidDays,
      actualAttendance: item.actualAttendance,
      legalHolidayAttendanceDays: item.legalHolidayAttendanceDays,
      penaltyAmount: item.penaltyAmount,
      missingInOutCount: item.missingInOutCount,
      missingCount: item.missingCount,
      lateEarlyWithin30: item.lateEarlyWithin30,
      lateEarlyAbove30: item.lateEarlyAbove30,
      lateWithin30: item.lateWithin30,
      lateAbove30: item.lateAbove30,
      earlyWithin30: item.earlyWithin30,
      earlyAbove30: item.earlyAbove30,
      tripDays: item.tripDays,
      entryLeaveAbsentDays: item.entryLeaveAbsentDays,
      legalEntryLeaveAbsentDays: item.legalEntryLeaveAbsentDays,
      absenteeismDays: item.absenteeismDays,
      personalLeaveDays: item.personalLeaveDays,
      sickLeaveDays: item.sickLeaveDays,
      marriageLeaveDays: item.marriageLeaveDays,
      maternityLeaveDays: item.maternityLeaveDays,
      paternityLeaveDays: item.paternityLeaveDays,
      bereavementLeaveDays: item.bereavementLeaveDays,
      prenatalCheckLeaveDays: item.prenatalCheckLeaveDays,
      annualLeaveDays: item.annualLeaveDays,
      compensatoryLeaveDays: item.compensatoryLeaveDays,
      otherLeaveDays: item.otherLeaveDays,

      // 页面汇总展示字段
      attendance: item.actualAttendance,
      lateCount: item.lateWithin30 + item.lateAbove30,
      lateMinutes: 0,
      earlyCount: item.earlyWithin30 + item.earlyAbove30,
      earlyMinutes: 0,
      absentDays: item.absenteeismDays,
      outingDays: dailyRecords.filter((record) => record.employeeId === item.employeeId).reduce((total, record) => total + record.outingCount, 0),
      tripDaysSummary: item.tripDays,
      leaveDays: item.personalLeaveDays + item.sickLeaveDays,
      approvalStatus: dailyRecords.some((record) => record.employeeId === item.employeeId && record.result === '审批中') ? '仍有审批中' : item.missingCount > 0 ? '待复核' : '已同步',
      writebackSource: item.missingCount > 0 ? '异常中心 / 主管审批' : '日报汇总 / 月报回写',
      detail: getDailyByEmployee(item.employeeId).filter((record) => record.result !== '正常').slice(0, 3).map((record) => `${record.dateText} · ${attendanceResultLabel(record)} · ${record.request}`),
      rowTone: item.missingCount > 0 ? 'bg-red-50 transition hover:bg-red-100' : 'bg-white transition hover:bg-gray-50',
    };
  }),
  departmentOptions: unique(monthlyRecords.map((item) => item.secondDept)).sort(),
  summaryCards: (rows: Array<{ lateCount: number; earlyCount: number; missingCount: number; absentDays: number; approvalStatus: string }>) => {
    const perfectCount = rows.filter((row) => row.lateCount === 0 && row.earlyCount === 0 && row.missingCount === 0 && row.absentDays === 0).length;
    const riskyCount = rows.filter((row) => row.lateCount > 0 || row.earlyCount > 0 || row.missingCount > 0 || row.absentDays > 0).length;
    const pendingCount = rows.filter((row) => row.approvalStatus.includes('审批中') || row.approvalStatus.includes('复核')).length;
    return [
      { label: '统计人数', value: `${rows.length}`, tone: 'text-gray-900' },
      { label: '全勤人数', value: `${perfectCount}`, tone: 'text-emerald-600' },
      { label: '异常扣薪人数', value: `${riskyCount}`, tone: 'text-red-600', tag: riskyCount > 0 ? '需复核' : undefined },
      { label: '待处理异常 / 审批', value: `${riskyCount} / ${pendingCount}`, tone: 'text-amber-500' },
    ];
  },
  pendingItems: [
    { title: '月底异常处理催办', desc: `当前还有 ${adminExceptionRecords.filter((item) => item.risk === '高').length} 条高风险异常，建议今日催办。`, tone: 'border-amber-100 bg-amber-50 text-amber-900', to: '/admin/exceptions' },
    { title: '审批积压提醒', desc: `当前仍有 ${dailyRecords.filter((record) => record.result === '审批中').length} 条审批中记录，导出前不可忽略。`, tone: 'border-red-100 bg-red-50 text-red-900', to: '/admin/exceptions' },
    { title: '规则生效确认', desc: `本次试点共覆盖 ${Object.keys(statusCounts).length} 类考勤结果，建议继续核对月报口径。`, tone: 'border-blue-100 bg-blue-50 text-blue-900', to: '/admin/rules' },
  ],
};

export const adminExceptionInsights = {
  rows: adminExceptionRecords,
  summaryCards: [
    { label: '待处理异常', value: `${adminExceptionRecords.length}`, tone: 'text-red-600' },
    { label: '待审批补卡', value: `${dailyRecords.filter((record) => record.result === '审批中').length}`, tone: 'text-amber-600' },
    { label: '地点异常待核实', value: `${dailyRecords.filter((record) => isLocationReview(record)).length}`, tone: 'text-rose-600' },
    { label: '已闭环场景', value: `${dailyRecords.filter((record) => isClosedScenario(record.result)).length}`, tone: 'text-emerald-600' },
  ],
};

export const adminScheduleInsights = (() => {
  const groupStats = unique(profiles.map((profile) => profile.attendanceGroup)).map((groupName) => {
    const groupProfiles = profiles.filter((profile) => profile.attendanceGroup === groupName);
    const groupIds = new Set(groupProfiles.map((profile) => profile.employeeId));
    const groupEvents = dailyRecords.filter((record) => groupIds.has(record.employeeId));
    const pendingCount = groupEvents.filter((record) => record.result === '审批中' || record.missingCount > 0).length;
    const locationCount = groupEvents.filter((record) => isLocationReview(record)).length;
    return {
      department: groupName,
      owner: groupProfiles[0]?.center || '总部中心',
      status: pendingCount > 0 ? '存在待确认班次' : '已校准',
      stage: pendingCount > 0 ? '待复核' : '已完成',
      detail: `样本人数 ${groupProfiles.length} 人，缺卡 / 审批中 ${pendingCount} 条，地点异常 ${locationCount} 条。`,
      impact: pendingCount > 0 ? '会影响异常中心和月报最终口径。' : '当前可继续作为总部试点样板复用。',
      nextStep: pendingCount > 0 ? '先处理审批中和缺卡，再发布对外展示口径。' : '继续观察规则变更后的结果。',
      writeback: '处理成功后，员工端、异常中心和月报摘要都会同步刷新。',
      tone: pendingCount > 0 ? 'border-amber-100 bg-amber-50' : 'border-emerald-100 bg-emerald-50',
    };
  });

  return {
    rows: groupStats,
    summaryCards: [
      { label: '试点考勤组', value: `${groupStats.length} 组`, detail: '总部试点按考勤组统一校准。', tone: 'text-red-600' },
      { label: '待校准口径', value: `${groupStats.filter((item) => item.status !== '已校准').length} 组`, detail: '存在审批中或缺卡，需要继续处理。', tone: 'text-amber-600' },
      { label: '已校准考勤组', value: `${groupStats.filter((item) => item.status === '已校准').length} 组`, detail: '当前可作为样板复用。', tone: 'text-emerald-600' },
      { label: '样本工作周', value: `${scheduleWeeks.length} 周`, detail: '用于第三阶段排班与日报/月报校准。', tone: 'text-purple-600' },
    ],
  };
})();

export const organizationInsights = {
  departmentCards: unique(profiles.map((profile) => profile.center)).map((center) => ({
    name: center,
    people: profiles.filter((profile) => profile.center === center).length,
    note: `当前来自总部试点样本，覆盖 ${unique(profiles.filter((profile) => profile.center === center).map((profile) => profile.secondDept)).length} 个二级部门。`,
  })),
  attendanceGroups: unique(profiles.map((profile) => profile.attendanceGroup)).map((groupName) => ({
    name: groupName,
    members: `${profiles.filter((profile) => profile.attendanceGroup === groupName).length} 人`,
    desc: `${profiles.find((profile) => profile.attendanceGroup === groupName)?.shift ?? '--'} · 第三阶段总部试点样板`,
    rule: `当前规则：覆盖 ${dailyRecords.filter((record) => record.attendanceGroup === groupName).length} 条日报样本`,
  })),
  employees: profiles.map((profile) => ({
    name: profile.name,
    code: profile.employeeId,
    department: profile.secondDept,
    post: profile.role,
    org: profile.center,
    group: profile.attendanceGroup,
    shift: profile.shift,
    source: '第三阶段 100 人测试集',
    mappingStatus: dailyRecords.some((record) => record.employeeId === profile.employeeId && isPendingResult(record)) ? '待确认口径' : '已完成映射',
    mappingTone: dailyRecords.some((record) => record.employeeId === profile.employeeId && isPendingResult(record)) ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700',
  })),
  syncBatches: [
    { source: '第三阶段 100 人测试数据', status: `${datasetSummary.generatedAt} 生成`, detail: `总部试点共 ${datasetSummary.totalEmployees} 人，覆盖 ${datasetSummary.dailyRecords} 条日报和 ${datasetSummary.monthlyRecords} 条月报。`, tone: 'border-emerald-100 bg-emerald-50 text-emerald-900' },
    { source: '日报异常校准', status: `${adminExceptionRecords.length} 条待关注`, detail: '审批中、缺卡和地点异常会继续在组织映射后触发风险提醒。', tone: 'border-amber-100 bg-amber-50 text-amber-900' },
    { source: '月报汇总口径', status: `${monthlyRecords.length} 条已生成`, detail: '月报本质上来自日报汇总，当前已具备组织级穿透能力。', tone: 'border-blue-100 bg-blue-50 text-blue-900' },
  ],
  mappingAlerts: [
    { title: '审批中记录待继续闭环', badge: `${dailyRecords.filter((record) => record.result === '审批中').length} 条`, detail: '审批中不能直接进入最终导出口径，建议继续催办。', tone: 'border-amber-100 bg-amber-50 text-amber-900' },
    { title: '地点异常待主管核实', badge: `${dailyRecords.filter((record) => isLocationReview(record)).length} 条`, detail: '地点异常要先确认，再决定是否纳入外勤或保留异常。', tone: 'border-red-100 bg-red-50 text-red-900' },
    { title: '月报映射已形成样板', badge: `${monthlyRecords.length} 条`, detail: '每名员工已能对应到月报汇总，不再只是表头占位。', tone: 'border-emerald-100 bg-emerald-50 text-emerald-900' },
  ],
};

export const profileInsights: Record<ScopeKey, { badge: string; name: string; role: string; org: string; defaultView: string; loginAt: string; intro: string; infoGroups: Array<{ title: string; items: string[] }> }> = {
  employee: {
    badge: '员工工作台',
    name: employeeSample.name,
    role: employeeSample.role,
    org: employeeSample.secondDept,
    defaultView: '员工视角',
    loginAt: `${employeeEvents[0]?.date ?? '2026-04-17'} 18:30`,
    intro: '当前使用第三阶段 100 人测试集里的普通员工样板，重点验证打卡、异常、月度确认闭环。',
    infoGroups: [
      { title: '个人信息', items: [`姓名：${employeeSample.name}`, `角色：${employeeSample.role}`, `所属组织：${employeeSample.secondDept}`, '默认视角：员工视角'] },
      { title: '通知设置', items: ['缺卡提醒：开启', '审批进度提醒：开启', '月底确认提醒：开启', `异常样本：${employeeEvents.filter((record) => isRiskResult(record)).length} 条`] },
      { title: '常用说明', items: ['补卡默认截止到次月 2 号前', '外勤 / 出差需补充业务说明', '异常处理结果会同步到月报', '地点异常需主管核实后闭环'] },
    ],
  },
  manager: {
    badge: '主管工作台',
    name: managerSample.name,
    role: managerSample.role,
    org: managerSample.secondDept,
    defaultView: '主管视角',
    loginAt: `${managerToday} 18:35`,
    intro: '当前使用第三阶段 100 人测试集里的主管样板，优先呈现团队异常、审批和排班校准结果。',
    infoGroups: [
      { title: '个人信息', items: [`姓名：${managerSample.name}`, `角色：${managerSample.role}`, `所属组织：${managerSample.secondDept}`, '默认视角：主管视角'] },
      { title: '通知设置', items: ['补卡待审批提醒：开启', '团队异常提醒：开启', '待确认班次提醒：开启', `主管范围：${managerScopeProfiles.length} 人`] },
      { title: '常用说明', items: ['主管审批会影响日报与月报结果', '驳回补卡必须填写原因', '团队异常建议在当日闭环', '待确认班次会持续在首页提醒'] },
    ],
  },
  admin: {
    badge: '人事工作台',
    name: adminSample.name,
    role: adminSample.role,
    org: adminSample.center,
    defaultView: '人事视角',
    loginAt: `${datasetSummary.generatedAt}`,
    intro: '当前人事端已切到第三阶段 100 人测试集，重点验证异常汇总、月报导出和组织映射。',
    infoGroups: [
      { title: '个人信息', items: [`姓名：${adminSample.name}`, `角色：${adminSample.role}`, `所属组织：${adminSample.center}`, '默认视角：人事视角'] },
      { title: '通知设置', items: [`异常提醒：${layoutCounts.adminNotifications} 条`, '审批消息：开启', '月报确认提醒：开启', '规则变更提醒：开启'] },
      { title: '常用说明', items: ['补卡默认截止到次月 2 号前', '外勤 / 出差需补充业务说明', '日报与月报统一口径', '关键改动会写入日志中心'] },
    ],
  },
};

export const logInsights = {
  items: buildLogItems(),
  traceRules: [
    '规则改动必须记录操作人、时间、变更前后差异。',
    '补卡审批需要保留审批链路和驳回原因。',
    '人工修正必须说明原因，支持后续回溯。',
    '月报导出前后的确认动作建议写入日志。',
  ],
  closeLoopCases: [
    { title: '审批通过后', desc: '至少记录审批人、审批时间、回写范围和最终结果。' },
    { title: '人工改口径时', desc: '必须保留变更原因、变更前后和影响对象，避免月底追不回来。' },
    { title: '导出月报前后', desc: '建议把导出人、导出时间和复核动作一并写入日志。' },
  ],
};
