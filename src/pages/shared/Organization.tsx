import { useMemo, useState } from 'react';

const departments = [
  { name: '总部', people: 86, note: '支持定位 / WiFi / 人脸混合打卡，默认归入总部职能考勤组。' },
  { name: '直营门店', people: 144, note: '多班次、轮班和门店定位是重点，适合店长排班场景。' },
  { name: '工厂', people: 72, note: '考勤机数据需统一接入结果层，并按工厂考勤组单独判定。' },
];

const syncBatches = [
  {
    source: '企微组织同步',
    status: '今日 09:20 成功',
    detail: '新增 6 人、调岗 2 人，组织树已更新到总部和直营门店。',
    tone: 'border-emerald-100 bg-emerald-50 text-emerald-900',
  },
  {
    source: '工厂 Excel 导入',
    status: '待复核 2 条',
    detail: '72 人已入库，2 条工号待人事确认后再进入考勤组映射。',
    tone: 'border-amber-100 bg-amber-50 text-amber-900',
  },
  {
    source: '门店组织调整',
    status: '已自动回写',
    detail: '直营二店 1 人调岗已同步到门店轮班组，无需重复建档。',
    tone: 'border-blue-100 bg-blue-50 text-blue-900',
  },
];

const attendanceGroups = [
  { name: '总部职能组', members: '86 人', desc: '朝 9 晚 6 · 100m 定位范围 · 主管审批回写月报', rule: '当前规则：V3.3 总部职能版' },
  { name: '门店轮班组', members: '144 人', desc: '14:00 - 22:00 / 早晚轮班 · 支持店长排班与自选班次', rule: '待生效：V3.4 门店轮班版（18:00）' },
  { name: '工厂机考组', members: '72 人', desc: '08:00 - 17:00 · 考勤机结果统一导入口径层', rule: '当前规则：V2.9 工厂机考版' },
];

const mappingAlerts = [
  {
    title: '直营三店新员工待入组',
    badge: '待入组',
    detail: '2 名新员工已同步到组织，需分配到门店轮班组后才会进入排班提醒。',
    tone: 'border-amber-100 bg-amber-50 text-amber-900',
  },
  {
    title: '工厂夜班规则待挂载',
    badge: '待挂规则',
    detail: '夜班考勤机已接入，当前还缺对应规则版本，避免先打卡后补规则。',
    tone: 'border-red-100 bg-red-50 text-red-900',
  },
  {
    title: '总部调岗人员已完成切组',
    badge: '已同步',
    detail: '技术部转岗到运营部的员工已自动切换考勤组，月报口径不需要人工再改。',
    tone: 'border-emerald-100 bg-emerald-50 text-emerald-900',
  },
];

const employees = [
  {
    name: '张三',
    code: 'E001',
    department: '技术部',
    post: '前端开发',
    org: '总部',
    group: '总部职能组',
    shift: '朝 9 晚 6',
    source: '企微同步',
    mappingStatus: '已完成映射',
    mappingTone: 'bg-emerald-50 text-emerald-700',
  },
  {
    name: '李四',
    code: 'E017',
    department: '运营部',
    post: '门店督导',
    org: '直营门店',
    group: '门店轮班组',
    shift: '门店晚班 14:00 - 22:00',
    source: '企微同步',
    mappingStatus: '已完成映射',
    mappingTone: 'bg-emerald-50 text-emerald-700',
  },
  {
    name: '王五',
    code: 'E052',
    department: '生产部',
    post: '质检',
    org: '工厂',
    group: '工厂机考组',
    shift: '工厂早班 08:00 - 17:00',
    source: 'Excel 导入',
    mappingStatus: '待挂规则',
    mappingTone: 'bg-amber-50 text-amber-700',
  },
  {
    name: '赵六',
    code: 'E103',
    department: '直营二店',
    post: '店员',
    org: '直营门店',
    group: '门店轮班组',
    shift: '门店早班 09:00 - 18:00',
    source: '企微同步',
    mappingStatus: '待确认班次',
    mappingTone: 'bg-blue-50 text-blue-700',
  },
];

export default function OrganizationPage() {
  const [keyword, setKeyword] = useState('');
  const [orgFilter, setOrgFilter] = useState('全部组织');
  const [groupFilter, setGroupFilter] = useState('全部考勤组');
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogDescription, setDialogDescription] = useState('');

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchKeyword = !keyword || [employee.name, employee.code, employee.department, employee.post].some((item) => item.toLowerCase().includes(keyword.toLowerCase()));
      const matchOrg = orgFilter === '全部组织' || employee.org === orgFilter;
      const matchGroup = groupFilter === '全部考勤组' || employee.group === groupFilter;
      return matchKeyword && matchOrg && matchGroup;
    });
  }, [groupFilter, keyword, orgFilter]);

  const openDialog = (title: string, description: string) => {
    setDialogTitle(title);
    setDialogDescription(description);
  };

  return (
    <div className="space-y-6">
      {dialogTitle ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.24)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-blue-600">组织动作反馈</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">{dialogTitle}</h2>
              </div>
              <button
                type="button"
                onClick={() => setDialogTitle('')}
                className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-500 transition hover:bg-slate-50"
              >
                关闭
              </button>
            </div>
            <div className="mt-4 rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
              {dialogDescription}
            </div>
          </div>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        {departments.map((item) => (
          <div key={item.name} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{item.name}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{item.people} 人</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{item.note}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="grid gap-4 md:grid-cols-3 xl:flex xl:flex-wrap">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              placeholder="搜索员工姓名 / 工号"
            />
            <select
              value={orgFilter}
              onChange={(event) => setOrgFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
            >
              <option>全部组织</option>
              <option>总部</option>
              <option>直营门店</option>
              <option>工厂</option>
            </select>
            <select
              value={groupFilter}
              onChange={(event) => setGroupFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
            >
              <option>全部考勤组</option>
              <option>总部职能组</option>
              <option>门店轮班组</option>
              <option>工厂机考组</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => openDialog('批量导入', '已打开组织导入流程占位。后续可在这里接 Excel / 企微同步导入，并继续校验工号、组织和考勤组映射。')}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              批量导入
            </button>
            <button
              type="button"
              onClick={() => openDialog('新增员工', '已打开新增员工占位。可继续补员工基本信息、组织归属、考勤组和默认班次。')}
              className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              新增员工
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-blue-600">最近同步批次</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">组织导入不只停留在说明，先把来源和同步状态看清楚</h2>
          <div className="mt-4 space-y-3">
            {syncBatches.map((item) => (
              <div key={item.source} className={`rounded-2xl border p-4 ${item.tone}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{item.source}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold">{item.status}</span>
                </div>
                <p className="mt-2 text-sm leading-6 opacity-90">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-amber-600">待处理映射</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">先把组织、考勤组、规则挂对，再进入排班和月报</h2>
          <div className="mt-4 space-y-3">
            {mappingAlerts.map((item) => (
              <div key={item.title} className={`rounded-2xl border p-4 ${item.tone}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold">{item.badge}</span>
                </div>
                <p className="mt-2 text-sm leading-6 opacity-90">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-blue-600">组织接入状态</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">支持引用企微组织架构，不用再手工重建一套组织树</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl bg-slate-50 p-4">员工先落到组织，再分配进考勤组，后续排班、打卡、月报都按考勤组口径处理。</div>
            <div className="rounded-2xl bg-slate-50 p-4">门店、工厂、总部可以来自不同来源，但进入结果层前都要先完成工号、组织和考勤组映射。</div>
            <div className="rounded-2xl bg-slate-50 p-4">如果来源数据变化，这页先提示“待入组 / 待挂规则 / 待确认班次”，避免问题拖到月底月报才暴露。</div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-emerald-600">考勤组划分</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">先按使用场景拆考勤组，再挂班次和规则</h2>
          <div className="mt-4 space-y-3">
            {attendanceGroups.map((item) => (
              <div key={item.name} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">{item.members}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.desc}</p>
                <p className="mt-2 text-xs font-medium text-slate-400">{item.rule}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
          <p className="text-sm text-slate-500">筛选结果</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">当前共 {filteredEmployees.length} 条员工记录</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {['姓名 / 工号', '部门', '岗位', '考勤组织', '考勤组', '默认班次', '来源', '映射状态', '操作'].map((item) => (
                  <th key={item} className="whitespace-nowrap px-5 py-4 text-left font-semibold">{item}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((employee) => (
                <tr key={employee.code} className="bg-white">
                  <td className="whitespace-nowrap px-5 py-4">
                    <div className="font-semibold text-slate-900">{employee.name}</div>
                    <div className="text-slate-500">{employee.code}</div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">{employee.department}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">{employee.post}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">{employee.org}</td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{employee.group}</span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">{employee.shift}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">{employee.source}</td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${employee.mappingTone}`}>{employee.mappingStatus}</span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <button
                      type="button"
                      onClick={() => openDialog('编辑信息', `${employee.name}（${employee.code}）当前可继续编辑组织归属、考勤组、默认班次与同步来源。`)}
                      className="font-semibold text-blue-700 transition hover:text-blue-800"
                    >
                      编辑信息
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
