import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Globe, User, Shield, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth.api';
import { useAuthStore, useUIStore } from '../app/store';
import { Button } from '../components/ui/Button';
import { formatDate } from '../lib/utils';
import i18n from '../lib/i18n';

export const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { language, setLanguage } = useUIStore();

  const langMutation = useMutation({
    mutationFn: authApi.updateLanguage,
    onSuccess: (_, lang) => {
      setLanguage(lang);
      i18n.changeLanguage(lang);
      toast.success('Language updated');
    },
    onError: () => toast.error('Failed to update language'),
  });

  const handleLanguageChange = (lang: 'en' | 'am') => {
    langMutation.mutate(lang);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="page-title">{t('settings')}</h1>

      {/* Account section */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-indigo-100">
            <User size={18} className="text-indigo-600" />
          </div>
          <h2 className="font-semibold text-indigo-900">{t('account')}</h2>
        </div>

        {user && (
          <div className="space-y-3">
            {[
              { label: t('email'), value: user.email },
              { label: t('role'), value: user.role.charAt(0).toUpperCase() + user.role.slice(1) },
              { label: t('joinedDate'), value: formatDate(user.created_at) },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3 border-b border-indigo-50 last:border-0">
                <span className="text-sm text-indigo-400">{item.label}</span>
                <span className="text-sm font-semibold text-indigo-900">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Language section */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-violet-100">
            <Globe size={18} className="text-violet-600" />
          </div>
          <h2 className="font-semibold text-indigo-900">{t('language')}</h2>
        </div>

        <div className="space-y-3">
          {[
            { code: 'en' as const, label: t('english'), flag: '🇬🇧', native: 'English' },
            { code: 'am' as const, label: t('amharic'), flag: '🇪🇹', native: 'አማርኛ' },
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              disabled={langMutation.isPending}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                language === lang.code
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lang.flag}</span>
                <div className="text-left">
                  <p className="font-semibold text-indigo-900">{lang.label}</p>
                  <p className="text-xs text-indigo-400">{lang.native}</p>
                </div>
              </div>
              {language === lang.code && (
                <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Security info */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-emerald-100">
            <Shield size={18} className="text-emerald-600" />
          </div>
          <h2 className="font-semibold text-indigo-900">Security</h2>
        </div>
        <p className="text-sm text-indigo-400">
          Your session is secured with JWT authentication. Tokens expire after 7 days.
        </p>
      </div>
    </div>
  );
};
