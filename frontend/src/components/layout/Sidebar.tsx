import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Package, ShoppingCart, Receipt,
  BarChart3, Settings, LogOut, ShoppingBag
} from 'lucide-react';
import { useAuthStore } from '../../app/store';
import { authApi } from '../../api/auth.api';
import toast from 'react-hot-toast';

// Define which routes each role can access
const allNavItems = [
  { path: '/dashboard', icon: LayoutDashboard, key: 'dashboard', roles: ['admin'] },
  { path: '/inventory', icon: Package, key: 'inventory', roles: ['admin', 'sales'] },
  { path: '/sales', icon: ShoppingCart, key: 'sales', roles: ['admin', 'sales'] },
  { path: '/purchases', icon: ShoppingBag, key: 'purchases', roles: ['admin'] },
  { path: '/expenses', icon: Receipt, key: 'expenses', roles: ['admin'] },
  { path: '/reports', icon: BarChart3, key: 'reports', roles: ['admin'] },
  { path: '/settings', icon: Settings, key: 'settings', roles: ['admin'] },
];

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const userRole = user?.role || 'sales';
  const navItems = allNavItems.filter((item) => item.roles.includes(userRole));

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      clearAuth();
      navigate('/login');
      toast.success('Logged out successfully');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-indigo-100 w-64">
      {/* Logo */}
      <div className="p-4 border-b border-indigo-100">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Amen Kids Store" className="h-12 object-contain" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon size={18} />
            <span>{t(item.key)}</span>
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-indigo-100 space-y-2">
        {user && (
          <div className="px-3 py-2 rounded-xl bg-indigo-50">
            <p className="text-xs font-semibold text-indigo-700 truncate">{user.email}</p>
            <p className="text-xs text-indigo-400 capitalize">{user.role}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="nav-item w-full text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} />
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );
};
