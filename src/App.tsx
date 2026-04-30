import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';

import EmployeeLayout from './layouts/EmployeeLayout';
import ManagerLayout from './layouts/ManagerLayout';
import AdminLayout from './layouts/AdminLayout';
import EmployeeHome from './pages/employee/Home';
import EmployeeExceptions from './pages/employee/Exceptions';
import EmployeeApply from './pages/employee/Apply';
import EmployeeMonthlySummary from './pages/employee/MonthlySummary';
import ManagerTeam from './pages/manager/Team';
import ManagerSchedule from './pages/manager/Schedule';
import ManagerApproval from './pages/manager/Approval';
import ManagerTeamExceptions from './pages/manager/TeamExceptions';
import ManagerMonthlyReport from './pages/manager/MonthlyReport';
import AdminDashboard from './pages/admin/Dashboard';
import AdminExceptions from './pages/admin/Exceptions';
import AdminSchedule from './pages/admin/Schedule';
import RecordsPage from './pages/shared/Records';
import OrganizationPage from './pages/shared/Organization';
import RulesPage from './pages/shared/Rules';
import LogsPage from './pages/shared/Logs';




const roleEntries = [

  {
    title: '员工端',
    desc: '先打卡，再处理异常和补卡。',
    to: '/employee/home',
    className: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    badge: '移动端优先',
  },
  {
    title: '主管端',
    desc: '优先看待审批、团队异常和排班。',
    to: '/manager/team',
    className: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
    badge: '主管工作台',
  },
  {
    title: '人事端',
    desc: '聚焦月报、异常汇总和导出处理。',
    to: '/admin/dashboard',
    className: 'bg-gray-900 text-white hover:bg-gray-800',
    badge: 'Web 后台',
  },
];

function RoleSelector() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_1.4fr]">
          <section className="rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">考勤打卡系统</h1>
            <p className="mt-3 text-sm leading-6 text-gray-500">
              当前首页已按角色重构为不同工作台，重点是让员工先打卡、主管先处理、人事先看风险与月报。
            </p>

            <div className="mt-8 space-y-4 rounded-2xl bg-slate-50 p-5">
              <div>
                <p className="text-sm font-semibold text-gray-900">这次优化后的首页重点</p>
                <p className="mt-1 text-sm text-gray-500">把首页从信息展示页，调整为任务处理入口页。</p>
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>员工：首页首屏优先打卡与异常处理</li>
                <li>主管：首页优先承接待审批、团队异常与排班</li>
                <li>人事：首页聚焦月报中心、异常汇总与导出</li>
              </ul>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">选择角色入口</h2>
                <p className="mt-1 text-sm text-gray-500">建议按真实使用身份体验首页优先级。</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">P0 首页优化已接入</span>
            </div>

            <div className="space-y-4">
              {roleEntries.map((item) => (
                <Link
                  key={item.title}
                  to={item.to}
                  className={`group block rounded-3xl border border-gray-100 px-5 py-5 transition hover:-translate-y-0.5 hover:shadow-lg ${item.className}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold">{item.title}</div>
                      <p className="mt-2 text-sm opacity-80">{item.desc}</p>
                    </div>
                    <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-current">{item.badge}</span>
                  </div>
                  <div className="mt-4 text-sm font-medium opacity-90">进入首页</div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelector />} />

        <Route path="/employee" element={<EmployeeLayout />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<EmployeeHome />} />
          <Route path="records" element={<RecordsPage />} />
          <Route path="exceptions" element={<EmployeeExceptions />} />
          <Route path="apply" element={<EmployeeApply />} />
          <Route path="monthly-summary" element={<EmployeeMonthlySummary />} />
        </Route>

        <Route path="/manager" element={<ManagerLayout />}>
          <Route index element={<Navigate to="team" replace />} />
          <Route path="team" element={<ManagerTeam />} />
          <Route path="records" element={<RecordsPage variant="manager" />} />
          <Route path="team-exceptions" element={<ManagerTeamExceptions />} />
          <Route path="schedule" element={<ManagerSchedule />} />
          <Route path="approval" element={<ManagerApproval />} />
          <Route path="monthly-report" element={<ManagerMonthlyReport />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="overview" element={<AdminDashboard />} />
          <Route path="organization" element={<OrganizationPage />} />
          <Route path="rules" element={<RulesPage />} />
          <Route path="records" element={<RecordsPage variant="admin" />} />
          <Route path="schedule" element={<AdminSchedule />} />
          <Route path="exceptions" element={<AdminExceptions />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="logs" element={<LogsPage />} />
        </Route>



        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
