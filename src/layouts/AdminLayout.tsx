import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Clock, Calendar, AlertCircle, FileText, FileClock, Bell } from 'lucide-react';
import { clsx } from 'clsx';

export default function AdminLayout() {
  const location = useLocation();

  const navItems = [
    { name: '全局总览', path: '/admin/overview', icon: LayoutDashboard },
    { name: '组织与人员', path: '/admin/organization', icon: Users },
    { name: '班次与规则', path: '/admin/rules', icon: Clock },
    { name: '排班管理', path: '/admin/schedule', icon: Calendar },
    { name: '异常中心', path: '/admin/exceptions', icon: AlertCircle },
    { name: '月报中心', path: '/admin/dashboard', icon: FileText },
    { name: '日志中心', path: '/admin/logs', icon: FileClock },
  ];

  return (
    <div className="bg-gray-50 flex h-screen overflow-hidden">
      {/* 左侧侧边栏 */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-2">
            <span className="text-white font-bold">A</span>
          </div>
          <span className="text-lg font-bold text-gray-900">考勤管理后台</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg group transition",
                location.pathname === item.path 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className={clsx("w-5 h-5 mr-3", location.pathname === item.path ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500")} />
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition -m-2">
            <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              李
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">李人事</p>
              <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">系统管理员</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50 overflow-hidden">
        {/* 顶部导航 */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center">
            <h2 className="text-lg font-medium text-gray-900">月报中心</h2>
            <span className="mx-3 text-gray-300">|</span>
            <div className="relative rounded-md shadow-sm w-64 hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input type="text" className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-1.5 border" placeholder="搜索员工姓名 / 工号" />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-gray-500 relative transition">
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              <Bell className="h-6 w-6" />
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
