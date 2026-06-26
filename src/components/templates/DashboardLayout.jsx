import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../organisms/Sidebar';
import Header from '../organisms/Header';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    const storedValue = window.localStorage.getItem('resumeai.sidebarCollapsed');
    if (storedValue !== null) {
      return storedValue === 'true';
    }

    return window.innerWidth < 1200;
  });

  useEffect(() => {
    window.localStorage.setItem('resumeai.sidebarCollapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  return (
    <div className={`dashboard-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
      />
      <div className="dashboard-main">
        <Header
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((current) => !current)}
        />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
