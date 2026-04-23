import { Link, useOutletContext } from 'react-router-dom';
import { AlertCircle, Calendar, CheckSquare, Clock } from 'lucide-react';
import type { AppOutletContext, Role } from '../../layouts/AppShell';

const roleSummary: Record<Role, { label: string; value: string; tone: string }[]> = {
  employee: [
    { label: '今日班次', value: '早班 A班', tone: 'bg-blue-50 text-blue-700' },
    { label: '待处理异常', value: '1 条', tone: 'bg-amber-50 text-amber-700' },
    { label: '本月出勤', value: '18.5 天', tone: 'bg-emerald-50 text-emerald-700' },
    { label: '补卡进度', value: '1 条审批中', tone: 'bg-slate-100 text-slate-700' },
  ],
  manager: [
    { label: '今日团队出勤', value: '28 / 31', tone: 'bg-blue-50 text-blue-700' },
    { label: '待审批', value: '3 条', tone: 'bg-amber-50 text-amber-700' },
    { label: '未排班', value: '2 人', tone: 'bg-red-50 text-red-700' },
    { label: '本月异常率', value: '6.8%', tone: 'bg-slate-100 text-slate-700' },
  ],
  admin: [
    { label: '统计人数', value: '302 人', tone: 'bg-blue-50 text-blue-700' },
    { label: '今日异常', value: '17 条', tone: 'bg-red-50 text-red-700' },
    { label: '待确认月报', value: '2 个组织', tone: 'bg-amber-50 text-amber-700' },
    { label: '规则变更提醒', value: '1 项待生效', tone: 'bg-slate-100 text-slate-700' },
  ],
};

const roleTasks: Record<Role, { title: string; desc: string; icon: typeof Clock }[]> = {
  employee: [
    { title: '今日下班打卡', desc: '18:00 前在公司 100m 内完成', icon: Clock },
    { title: '补卡截止提醒', desc: '5 月 19 日缺卡需在今晚 20:00 前处理', icon: AlertCircle },
    { title: '本周记录复核', desc: '确认外勤与出差记录是否完整', icon: Calendar },
  ],
  manager: [
    { title: '完成下周排班', desc: '技术二组仍有 2 人未排班', icon: Calendar },
    { title: '处理补卡审批', desc: '3 条申请待你确认', icon: CheckSquare },
    { title: '关注高风险异常', desc: '2 名员工本月异常已超过 3 次', icon: AlertCircle },
  ],
  admin: [
    { title: '复核月报口径', desc: '直营门店月报待最终确认', icon: CheckSquare },
    { title: '处理异常积压', desc: '跨月补卡申请还有 4 条未闭环', icon: AlertCircle },
    { title: '规则发布提醒', desc: '工厂班次模板今日 18:00 生效', icon: Calendar },
  ],
};


export default function DashboardPage() {
  const { role, roleLabel, navItems } = useOutletContext<AppOutletContext>();
  const shortcuts = navItems.filter((item) => !['/dashboard', '/profile'].includes(item.path));

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-800 to-blue-700 px-5 py-6 text-white shadow-lg lg:px-8 lg:py-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-blue-100">{roleLabel}</p>
            <h3 className="mt-2 text-2xl font-semibold lg:text-3xl">同一套系统，手机端做高频任务，电脑端展开完整工作台</h3>
            <p className="mt-3 text-sm leading-6 text-blue-100/90 lg:text-base">
              这里不再拆成员工端、主管端、人事端三套产品，而是在统一系统里按角色显示功能范围，界面会随屏幕尺寸自动切换成更适合手机或电脑的布局。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-[24px] bg-white/10 p-4 backdrop-blur sm:grid-cols-4 lg:min-w-[420px]">
            {roleSummary[role].map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/10 p-3">
                <p className="text-xs text-blue-100">{item.label}</p>
                <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {roleSummary[role].map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.tone}`}>
              {item.label}
            </span>
            <p className="mt-4 text-2xl font-semibold text-slate-900">{item.value}</p>
            <p className="mt-2 text-sm text-slate-500">直接进入对应模块可以继续查看明细、处理异常或完成配置。</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.25fr,0.75fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">常用入口</h3>
              <p className="mt-1 text-sm text-slate-500">手机端底部只放高频项，其他模块统一放在工作台里。</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {shortcuts.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{item.label}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-lg font-semibold text-slate-900">今日待办</h3>
          <p className="mt-1 text-sm text-slate-500">根据当前身份给出最重要的三件事。</p>

          <div className="mt-5 space-y-3">
            {roleTasks[role].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
