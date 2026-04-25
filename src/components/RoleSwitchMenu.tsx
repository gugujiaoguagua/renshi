import { Link } from 'react-router-dom';
import { ChevronDown, Monitor } from 'lucide-react';
import { clsx } from 'clsx';

type RoleKey = 'employee' | 'manager' | 'admin';

type RoleOption = {
  key: RoleKey;
  badge: string;
  label: string;
  entry: string;
  desc: string;
  badgeClassName: string;
};

const roleOptions: RoleOption[] = [
  {
    key: 'employee',
    badge: '打',
    label: '员工工作台',
    entry: '/employee/home',
    desc: '打卡、记录、异常处理',
    badgeClassName: 'bg-blue-600 text-white',
  },
  {
    key: 'manager',
    badge: '管',
    label: '主管工作台',
    entry: '/manager/team',
    desc: '团队异常、审批与排班',
    badgeClassName: 'bg-indigo-600 text-white',
  },
  {
    key: 'admin',
    badge: 'A',
    label: '人事工作台',
    entry: '/admin/dashboard',
    desc: '总览、规则、异常中心',
    badgeClassName: 'bg-slate-900 text-white',
  },
];

export default function RoleSwitchMenu({ currentRole }: { currentRole: RoleKey }) {
  const current = roleOptions.find((item) => item.key === currentRole) ?? roleOptions[0];
  const others = roleOptions.filter((item) => item.key !== currentRole);

  return (
    <details className="group rounded-3xl [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl p-2 transition hover:bg-slate-50">
        <div className={clsx('flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold shadow-sm', current.badgeClassName)}>
          {current.badge}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">{current.label}</p>
          <h1 className="truncate text-lg font-semibold text-slate-900">Attendance Web</h1>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 transition group-open:rotate-180">
          <ChevronDown className="h-4 w-4" />
        </div>
      </summary>

      <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Monitor className="h-4 w-4 text-blue-600" />
          测试切换身份
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-500">应用还未上线，当前这里作为测试入口。点击下面卡片可直接切到另外两个身份视角。</p>

        <div className="mt-4 space-y-2">
          {others.map((item) => (
            <Link
              key={item.key}
              to={item.entry}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
            >
              <div className={clsx('flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold', item.badgeClassName)}>
                {item.badge}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </details>
  );
}
