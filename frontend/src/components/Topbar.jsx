import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Scan,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Check,
  Sliders,
  ExternalLink,
  User as UserIcon,
  LogOut,
  LogIn,
} from 'lucide-react';
import Button from '../design-system/Button';
import Badge from '../design-system/Badge';
import { useAuth } from '../context/AuthContext';

export const Topbar = ({
  onToggleMobileSidebar,
  onOpenQuickScan,
  onOpenSettings,
  onNavigate,
  onSearch,
  isBackendOnline,
}) => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = React.useRef(null);

  // Global Ctrl+K / Cmd+K shortcut listener
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      if (onSearch) {
        onSearch(searchQuery);
      } else if (onNavigate) {
        onNavigate('history');
      }
    }
  };

  const notifications = [
    {
      id: 1,
      title: 'Lithium battery detected & flagged',
      time: '2 mins ago',
      type: 'warning',
      category: 'hazardous',
    },
    {
      id: 2,
      title: 'Conveyor Alpha-1 diversion verified',
      time: '14 mins ago',
      type: 'success',
      category: 'organic',
    },
    {
      id: 3,
      title: 'RealWaste-YOLOv11 model updated',
      time: '1 hour ago',
      type: 'info',
      category: 'recyclable',
    },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left section: Hamburger button & Search input */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu size={20} />
        </button>

        {/* Global Search Bar */}
        <div className="relative flex-1 hidden sm:block max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
            placeholder="Search items, scan IDs, categories... (Ctrl + K)"
            className="w-full pl-9 pr-12 py-2 text-xs sm:text-sm bg-[#F7FAF8] border border-slate-200/90 rounded-xl focus:bg-white focus:border-forest-600 focus:outline-none transition-all placeholder:text-slate-400"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right section: Node Status, Quick Action, Notifications, User */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Real-time System Status Pill */}
        <div
          className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
            isBackendOnline === true
              ? 'bg-forest-50/80 border-forest-200/80 text-forest-800'
              : isBackendOnline === false
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isBackendOnline === true
                ? 'bg-emerald-500 animate-pulse'
                : isBackendOnline === false
                ? 'bg-rose-500'
                : 'bg-slate-400'
            }`}
          />
          <span>
            {isBackendOnline === true
              ? 'FastAPI Online'
              : isBackendOnline === false
              ? 'Backend Offline'
              : 'Connecting...'}
          </span>
          <span className="text-[10px] font-mono text-slate-500 bg-white/80 px-1.5 py-0.5 rounded border border-slate-200">
            :8000
          </span>
        </div>

        {/* Quick Scan Action Button */}
        <Button
          size="sm"
          variant="primary"
          leftIcon={Scan}
          onClick={onOpenQuickScan}
          className="shadow-xs"
        >
          <span className="hidden sm:inline">New Scan</span>
          <span className="sm:hidden">Scan</span>
        </Button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (unreadCount > 0) setUnreadCount(0);
            }}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors relative"
            aria-label="View notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Flyout */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200/90 shadow-dropdown overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-slate-900">Notifications</h4>
                  <Badge variant="forest" size="sm">Live Feed</Badge>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-forest-700 hover:underline font-medium"
                >
                  Close
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3.5 hover:bg-slate-50/70 transition-colors flex items-start gap-3">
                    <span
                      className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                        n.type === 'warning'
                          ? 'bg-amber-500'
                          : n.type === 'success'
                          ? 'bg-emerald-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 leading-snug">{n.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    onNavigate && onNavigate('history');
                  }}
                  className="text-xs font-medium text-forest-700 hover:text-forest-800"
                >
                  View full audit log →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile / Auth Area */}
        <div className="relative pl-1 sm:pl-2 border-l border-slate-200">
          {isAuthenticated && user ? (
            <div>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors"
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-xl bg-forest-700 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left text-xs">
                  <div className="font-semibold text-slate-800 leading-tight truncate max-w-[100px]">
                    {user.full_name || user.email.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-forest-700 font-medium capitalize">
                    {user.role}
                  </div>
                </div>
                <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200/90 shadow-dropdown p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {user.full_name || 'System Operator'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-forest-100 text-forest-800">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenSettings && onOpenSettings();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <Sliders size={14} className="text-slate-400" />
                    <span>System Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-xl transition-colors mt-1"
                  >
                    <LogOut size={14} className="text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={LogIn}
                onClick={() => openAuthModal('login')}
                className="text-xs text-forest-800 font-semibold"
              >
                Sign In
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
