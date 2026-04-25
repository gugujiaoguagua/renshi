type ProfileVariant = 'employee' | 'manager' | 'admin';

type ProfileConfig = {
  badge: string;
  name: string;
  role: string;
  org: string;
  defaultView: string;
  loginAt: string;
  intro: string;
  infoGroups: Array<{
    title: string;
    items: string[];
  }>;
};

const profileConfigs: Record<ProfileVariant, ProfileConfig> = {
  employee: {
    badge: '员工工作台',
    name: '张三',
    role: '门店店员',
    org: '直营一店',
    defaultView: '员工视角',
    loginAt: '2026-04-25 08:52',
    intro: '你可以在这里查看个人信息、通知设置和异常处理规则，手机端会优先突出打卡与补卡。',
    infoGroups: [
      {
        title: '个人信息',
        items: ['姓名：张三', '角色：门店店员', '所属组织：直营一店', '默认视角：员工视角'],
      },
      {
        title: '通知设置',
        items: ['缺卡提醒：开启', '审批进度提醒：开启', '月底确认提醒：开启', '班次变更提醒：开启'],
      },
      {
        title: '常用说明',
        items: ['补卡默认截止到次月 2 号前', '外勤 / 出差需补充业务说明', '异常处理结果会同步到月报', '定位异常可联系主管协助核查'],
      },
    ],
  },
  manager: {
    badge: '主管工作台',
    name: '张建国',
    role: '技术二组主管',
    org: '总部研发中心',
    defaultView: '主管视角',
    loginAt: '2026-04-25 09:05',
    intro: '主管端优先呈现团队异常、补卡审批和排班风险，个人中心保留通知设置与处理边界说明。',
    infoGroups: [
      {
        title: '个人信息',
        items: ['姓名：张建国', '角色：技术二组主管', '所属组织：总部研发中心', '默认视角：主管视角'],
      },
      {
        title: '通知设置',
        items: ['补卡待审批提醒：开启', '团队异常提醒：开启', '未排班提醒：开启', '规则变更同步：开启'],
      },
      {
        title: '常用说明',
        items: ['主管审批会影响日报与月报结果', '驳回补卡必须填写原因', '团队异常建议在当日闭环', '排班缺失会被首页工作台持续提醒'],
      },
    ],
  },
  admin: {
    badge: '人事工作台',
    name: '李人事',
    role: '系统管理员',
    org: '总部',
    defaultView: '人事视角',
    loginAt: '2026-04-25 09:18',
    intro: '同一账号在手机和电脑端使用同一套系统，只是展示方式随设备变化。人事端会优先承接异常、月报和规则管理。',
    infoGroups: [
      {
        title: '个人信息',
        items: ['姓名：李人事', '角色：系统管理员', '所属组织：总部', '默认视角：人事视角'],
      },
      {
        title: '通知设置',
        items: ['异常提醒：开启', '审批消息：开启', '月报确认提醒：开启', '规则变更提醒：开启'],
      },
      {
        title: '常用说明',
        items: ['补卡默认截止到次月 2 号前', '外勤 / 出差需补充业务说明', '日报与月报统一口径', '关键改动会写入日志中心'],
      },
    ],
  },
};

export default function ProfilePage({ variant = 'admin' }: { variant?: ProfileVariant }) {
  const profile = profileConfigs[variant];

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white shadow-lg lg:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/15 text-2xl font-semibold">
              {profile.name.slice(0, 1)}
            </div>
            <div>
              <p className="text-sm text-slate-200">{profile.badge}</p>
              <h3 className="mt-1 text-2xl font-semibold">{profile.name}</h3>
              <p className="mt-2 text-sm text-slate-200">{profile.intro}</p>
            </div>
          </div>
          <div className="rounded-3xl bg-white/10 px-4 py-3 text-sm text-slate-100 backdrop-blur">
            最近登录：{profile.loginAt}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {profile.infoGroups.map((group) => (
          <div key={group.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
            <h3 className="text-lg font-semibold text-slate-900">{group.title}</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {group.items.map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3">
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: '当前角色', value: profile.role },
            { label: '所属组织', value: profile.org },
            { label: '默认视角', value: profile.defaultView },
            { label: '通知状态', value: '已开启' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-2 font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

