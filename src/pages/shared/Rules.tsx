import { useState } from 'react';
import { AlertCircle, CheckSquare, Clock } from 'lucide-react';

const shiftTemplates = [
  { name: '朝 9 晚 6', time: '09:00 - 18:00', note: '总部职能默认班次，直接按时间段命名，更容易让员工理解。' },
  { name: '门店晚班', time: '14:00 - 22:00', note: '适配门店轮班和门店支援场景。' },
  { name: '工厂早班', time: '08:00 - 17:00', note: '工厂考勤机结果统一并入口径层。' },
];

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

const ruleGroups = [
  {
    title: '结果优先级',
    range: '适用范围：全员',
    owner: '维护角色：人事 + 主管',
    desc: '对照第二阶段沟通，把请假、出差、外勤和打卡之间的优先级说明补到规则页里。',
    items: ['员工当天已有有效打卡时，打卡结果优先于请假单', '假期审批优先于出差 / 外勤；出差中插入请假时按请假覆盖对应天数，不要求员工拆多张单', '审批通过后自动回写日报、异常中心和月报'],
  },
  {
    title: '排班与班次',
    range: '适用范围：门店 / 工厂 / 总部',
    owner: '维护角色：主管 + 人事',
    desc: '把店长和门店最关心的排班场景补进规则说明，而不是只展示静态模板。',
    items: ['支持引用上周 / 上月排班模板快速套用', '未排班时允许员工提交自选班次，主管审批后生效', '班次名称直接写成朝 9 晚 6、14:00 - 22:00 等直观时间段'],
  },
  {
    title: '外勤权限',
    range: '适用范围：外勤岗位 / 门店支援',
    owner: '维护角色：人事 + 组织管理员',
    desc: '把外勤是否免审批、是否开放外勤卡权限也放到考勤组规则里统一管理。',
    items: ['可按考勤组配置“允许直接外勤打卡”或“必须审批后生效”', '门店 / 外勤岗位可开放外勤卡权限，不必所有场景都走审批', '外勤免审批时仍需保留地点、时间和场景说明，便于月报追溯'],
  },
  {
    title: '异常判定',
    range: '适用范围：异常中心 / 月报',
    owner: '维护角色：人事',
    desc: '迟到、早退、缺卡、旷工统一在这里维护，不再散落到多套端口中。',
    items: ['缺少班次时标记待确认，不能默认正常', '外勤、出差作为合法场景参与判定', '店长未排班触发的自选班次可修正缺卡 / 迟到口径'],
  },
  {
    title: '导出口径',
    range: '适用范围：日报 / 月报 / 导出',
    owner: '维护角色：人事 + 财务协同',
    desc: '月报字段与日报明细保持一致，确保人事可直接核查和追溯。',
    items: ['应出勤 / 实际出勤 / 计薪天数统一', '支持组织、门店、员工维度筛选', '异常状态支持穿透到日明细'],
  },
];

export default function RulesPage() {
  const [ruleVersions, setRuleVersions] = useState(initialRuleVersions);
  const [actionMessage, setActionMessage] = useState('');

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
    setActionMessage('新规则版本草稿已创建，当前可继续补充生效范围、负责人和变更摘要。');
  };

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

      {actionMessage ? (
        <section className="rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900 shadow-sm">
          <p className="font-semibold">规则动作已生效</p>
          <p className="mt-2 leading-6">{actionMessage}</p>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
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
            {ruleVersions.map((item) => (
              <div key={`${item.version}-${item.status}`} className={`rounded-2xl border p-4 ${item.tone}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{item.version}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold">{item.status}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold opacity-90">
                  <span className="rounded-full bg-white px-3 py-1">{item.scope}</span>
                  <span className="rounded-full bg-white px-3 py-1">发布人：{item.owner}</span>
                </div>
                <p className="mt-3 text-sm leading-6 opacity-90">{item.highlight}</p>
              </div>
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

        <section className="space-y-4">
          {ruleGroups.map((group) => (
            <div key={group.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-900">{group.title}</h3>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{group.range}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{group.owner}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-500">{group.desc}</p>
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
