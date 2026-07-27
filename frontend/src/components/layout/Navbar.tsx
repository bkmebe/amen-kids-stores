import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell, Globe, Package, AlertTriangle, ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useUIStore } from '../../app/store';
import { productsApi } from '../../api/products.api';
import { salesApi } from '../../api/sales.api';
import { formatCurrency } from '../../lib/utils';

const pageTitles: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/inventory': 'inventory',
  '/sales': 'sales',
  '/expenses': 'expenses',
  '/reports': 'reports',
  '/settings': 'settings',
};

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { language, setLanguage } = useUIStore();
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const titleKey = pageTitles[location.pathname] || 'dashboard';

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'am' : 'en';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  // Fetch low stock products for notifications
  const { data: lowStockProducts = [] } = useQuery({
    queryKey: ['products-lowstock'],
    queryFn: productsApi.getLowStock,
    staleTime: 60 * 1000,
  });

  // Fetch recent sales
  const { data: allSales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: salesApi.getAll,
    staleTime: 60 * 1000,
  });

  const recentSales = allSales.slice(0, 5);
  const notifCount = lowStockProducts.length + recentSales.length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-indigo-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-indigo-50 text-indigo-600 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
        <h2 className="font-bold text-indigo-950 text-lg capitalize">{t(titleKey)}</h2>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleLanguage}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-500 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
          aria-label="Toggle language"
          id="language-toggle"
        >
          <Globe size={14} />
          {language === 'am' ? 'ET አማርኛ' : 'GB English'}
        </button>

        {/* Notification Bell */}
        <div ref={bellRef} className="relative">
          <button
            onClick={() => setBellOpen(!bellOpen)}
            className="p-2 rounded-xl hover:bg-indigo-50 text-indigo-400 hover:text-indigo-600 transition-colors relative"
            aria-label="Notifications"
            id="notification-bell"
          >
            <Bell size={18} />
            {notifCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px] shadow-sm">
                {notifCount > 9 ? '9+' : notifCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {bellOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-xl border border-indigo-100 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-indigo-100 bg-indigo-50/50">
                <h3 className="font-bold text-indigo-900 text-sm">Notifications</h3>
                <p className="text-xs text-indigo-400">{notifCount} items</p>
              </div>

              <div className="max-h-72 overflow-y-auto">
                {/* Low Stock Alerts */}
                {lowStockProducts.length > 0 && (
                  <div>
                    <p className="px-4 py-2 text-[10px] font-bold text-amber-600 uppercase tracking-wider bg-amber-50/50">
                      {t('lowStock')}
                    </p>
                    {lowStockProducts.map((p) => (
                      <div key={p.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-indigo-50/50 transition-colors border-b border-indigo-50">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle size={14} className="text-amber-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-indigo-900 truncate">{p.name}</p>
                          <p className="text-[11px] text-amber-600">
                            {p.quantity === 0 ? t('outOfStock') : `${p.quantity} left (min: ${p.low_stock_threshold})`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent Sales */}
                {recentSales.length > 0 && (
                  <div>
                    <p className="px-4 py-2 text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50/50">
                      Recent Sales
                    </p>
                    {recentSales.map((s) => (
                      <div key={s.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-indigo-50/50 transition-colors border-b border-indigo-50">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <ShoppingCart size={14} className="text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-indigo-900 truncate">
                            {s.product?.name || 'Product'} × {s.quantity_sold}
                          </p>
                          <p className="text-[11px] text-indigo-400">
                            {formatCurrency(s.total_amount)}
                          </p>
                        </div>
                        <span className="text-emerald-600 text-[11px] font-semibold flex-shrink-0">
                          +{formatCurrency(s.profit)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {notifCount === 0 && (
                  <div className="p-8 text-center">
                    <Bell size={24} className="mx-auto text-indigo-200 mb-2" />
                    <p className="text-xs text-indigo-400">No notifications</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
