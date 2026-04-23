const infoGroups = [
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
];

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white shadow-lg lg:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/15 text-2xl font-semibold">李</div>
            <div>
              <p className="text-sm text-slate-200">统一考勤工作台</p>
              <h3 className="mt-1 text-2xl font-semibold">李人事</h3>
              <p className="mt-2 text-sm text-slate-200">同一账号在手机和电脑端使用同一套系统，只是展示方式随设备变化。</p>
            </div>
          </div>
          <div className="rounded-3xl bg-white/10 px-4 py-3 text-sm text-slate-100 backdrop-blur">
            最近登录：2026-04-23 14:20
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {infoGroups.map((group) => (
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
    </div>
  );
}
