import React from 'react';
import {
  LayoutDashboard,
  Scan,
  BarChart3,
  History,
  Settings,
  Sparkles,
  Boxes,
  ShieldCheck,
  X,
  ExternalLink,
  User as UserIcon,
} from 'lucide-react';
import Badge from '../design-system/Badge';
import { useAuth } from '../context/AuthContext';

export const PRIMARY_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'detection', label: 'Waste Detection', icon: Scan, badge: 'AI Live' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'history', label: 'Scan History', icon: History, badge: '9 Classes' },
];

export const SECONDARY_NAV_ITEMS = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'showcase', label: 'Design System', icon: Sparkles, badge: 'Tokens' },
];

export const Sidebar = ({
  activeTab = 'dashboard',
  onTabChange,
  isMobileOpen = false,
  onCloseMobile,
  historyCount = 9,
}) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-forest-800 text-white flex items-center justify-center shadow-sm">
              <Boxes size={20} className="text-forest-100" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 tracking-tight text-base">
                  EcoSort<span className="text-forest-700">.AI</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Smart Waste Segregation
              </p>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {/* Main 4 Pages */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Navigation Pages
            </div>
            <nav className="space-y-1">
              {PRIMARY_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const badgeLabel = item.id === 'history' ? `${historyCount}` : item.badge;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-forest-800 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-forest-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        size={18}
                        className={`shrink-0 transition-colors ${
                          isActive
                            ? 'text-white'
                            : 'text-slate-400 group-hover:text-forest-700'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {badgeLabel && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold tracking-wide ${
                          isActive
                            ? 'bg-forest-700 text-forest-100'
                            : item.badge === 'AI Live'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {badgeLabel}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Model Status Card */}
          <div className="p-3.5 rounded-xl bg-forest-50/70 border border-forest-200/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-forest-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ResNet18 Classifier
              </span>
              <span className="text-[10px] text-forest-700 font-mono">v1.0</span>
            </div>
            <p className="text-[11px] text-forest-800/80 leading-relaxed">
              Trained on 4,752 RealWaste photos. Softmax scoring across 9 municipal classes.
            </p>
          </div>

          {/* System & Tools */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Preferences & Tokens
            </div>
            <nav className="space-y-1">
              {SECONDARY_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-forest-800 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        size={16}
                        className={`shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-forest-700'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                          isActive ? 'bg-forest-700 text-forest-100' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Facility Operator Profile */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/60">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 p-1.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-forest-800 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {user.full_name || 'System Operator'}
                </p>
                <p className="text-[11px] text-forest-700 capitalize truncate">
                  {user.role} • Plant Alpha
                </p>
              </div>
            </div>
          ) : (
            <div
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-3 p-1.5 cursor-pointer hover:bg-slate-100/80 rounded-xl transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center text-xs">
                <UserIcon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800">Operator Guest</p>
                <p className="text-[11px] text-forest-700 font-medium">Click to Sign In →</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
