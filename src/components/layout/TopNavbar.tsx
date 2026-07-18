import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logOut, useCurrentToken, selectCurrentUser } from '../../redux/features/auth/authSlice';
import { useGetUserNotificationsQuery } from '../../redux/features/notification/notificationApi';
import LogoIcon from '../../assets/logo/logo-icon';
import { User, LogOut, Plus, Bell } from 'lucide-react';
import NotificationItem from './NotificationItem';
import type { INotification } from '../../redux/features/notification/notificationApi';

export const TopNavbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const token = useAppSelector(useCurrentToken);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: notifData } = useGetUserNotificationsQuery(undefined, { skip: !user || !token, pollingInterval: 5000 });
  const notifications = notifData?.data || [];
  const unreadCount = notifications.filter((n: INotification) => !n.is_read).length;

  const handleLogout = () => {
    dispatch(logOut());
    setIsDropdownOpen(false);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50 px-4 flex items-center justify-between">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2 group hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <LogoIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 hidden sm:block tracking-tight">Jonomot</span>
        </Link>
      </div>

      {/* Middle: Search Box */}
      <div className="flex-1 max-w-[600px] mx-4 hidden md:block">
        <form
          className="relative"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const input = form.elements.namedItem('q') as HTMLInputElement;
            if (input.value.trim()) {
              navigate(`/search?q=${encodeURIComponent(input.value.trim())}`);
            }
          }}
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input
            type="text"
            name="q"
            placeholder="Search Jonomot"
            className="w-full bg-gray-100 border border-transparent text-gray-900 text-sm rounded-full focus:ring-primary focus:border-primary block pl-10 p-2.5 outline-none hover:bg-gray-200 transition-colors"
          />
        </form>
      </div>

      {/* Right: Auth Actions */}
      <div className="flex items-center gap-3">
        {user && token ? (
          <div className="flex items-center gap-4">

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                className="text-gray-600 hover:bg-gray-100 p-2 rounded-full relative"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 top-12 mt-1 w-80 bg-white border border-gray-200 rounded-md shadow-lg py-2 z-50 max-h-[400px] overflow-y-auto">
                  <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Notifications</h3>
                  </div>
                  <div className="flex flex-col">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-6 text-center text-sm text-gray-500">No notifications yet.</p>
                    ) : (
                      notifications.map((notif: INotification) => (
                        <NotificationItem 
                          key={notif.notification_id} 
                          notification={notif} 
                          onClose={() => setIsNotifOpen(false)} 
                        />
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 relative" ref={dropdownRef}>
              {user?.role !== 'admin' && !user?.is_banned && (
                <Link to="/create" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 font-medium transition-colors">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Create</span>
                </Link>
              )}
              <button className="text-gray-600 hover:bg-gray-100 p-2 rounded-full hidden sm:block">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
              </button>
              <div
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 cursor-pointer rounded-full py-1 px-3 transition-colors"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold uppercase">
                  {user.email?.charAt(0) || 'U'}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden lg:block">Profile</span>
              </div>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-12 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      if (user?.user_id || user?.userId) {
                        navigate(`/u/${user.user_id || user.userId}`);
                      }
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                  >
                    <User className="w-4 h-4 text-gray-500" />
                    {user?.role === 'admin' ? 'View Dashboard' : 'View Profile'}
                  </button>
                  {/* <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3">
                  <Sun className="w-4 h-4 text-gray-500" />
                  Display Mode
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3">
                  <Settings className="w-4 h-4 text-gray-500" />
                  Settings
                </button> */}
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-3"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/login')}
              className="bg-[#f5f6f7] hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-full text-sm transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-full text-sm transition-colors"
            >
              Sign up
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

