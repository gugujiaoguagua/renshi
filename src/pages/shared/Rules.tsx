import { AlertCircle, CheckSquare, Clock } from 'lucide-react';

const shiftTemplates = [
  { name: '总部标准班', time: '09:00 - 18:00', note: '支持定位 / WiFi / 人脸打卡' },
  { name: '门店晚班', time: '14:00 - 22:00', note: '适配门店定位和轮班场景' },
  { name: '工厂早班', time: '08:00 - 17:00', note: '需对接考勤机导入结果' },
];

const ruleGroups = [
  {
    title: '异常判定',
    desc: '迟到、早退、缺卡、旷工等统一在这里维护，不再散落到多套端口中。',
    items: ['缺少班次时标记待确认，不能默认正常', '外勤、出差作为合法场景参与判定', '审批通过后自动回写日报与月报'],
  },
  {
    title: '补卡时效',
    desc: '补卡规则建议固定到统一口径，减少跨组织理解差异。',
    items: ['默认截止到次月 2 号前', '驳回必须有原因', '逾期申请自动高亮风险'],
  },
  {
    title: '导出口径',
    desc: '月报字段与日报明细保持一致，确保人事可直接核查和追溯。',
    items: ['应出勤 / 实际出勤 / 计薪天数统一', '支持组织、门店、员工维度筛选', '异常状态支持穿透到日明细'],
  },
];

export default function RulesPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        {shiftTemplates.map((item) => (
          <div key={item.name} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">班次模板</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{item.name}</p>
            <p className="mt-2 text-sm font-medium text-blue-700">{item.time}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{item.note}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">规则发布提醒</h3>
              <p className="mt-1 text-sm text-slate-500">规则页要有版本感和风险提示，而不是一张超长表单。</p>
            </div>
            <button className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
              新建规则版本
            </button>
          </div>

          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <div className="flex gap-3 rounded-2xl bg-amber-50 p-4 text-amber-900">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <p className="leading-6">工厂班次模板将于今天 18:00 生效，生效后会影响 72 名员工的日报判定。</p>
            </div>
            <div className="flex gap-3 rounded-2xl bg-slate-50 p-4">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
              <p className="leading-6">上一次规则发布时间：2026-04-18 14:00，由李人事发布。</p>
            </div>
            <div className="flex gap-3 rounded-2xl bg-slate-50 p-4">
              <CheckSquare className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
              <p className="leading-6">建议规则变更后自动生成对比说明，避免人事和主管理解偏差。</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          {ruleGroups.map((group) => (
            <div key={group.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
              <h3 className="text-lg font-semibold text-slate-900">{group.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{group.desc}</p>
              <div className="mt-4 space-y-3">
                {group.items.map((item) => (
                  <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
