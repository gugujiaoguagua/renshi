const logItems = [
  {
    type: '规则修改',
    operator: '李人事',
    time: '2026-04-23 09:12',
    target: '工厂早班模板',
    detail: '将上班容差从 5 分钟调整为 10 分钟，计划 18:00 生效。',
  },
  {
    type: '审批通过',
    operator: '张主管',
    time: '2026-04-23 10:20',
    target: '张三补卡申请',
    detail: '通过迟到补卡，系统已回写日报和月报结果。',
  },
  {
    type: '人工修正',
    operator: '王人事',
    time: '2026-04-22 19:45',
    target: '直营二店月报异常',
    detail: '批量修正 3 名员工的外勤说明状态，并补充日志备注。',
  },
];

export default function LogsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="grid gap-4 md:grid-cols-4 xl:flex xl:flex-wrap">
            <select className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white">
              <option>全部操作类型</option>
              <option>规则修改</option>
              <option>审批处理</option>
              <option>人工修正</option>
            </select>
            <input
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              placeholder="搜索操作对象"
            />
            <input
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              placeholder="操作人"
            />
            <input
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              placeholder="时间范围"
            />
          </div>
          <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
            导出日志
          </button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr,0.92fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-lg font-semibold text-slate-900">最近操作</h3>
          <div className="mt-5 space-y-4">
            {logItems.map((item) => (
              <div key={`${item.time}-${item.target}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{item.type}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.target}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">{item.time}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.detail}</p>
                <p className="mt-3 text-sm text-slate-500">操作人：{item.operator}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-lg font-semibold text-slate-900">留痕要求</h3>
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            {[
              '规则改动必须记录操作人、时间、变更前后差异。',
              '补卡审批需要保留审批链路和驳回原因。',
              '人工修正必须说明原因，支持后续回溯。',
              '月报导出前后的确认动作建议写入日志。',
            ].map((item) => (
              <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
