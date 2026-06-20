import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TopNavbar } from './TopNavbar';
import { LeftSidebar } from './LeftSidebar';

const MainLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Fixed Top Navbar */}
      <TopNavbar />
      
      {/* Main Content Area */}
      <div className="pt-14 w-full">
        {/* Fixed Left Sidebar (hidden on mobile) */}
        <LeftSidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
        
        {/* Scrollable Main Feed Area */}
        <main className={`transition-[margin] duration-300 ${isSidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[270px]'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
