import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Clock, AlertCircle, User } from 'lucide-react';
import { clsx } from 'clsx';

export default function EmployeeLayout() {
  const location = useLocation();
  
  return (
    <div className="max-w-[414px] mx-auto min-h-screen bg-gray-100 relative shadow-[0_0_15px_rgba(0,0,0,0.1)] pb-20">
      <Outlet />
      
      <nav className="absolute bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center py-2 pb-safe z-50">
        <Link 
          to="/employee/home" 
          className={clsx("flex flex-col items-center p-2", location.pathname === '/employee/home' ? "text-blue-600" : "text-gray-400 hover:text-gray-600")}
        >
          <Home className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">首页</span>
        </Link>
        <Link 
          to="/employee/records" 
          className={clsx("flex flex-col items-center p-2", location.pathname === '/employee/records' ? "text-blue-600" : "text-gray-400 hover:text-gray-600")}
        >
          <Clock className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">记录</span>
        </Link>
        <Link 
          to="/employee/exceptions" 
          className={clsx("flex flex-col items-center p-2 relative", location.pathname === '/employee/exceptions' ? "text-blue-600" : "text-gray-400 hover:text-gray-600")}
        >
          <div className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
          <AlertCircle className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">异常</span>
        </Link>
        <Link 
          to="/employee/profile" 
          className={clsx("flex flex-col items-center p-2", location.pathname === '/employee/profile' ? "text-blue-600" : "text-gray-400 hover:text-gray-600")}
        >
          <User className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">我的</span>
        </Link>
      </nav>
    </div>
  );
}
