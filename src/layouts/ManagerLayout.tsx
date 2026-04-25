import { Outlet, Link, useLocation } from 'react-router-dom';
import { Users, Calendar, CheckSquare, User, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import RoleSwitchMenu from '../components/RoleSwitchMenu';

type NavItem = {
  name: string;
  mobileName: string;
  path: string;
  icon: typeof Users;
  desc: string;
  badge?: string;
  matches?: string[];
};

const navItems: NavItem[] = [
  { name: '主管工作台', mobileName: '工作台', path: '/manager/team', icon: Users, desc: '优先处理团队异常、待审批与月报跟进', matches: ['/manager/team-exceptions', '/manager/monthly-report'] },

  { name: '排班管理', mobileName: '排班', path: '/manager/schedule', icon: Calendar, desc: '查看未排班与下周班次安排' },
  { name: '待审批中心', mobileName: '审批', path: '/manager/approval', icon: CheckSquare, desc: '先处理补卡与异常审批', badge: '3' },
  { name: '个人中心', mobileName: '我的', path: '/manager/profile', icon: User, desc: '查看主管个人信息与设置' },
];

export default function ManagerLayout() {
  const location = useLocation();
  const isActivePath = (item: NavItem) => [item.path, ...(item.matches ?? [])].some((path) => location.pathname.startsWith(path));

  return (
    <>
      <div className="mx-auto min-h-screen max-w-[414px] bg-slate-50 pb-24 shadow-[0_0_15px_rgba(0,0,0,0.08)] md:hidden">
        <Outlet />

        <nav className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-[414px] -translate-x-1/2 items-center justify-around border-t border-gray-200 bg-white/95 py-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur">
          {navItems.map((item) => {
            const active = isActivePath(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'relative flex min-w-[76px] flex-col items-center rounded-2xl px-3 py-2 transition',
                  active ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                )}
              >
                {item.badge && (
                  <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
                    {item.badge}
                  </span>
                )}
                <item.icon className="mb-1 h-5 w-5" />
                <span className="text-xs font-medium">{item.mobileName}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="hidden min-h-screen bg-slate-100 md:flex">
        <aside className="flex w-80 shrink-0 flex-col border-r border-slate-200 bg-white px-5 py-6 shadow-sm">
          <RoleSwitchMenu currentRole="manager" />

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => {
              const active = isActivePath(item);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    'group flex items-start gap-3 rounded-2xl px-4 py-3 transition',
                    active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <div className={clsx('mt-0.5 rounded-2xl p-2', active ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400 group-hover:text-slate-600')}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{item.name}</p>
                      {item.badge ? <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">{item.badge}</span> : null}
                    </div>
                    <p className={clsx('mt-1 text-xs leading-5', active ? 'text-indigo-500' : 'text-slate-400')}>
                      {item.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-3xl bg-indigo-600 p-4 text-white shadow-[0_18px_40px_rgba(79,70,229,0.22)]">
            <div className="flex items-center gap-2 text-indigo-100">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.24em]">当前焦点</span>
            </div>
            <h3 className="mt-3 text-lg font-semibold">先把团队异常清掉</h3>
            <p className="mt-2 text-sm leading-6 text-indigo-100">今天有 5 条团队异常、3 条待审批，建议先处理异常，再去补齐排班。</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto bg-slate-100">
          <div className="mx-auto max-w-6xl px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}
