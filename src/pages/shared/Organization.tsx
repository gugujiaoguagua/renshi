const departments = [
  { name: '总部', people: 86, note: '支持定位 / WiFi / 人脸混合打卡' },
  { name: '直营门店', people: 144, note: '多班次、轮班和门店定位是重点' },
  { name: '工厂', people: 72, note: '考勤机数据需统一接入结果层' },
];

const employees = [
  { name: '张三', code: 'E001', department: '技术部', post: '前端开发', org: '总部', shift: '标准班' },
  { name: '李四', code: 'E017', department: '运营部', post: '门店督导', org: '直营门店', shift: '门店晚班' },
  { name: '王五', code: 'E052', department: '生产部', post: '质检', org: '工厂', shift: '工厂早班' },
];

export default function OrganizationPage() {
  return (
    <div className="space-y-6">
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
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              placeholder="搜索员工姓名 / 工号"
            />
            <select className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white">
              <option>全部组织</option>
              <option>总部</option>
              <option>直营门店</option>
              <option>工厂</option>
            </select>
            <select className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white">
              <option>全部岗位</option>
              <option>门店主管</option>
              <option>总部职能</option>
              <option>工厂员工</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
              批量导入
            </button>
            <button className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
              新增员工
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {['姓名 / 工号', '部门', '岗位', '考勤组织', '默认班次', '操作'].map((item) => (
                  <th key={item} className="whitespace-nowrap px-5 py-4 text-left font-semibold">{item}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((employee) => (
                <tr key={employee.code} className="bg-white">
                  <td className="whitespace-nowrap px-5 py-4">
                    <div className="font-semibold text-slate-900">{employee.name}</div>
                    <div className="text-slate-500">{employee.code}</div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">{employee.department}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">{employee.post}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">{employee.org}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">{employee.shift}</td>
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-blue-700">编辑信息</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
