import React, { lazy, Suspense } from 'react';
import {
  createBrowserRouter, RouterProvider, Navigate, Outlet
} from 'react-router-dom';
import { useAuthStore } from './store';
import { AppLayout } from '../components/layout/AppLayout';
import { PageSpinner } from '../components/ui/Spinner';

// Lazy-loaded pages
const LoginPage = lazy(() => import('../pages/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('../pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ProductsPage = lazy(() => import('../pages/ProductsPage').then(m => ({ default: m.ProductsPage })));
const PurchasesPage = lazy(() => import('../pages/PurchasesPage').then(m => ({ default: m.PurchasesPage })));
const SalesPage = lazy(() => import('../pages/SalesPage').then(m => ({ default: m.SalesPage })));
const ExpensesPage = lazy(() => import('../pages/ExpensesPage').then(m => ({ default: m.ExpensesPage })));
const ReportsPage = lazy(() => import('../pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('../pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

// Auth guard
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
};

// Admin-only guard
const AdminRoute: React.FC = () => {
  const { user } = useAuthStore();
  if (user?.role !== 'admin') return <Navigate to="/sales" replace />;
  return <Outlet />;
};

// Smart redirect based on role
const RoleRedirect: React.FC = () => {
  const { user } = useAuthStore();
  if (user?.role === 'sales') return <Navigate to="/sales" replace />;
  return <Navigate to="/dashboard" replace />;
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageSpinner />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <RoleRedirect /> },
          // Admin-only routes
          {
            element: <AdminRoute />,
            children: [
              {
                path: 'dashboard',
                element: <Suspense fallback={<PageSpinner />}><DashboardPage /></Suspense>,
              },
              {
                path: 'purchases',
                element: <Suspense fallback={<PageSpinner />}><PurchasesPage /></Suspense>,
              },
              {
                path: 'expenses',
                element: <Suspense fallback={<PageSpinner />}><ExpensesPage /></Suspense>,
              },
              {
                path: 'reports',
                element: <Suspense fallback={<PageSpinner />}><ReportsPage /></Suspense>,
              },
              {
                path: 'settings',
                element: <Suspense fallback={<PageSpinner />}><SettingsPage /></Suspense>,
              },
            ],
          },
          // Shared routes (admin + sales)
          {
            path: 'inventory',
            element: <Suspense fallback={<PageSpinner />}><ProductsPage /></Suspense>,
          },
          {
            path: 'sales',
            element: <Suspense fallback={<PageSpinner />}><SalesPage /></Suspense>,
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export const AppRouter: React.FC = () => <RouterProvider router={router} />;
