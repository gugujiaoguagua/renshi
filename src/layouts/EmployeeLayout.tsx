import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Clock, AlertCircle, User } from 'lucide-react';
import { clsx } from 'clsx';
import RoleSwitchMenu from '../components/RoleSwitchMenu';

type NavItem = {
  name: string;
  mobileName: string;
  path: string;
  icon: typeof Home;
  desc: string;
  badge?: string;
  matches?: string[];
};

const navItems: NavItem[] = [
  { name: '首页打卡', mobileName: '打卡', path: '/employee/home', icon: Home, desc: '先完成今日打卡，再处理异常' },
  { name: '打卡记录', mobileName: '记录', path: '/employee/records', icon: Clock, desc: '查看最近出勤记录与时间点' },
  { name: '异常处理', mobileName: '异常', path: '/employee/exceptions', icon: AlertCircle, desc: '补卡、申诉与月底确认', badge: '1' },
  { name: '个人中心', mobileName: '我的', path: '/employee/profile', icon: User, desc: '查看个人资料与账号信息' },
];

export default function EmployeeLayout() {
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
                  'relative flex min-w-[68px] flex-col items-center rounded-2xl px-3 py-2 transition',
                  active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
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
        <aside className="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white px-5 py-6 shadow-sm">
          <RoleSwitchMenu currentRole="employee" />

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => {
              const active = isActivePath(item);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    'group flex items-start gap-3 rounded-2xl px-4 py-3 transition',
                    active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <div className={clsx('mt-0.5 rounded-2xl p-2', active ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:text-slate-600')}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{item.name}</p>
                      {item.badge ? <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">{item.badge}</span> : null}
                    </div>
                    <p className={clsx('mt-1 text-xs leading-5', active ? 'text-blue-500' : 'text-slate-400')}>
                      {item.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-3xl bg-slate-900 p-4 text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
            <p className="text-xs uppercase tracking-[0.24em] text-blue-200">当前焦点</p>
            <h3 className="mt-3 text-lg font-semibold">先打卡，再补异常</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">今天还有 1 条缺卡待处理，建议完成打卡后直接进入异常页补充说明。</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto bg-slate-100">
          <div className="mx-auto max-w-5xl px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}
