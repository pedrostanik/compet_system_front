import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/AuthContext';
import PrivateRoute from '@/components/PrivateRoute';
import Sidebar from '@/components/layout/Sidebar';
import LoginPage from '@/pages/LoginPage';
import CustomersPage from '@/pages/CustomersPage';
import CustomerDetailPage from '@/pages/CustomerDetailPage';
import SchedulingPage from '@/pages/SchedulingPage';
import PackPage from '@/pages/PackPage';
import ReportPage from '@/pages/ReportPage';
import ProtocolPage from '@/pages/ProtocolPage';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 pt-16 md:pt-6 bg-gray-50">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/customers" />} />
          <Route path="/customers" element={<PrivateRoute><Layout><CustomersPage /></Layout></PrivateRoute>} />
          <Route path="/customers/:id" element={<PrivateRoute><Layout><CustomerDetailPage /></Layout></PrivateRoute>} />
           <Route path="/scheduling" element={<PrivateRoute><Layout><SchedulingPage /></Layout></PrivateRoute>} />
          <Route path="/protocol" element={<PrivateRoute><Layout><ProtocolPage /></Layout></PrivateRoute>} />
           <Route path="/pack" element={<PrivateRoute><Layout><PackPage /></Layout></PrivateRoute>} />
          <Route path="/report" element={<PrivateRoute><Layout><ReportPage /></Layout></PrivateRoute>} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}
