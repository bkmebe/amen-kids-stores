import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mail, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../app/store';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { getErrorMessage } from '../lib/utils';

interface LoginForm {
  email: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (values: LoginForm) => {
    setLoading(true);
    try {
      const result = await authApi.login(values.email, values.password);
      setAuth(result.user, result.token);
      toast.success('Welcome back!');
      navigate(result.user.role === 'sales' ? '/sales' : '/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg flex items-center justify-center min-h-screen p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="mx-auto mb-4"
          >
            <img src="/logo.png" alt="Amen Kids Store" className="h-20 mx-auto object-contain drop-shadow-2xl" />
          </motion.div>
          <p className="text-indigo-300 text-sm mt-1">Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-1">{t('welcomeBack')}</h2>
          <p className="text-indigo-300 text-sm mb-6">{t('signIn')}</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="form-group">
              <label className="label text-indigo-200">{t('email')}</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                <input
                  id="email-input"
                  type="text"
                  placeholder="admin@amenkids.com"
                  className="input pl-10 bg-white/10 border-white/20 text-white placeholder-indigo-400 focus:border-indigo-400"
                  {...register('email', { required: 'Email is required' })}
                />
              </div>
              {errors.email && <p className="error-text text-red-300">{errors.email.message}</p>}
            </div>

            <div className="form-group">
              <label className="label text-indigo-200">{t('password')}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                <input
                  id="password-input"
                  type="password"
                  placeholder="••••••••"
                  className="input pl-10 bg-white/10 border-white/20 text-white placeholder-indigo-400 focus:border-indigo-400"
                  {...register('password', { required: 'Password is required' })}
                />
              </div>
              {errors.password && <p className="error-text text-red-300">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              loading={loading}
              id="login-btn"
            >
              {loading ? t('loggingIn') : t('login')}
            </Button>
          </form>

          {/* Hint */}
          <div className="mt-6 p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <p className="text-xs text-indigo-300 text-center">
              Admin: <span className="text-indigo-200 font-mono">admin@amenkids.com</span> / <span className="text-indigo-200 font-mono">amen@1234</span>
            </p>
            <p className="text-xs text-indigo-300 text-center">
              Sales: <span className="text-indigo-200 font-mono">sales@amenkids.com</span> / <span className="text-indigo-200 font-mono">sales@1234</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
