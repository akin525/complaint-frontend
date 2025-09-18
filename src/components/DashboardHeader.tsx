import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import {
  Menu,
  ChevronDown,
  Search,
  Moon,
  Sun,
  Bell,
  Settings,
  User,
  LogOut,
  HelpCircle,
  Shield,
  X,
  Command
} from "lucide-react";
import { useUser } from "@/context/UserContext.tsx";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  time: string;
  read: boolean;
}

export default function DashboardHeader({
                                          setSidebarOpen,
                                        }: {
  setSidebarOpen: (open: boolean) => void;
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(() =>
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
  );

  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Mock notifications - replace with real data
  const [notifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Complaint Updated",
      message: "Your complaint #123 has been reviewed",
      type: "info",
      time: "2 min ago",
      read: false
    },
    {
      id: 2,
      title: "New Response",
      message: "Staff responded to your complaint",
      type: "success",
      time: "1 hour ago",
      read: false
    },
    {
      id: 3,
      title: "System Maintenance",
      message: "Scheduled maintenance tonight",
      type: "warning",
      time: "3 hours ago",
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    navigate("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    searchRef.current?.focus();
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target as Node)) {
        setNotificationMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      // Escape to close dropdowns
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setNotificationMenuOpen(false);
        setSearchFocused(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'staff': return 'bg-blue-500';
      case 'student': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/complaints')) return 'Complaints';
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/profile')) return 'Profile';
    if (path.includes('/settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
      <header className="sticky top-0 z-40 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm transition-all duration-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Toggle */}
              <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
                  aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Page Title - Hidden on mobile */}
              <div className="hidden sm:block">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {getPageTitle()}
                </h1>
              </div>
            </div>

            {/* Center - Search */}
            <div className="flex-1 max-w-2xl mx-4">
              <form onSubmit={handleSearch} className="relative">
                <div className={`relative transition-all duration-200 ${
                    searchFocused ? 'transform scale-105' : ''
                }`}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                      ref={searchRef}
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      placeholder="Search complaints, responses..."
                      className="w-full pl-10 pr-12 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  />
                  {searchQuery && (
                      <button
                          type="button"
                          onClick={clearSearch}
                          className="absolute inset-y-0 right-8 flex items-center pr-2"
                      >
                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </button>
                  )}
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                      <Command className="h-3 w-3 mr-1" />
                      K
                    </kbd>
                  </div>
                </div>
              </form>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2">
              {/* Theme Toggle */}
              <button
                  onClick={() => setIsDark(!isDark)}
                  className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
                  title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* Notifications */}
              <div className="relative" ref={notificationMenuRef}>
                <button
                    onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
                    className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
                    title="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationMenuOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl ring-1 ring-gray-200 dark:ring-gray-700 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Notifications
                          </h3>
                          {unreadCount > 0 && (
                              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          {unreadCount} new
                        </span>
                          )}
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                                        !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                    }`}
                                >
                                  <div className="flex items-start space-x-3">
                                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {notification.title}
                                      </p>
                                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                        {notification.message}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        {notification.time}
                                      </p>
                                    </div>
                                    {!notification.read && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    )}
                                  </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No notifications yet</p>
                            </div>
                        )}
                      </div>
                      {notifications.length > 0 && (
                          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                            <Link
                                to="/notifications"
                                className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                                onClick={() => setNotificationMenuOpen(false)}
                            >
                              View all notifications
                            </Link>
                          </div>
                      )}
                    </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl px-3 py-2 transition-all duration-200 hover:scale-105 group"
                >
                  <div className={`h-8 w-8 rounded-lg ${getRoleColor(user?.role)} text-white flex items-center justify-center text-xs font-bold shadow-sm`}>
                    {getInitials(user?.name?.split(' ')[0], user?.name?.split(' ')[1])}
                  </div>
                  <div className="hidden sm:flex flex-col items-start text-left">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name || 'User'}
                  </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role || 'Student'}
                  </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 hidden sm:block group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors" />
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl ring-1 ring-gray-200 dark:ring-gray-700 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                      {/* User Info */}
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className={`h-10 w-10 rounded-lg ${getRoleColor(user?.role)} text-white flex items-center justify-center text-sm font-bold`}>
                            {getInitials(user?.name?.split(' ')[0], user?.name?.split(' ')[1])}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {user?.name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {user?.email}
                            </p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                                user?.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                    user?.role === 'staff' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}>
                          {user?.role || 'Student'}
                        </span>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                            to="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="h-4 w-4 mr-3" />
                          Your Profile
                        </Link>
                        <Link
                            to="/settings"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          Settings
                        </Link>
                        {(user?.role === 'admin' || user?.role === 'staff') && (
                            <Link
                                to="/admin"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                onClick={() => setUserMenuOpen(false)}
                            >
                              <Shield className="h-4 w-4 mr-3" />
                              Admin Panel
                            </Link>
                        )}
                        <Link
                            to="/help"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                        >
                          <HelpCircle className="h-4 w-4 mr-3" />
                          Help & Support
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Sign out
                        </button>
                      </div>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
  );
}
