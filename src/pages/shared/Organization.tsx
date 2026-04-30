import { useMemo, useState } from 'react';
import { Building2 } from 'lucide-react';
import { organizationInsights } from '../../data/attendanceInsights';
import MobileModalShell from '../../components/mobile/MobileModalShell';


export default function OrganizationPage() {
  const [keyword, setKeyword] = useState('');
  const [orgFilter, setOrgFilter] = useState('全部组织');
  const [groupFilter, setGroupFilter] = useState('全部考勤组');
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogDescription, setDialogDescription] = useState('');

  const filteredEmployees = useMemo(() => {
    return organizationInsights.employees.filter((employee) => {
      const matchKeyword =
        !keyword ||
        [employee.name, employee.code, employee.department, employee.post].some((item) => item.toLowerCase().includes(keyword.toLowerCase()));
      const matchOrg = orgFilter === '全部组织' || employee.org === orgFilter;
      const matchGroup = groupFilter === '全部考勤组' || employee.group === groupFilter;
      return matchKeyword && matchOrg && matchGroup;
    });
  }, [groupFilter, keyword, orgFilter]);

  const orgOptions = Array.from(new Set(organizationInsights.employees.map((employee) => employee.org))).sort();
  const groupOptions = Array.from(new Set(organizationInsights.employees.map((employee) => employee.group))).sort();

  const openDialog = (title: string, description: string) => {
    setDialogTitle(title);
    setDialogDescription(description);
  };

  return (
    <div className="space-y-6">
      {dialogTitle ? (
        <MobileModalShell
          icon={<Building2 className="h-5 w-5" />}
          eyebrow="组织动作反馈"
          title={dialogTitle}
          onClose={() => setDialogTitle('')}
          panelClassName="max-w-lg"
        >
          <div className="rounded-[28px] border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
            {dialogDescription}
          </div>
        </MobileModalShell>
      ) : null}


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
              {orgOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              value={groupFilter}
              onChange={(event) => setGroupFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
            >
              <option>全部考勤组</option>
              {groupOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => openDialog('批量导入', '已打开组织导入流程占位。后续可在这里继续接 Excel / 企微同步导入，并校验工号、组织和考勤组映射。')}
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
