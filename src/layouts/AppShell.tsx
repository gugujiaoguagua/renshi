import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckSquare,
  Clock,
  FileClock,
  FileText,
  LayoutDashboard,
  User,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

export type Role = 'employee' | 'manager' | 'admin';

export type NavItem = {
  label: string;
  path: string;
  description: string;
  icon: LucideIcon;
  roles: Role[];
  mobile: boolean;
};

export type AppOutletContext = {
  role: Role;
  roleLabel: string;
  navItems: NavItem[];
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: '工作台',
    path: '/dashboard',
    description: '查看今日任务、异常与快捷入口',
    icon: LayoutDashboard,
    roles: ['employee', 'manager', 'admin'],
    mobile: true,
  },
  {
    label: '打卡',
    path: '/punch',
    description: '完成上下班、外勤与出差打卡',
    icon: Clock,
    roles: ['employee', 'manager', 'admin'],
    mobile: true,
  },
  {
    label: '记录',
    path: '/records',
    description: '查看个人打卡与日报明细',
    icon: Clock,
    roles: ['employee', 'manager', 'admin'],
    mobile: false,
  },
  {
    label: '异常',
    path: '/exceptions',
    description: '处理缺卡、迟到与补卡申请',
    icon: AlertCircle,
    roles: ['employee', 'manager', 'admin'],
    mobile: true,
  },
  {
    label: '排班',
    path: '/schedule',
    description: '查看团队排班并批量调整班次',
    icon: Calendar,
    roles: ['manager', 'admin'],
    mobile: false,
  },
  {
    label: '审批',
    path: '/approvals',
    description: '处理补卡与异常审批任务',
    icon: CheckSquare,
    roles: ['manager', 'admin'],
    mobile: false,
  },
  {
    label: '月报中心',
    path: '/monthly',
    description: '汇总月度结果并导出报表',
    icon: FileText,
    roles: ['admin'],
    mobile: false,
  },
  {
    label: '组织与人员',
    path: '/organization',
    description: '维护组织、岗位和人员归属',
    icon: Users,
    roles: ['admin'],
    mobile: false,
  },
  {
    label: '班次与规则',
    path: '/rules',
    description: '维护班次模板与考勤口径',
    icon: Clock,
    roles: ['admin'],
    mobile: false,
  },
  {
    label: '日志中心',
    path: '/logs',
    description: '查看规则修改、审批与人工调整记录',
    icon: FileClock,
    roles: ['admin'],
    mobile: false,
  },
  {
    label: '我的',
    path: '/profile',
    description: '查看个人信息、通知与常用说明',
    icon: User,
    roles: ['employee', 'manager', 'admin'],
    mobile: true,
  },
];

const ROLE_LABELS: Record<Role, string> = {
  employee: '员工视角',
  manager: '主管视角',
  admin: '人事视角',
};

const DEFAULT_ROLE: Role = 'manager';

function getStoredRole(): Role {
  if (typeof window === 'undefined') {
    return DEFAULT_ROLE;
  }

  const storedRole = window.localStorage.getItem('attendance-role');
  if (storedRole === 'employee' || storedRole === 'manager' || storedRole === 'admin') {
    return storedRole;
  }

  return DEFAULT_ROLE;
}

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>(getStoredRole);

  const availableItems = useMemo(
    () => NAV_ITEMS.filter((item) => item.roles.includes(role)),
    [role],
  );

  const mobileItems = useMemo(() => {
    return availableItems.filter((item) => item.mobile).slice(0, 4);
  }, [availableItems]);

  const currentItem =
    availableItems.find((item) => item.path === location.pathname) ?? availableItems[0];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('attendance-role', role);
    }
  }, [role]);

  useEffect(() => {
    const isCurrentPathAvailable = availableItems.some((item) => item.path === location.pathname);
    if (!isCurrentPathAvailable && availableItems[0]) {
      navigate(availableItems[0].path, { replace: true });
    }
  }, [availableItems, location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 lg:flex">
      <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white shadow-sm">
              考
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">统一考勤工作台</p>
              <h1 className="text-lg font-semibold text-slate-900">Attendance Web</h1>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-200 px-6 py-4">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
            当前身份
          </label>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as Role)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
          >
            <option value="employee">员工</option>
            <option value="manager">主管</option>
            <option value="admin">人事</option>
          </select>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            同一套系统按角色展示不同模块；手机端保留高频任务，电脑端展开完整管理能力。
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
          {availableItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'group flex items-start gap-3 rounded-2xl px-4 py-3 transition',
                  active
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )}
              >
                <Icon
                  className={clsx(
                    'mt-0.5 h-5 w-5 shrink-0',
                    active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500',
                  )}
                />
                <div>
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{ROLE_LABELS[role]}</p>
              <h2 className="text-lg font-semibold text-slate-900 lg:text-2xl">{currentItem?.label ?? '工作台'}</h2>
              <p className="hidden text-sm text-slate-500 md:block">
                {currentItem?.description ?? '统一处理打卡、异常、排班和月报。'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 lg:hidden">
                <span className="mr-2">身份</span>
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as Role)}
                  className="bg-transparent font-medium text-slate-700 outline-none"
                >
                  <option value="employee">员工</option>
                  <option value="manager">主管</option>
                  <option value="admin">人事</option>
                </select>
              </label>
              <button className="relative rounded-2xl border border-slate-200 bg-white p-3 text-slate-500 shadow-sm transition hover:text-slate-700">
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-400"></span>
                <Bell className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-4 pb-24 lg:px-6 lg:py-6 lg:pb-6">
          <Outlet context={{ role, roleLabel: ROLE_LABELS[role], navItems: availableItems }} />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-3xl grid-cols-4">
          {mobileItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex flex-col items-center justify-center gap-1 px-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 text-xs font-medium transition',
                  active ? 'text-blue-600' : 'text-slate-400',
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
