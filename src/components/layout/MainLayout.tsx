import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { TopNavbar } from './TopNavbar';
import { LeftSidebar } from './LeftSidebar';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { useGetUserProfileQuery } from '../../redux/features/user/userApi';
import { updateUser } from '../../redux/features/auth/authSlice';

const MainLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  
  // Fetch latest user profile to keep is_banned in sync
  const { data: userProfileData } = useGetUserProfileQuery(user?.user_id?.toString() || user?.userId?.toString() || '', {
    skip: !user,
  });

  useEffect(() => {
    if (user && userProfileData?.data) {
      if (userProfileData.data.is_banned !== user.is_banned) {
        dispatch(updateUser({ is_banned: userProfileData.data.is_banned }));
      }
    }
  }, [user, userProfileData, dispatch]);

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
