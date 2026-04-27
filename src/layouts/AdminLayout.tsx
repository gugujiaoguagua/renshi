import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Clock, Calendar, AlertCircle, FileClock, Bell } from 'lucide-react';
import { clsx } from 'clsx';
import RoleSwitchMenu from '../components/RoleSwitchMenu';


const navItems = [
  { name: '工作台', path: '/admin/dashboard', icon: LayoutDashboard, desc: '总览月报、异常与待处理事项' },
  { name: '组织与人员', path: '/admin/organization', icon: Users, desc: '维护组织关系与员工归属' },
  { name: '班次与规则', path: '/admin/rules', icon: Clock, desc: '统一配置班次、打卡与判定规则' },
  { name: '排班管理', path: '/admin/schedule', icon: Calendar, desc: '查看全局排班质量与缺失情况' },
  { name: '异常中心', path: '/admin/exceptions', icon: AlertCircle, desc: '集中处理异常、补卡与待确认记录' },
  { name: '日志中心', path: '/admin/logs', icon: FileClock, desc: '追溯规则调整、审批与人工修正' },
];

const layoutNotifications = [
  { title: '异常中心仍有 3 条高风险记录', detail: '建议优先处理迟到 45 分钟和补卡超时两类记录。', tone: 'border-red-100 bg-red-50 text-red-900' },
  { title: '技术二组班表待发布', detail: '组织归属刚调整，建议确认后重新发布本周班表。', tone: 'border-amber-100 bg-amber-50 text-amber-900' },
  { title: '月报模板已切到人事标准版', detail: '导出前可再检查字段模板与回写来源是否一致。', tone: 'border-blue-100 bg-blue-50 text-blue-900' },
];

export default function AdminLayout() {
  const location = useLocation();
  const activeItem = navItems.find((item) => location.pathname.startsWith(item.path)) ?? navItems[0];
  const [showNotifications, setShowNotifications] = useState(false);


  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="hidden w-80 shrink-0 flex-col border-r border-gray-200 bg-white px-5 py-6 md:flex">
        <RoleSwitchMenu currentRole="admin" />

        <nav className="mt-6 flex-1 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'group flex items-start rounded-2xl px-4 py-3 text-sm transition',
                  active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className={clsx('mr-3 mt-0.5 h-5 w-5 shrink-0', active ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500')} />
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className={clsx('mt-0.5 text-xs leading-5', active ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500')}>
                    {item.desc}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">李</div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">李人事</p>
              <p className="text-xs text-gray-500">系统管理员</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-gray-500">桌面端已恢复工作台侧栏，可继续从左侧导航和身份切换入口进入各模块。</p>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur md:static md:border-b">
          <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-gray-900">{activeItem.name}</h2>
              <p className="truncate text-sm text-gray-500">{activeItem.desc}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden w-72 rounded-xl border border-gray-200 bg-slate-50 shadow-sm lg:block">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input type="text" className="block w-full rounded-xl border-0 bg-transparent py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="搜索员工 / 工号 / 门店" />
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifications((current) => !current)}
                  className="relative rounded-full p-2 text-gray-400 transition hover:bg-slate-100 hover:text-gray-600"
                >
                  <span className="absolute right-2 top-2 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                  <Bell className="h-5 w-5" />
                </button>
                {showNotifications ? (
                  <div className="absolute right-0 top-12 z-30 w-80 rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.14)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">待处理提醒</p>
                        <p className="mt-1 text-xs text-slate-500">点击铃铛可收起，当前展示 3 条重点事项。</p>
                      </div>
                      <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">3 条</span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {layoutNotifications.map((item) => (
                        <div key={item.title} className={clsx('rounded-2xl border p-3 text-sm', item.tone)}>
                          <p className="font-semibold">{item.title}</p>
                          <p className="mt-2 leading-6 opacity-90">{item.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

          </div>

          <div className="px-4 pb-4 md:hidden">
            <RoleSwitchMenu currentRole="admin" />
          </div>
        </header>

        <div className="px-4 py-4 md:px-6 md:py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
