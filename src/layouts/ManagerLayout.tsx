import { Outlet, Link, useLocation } from 'react-router-dom';
import { Users, Calendar, CheckSquare, User } from 'lucide-react';
import { clsx } from 'clsx';

export default function ManagerLayout() {
  const location = useLocation();
  
  return (
    <div className="max-w-[768px] mx-auto min-h-screen bg-gray-100 relative shadow-[0_0_15px_rgba(0,0,0,0.1)] pb-24">
      <Outlet />
      
      <nav className="fixed bottom-0 w-full max-w-[768px] bg-white border-t border-gray-200 flex justify-around items-center py-2 pb-safe z-50 shadow-lg">
        <Link 
          to="/manager/team" 
          className={clsx("flex flex-col items-center p-2", location.pathname === '/manager/team' ? "text-blue-600" : "text-gray-400 hover:text-gray-600")}
        >
          <Users className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">团队</span>
        </Link>
        <Link 
          to="/manager/schedule" 
          className={clsx("flex flex-col items-center p-2", location.pathname === '/manager/schedule' ? "text-blue-600" : "text-gray-400 hover:text-gray-600")}
        >
          <Calendar className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">排班</span>
        </Link>
        <Link 
          to="/manager/approval" 
          className={clsx("flex flex-col items-center p-2 relative", location.pathname === '/manager/approval' ? "text-blue-600" : "text-gray-400 hover:text-gray-600")}
        >
          <div className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
          <CheckSquare className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">审批</span>
        </Link>
        <Link 
          to="/manager/profile" 
          className={clsx("flex flex-col items-center p-2", location.pathname === '/manager/profile' ? "text-blue-600" : "text-gray-400 hover:text-gray-600")}
        >
          <User className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">我的</span>
        </Link>
      </nav>
    </div>
  );
}
