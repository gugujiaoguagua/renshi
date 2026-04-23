import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './layouts/AppShell';
import DashboardPage from './pages/shared/Dashboard';
import RecordsPage from './pages/shared/Records';
import OrganizationPage from './pages/shared/Organization';
import RulesPage from './pages/shared/Rules';
import LogsPage from './pages/shared/Logs';
import ProfilePage from './pages/shared/Profile';
import PunchPage from './pages/employee/Home';
import ExceptionsPage from './pages/employee/Exceptions';
import SchedulePage from './pages/manager/Schedule';
import ApprovalPage from './pages/manager/Approval';
import MonthlyPage from './pages/admin/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/punch" element={<PunchPage />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/exceptions" element={<ExceptionsPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/approvals" element={<ApprovalPage />} />
          <Route path="/monthly" element={<MonthlyPage />} />
          <Route path="/organization" element={<OrganizationPage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
