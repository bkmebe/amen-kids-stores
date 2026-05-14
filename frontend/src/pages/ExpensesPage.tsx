import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, Receipt, DollarSign } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { expensesApi } from '../api/expenses.api';
import { CreateExpenseInput } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageSpinner } from '../components/ui/Spinner';
import { formatCurrency, formatDateTime, getErrorMessage } from '../lib/utils';

const EXPENSE_CATEGORIES = [
  'Rent', 'Utilities', 'Salaries', 'Transport', 'Marketing',
  'Inventory Purchase', 'Maintenance', 'Other'
];

const BADGE_MAP: Record<string, 'primary' | 'warning' | 'danger' | 'success' | 'gray'> = {
  Rent: 'danger', Utilities: 'warning', Salaries: 'primary',
  Transport: 'gray', Marketing: 'success', 'Inventory Purchase': 'primary',
};

export const ExpensesPage: React.FC = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: expensesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: expensesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      setModalOpen(false);
      toast.success('Expense added!');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const categories = Array.from(new Set(expenses.map((e) => e.category)));
  const filtered = categoryFilter
    ? expenses.filter((e) => e.category === categoryFilter)
    : expenses;

  const totalAmount = filtered.reduce((sum, e) => sum + e.amount, 0);

  const ExpenseForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<CreateExpenseInput>();
    return (
      <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
        <div className="form-group">
          <label className="label">{t('name')} *</label>
          <input
            className={`input ${errors.title ? 'border-red-400' : ''}`}
            placeholder="Expense title"
            {...register('title', { required: 'Title is required' })}
          />
          {errors.title && <p className="error-text">{errors.title.message}</p>}
        </div>

        <div className="form-group">
          <label className="label">{t('amount')} (ብር) *</label>
          <input
            type="number" step="0.01" min="0.01"
            className={`input ${errors.amount ? 'border-red-400' : ''}`}
            placeholder="0.00"
            {...register('amount', { required: 'Required', valueAsNumber: true, min: { value: 0.01, message: 'Must be positive' } })}
          />
          {errors.amount && <p className="error-text">{errors.amount.message}</p>}
        </div>

        <div className="form-group">
          <label className="label">{t('category')} *</label>
          <select
            className={`input cursor-pointer ${errors.category ? 'border-red-400' : ''}`}
            {...register('category', { required: 'Category is required' })}
          >
            <option value="">Select category</option>
            {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p className="error-text">{errors.category.message}</p>}
        </div>

        <div className="form-group">
          <label className="label">{t('notes')}</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Optional notes..."
            {...register('notes')}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">
            {t('cancel')}
          </Button>
          <Button type="submit" loading={createMutation.isPending} className="flex-1">
            {t('save')}
          </Button>
        </div>
      </form>
    );
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">{t('expenses_title')}</h1>
        <Button icon={<Plus />} onClick={() => setModalOpen(true)} id="add-expense-btn">
          {t('addExpense')}
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">Total Expenses</p>
              <p className="text-2xl font-bold text-indigo-950 mt-1">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-100">
              <DollarSign size={20} className="text-rose-600" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">Total Records</p>
              <p className="text-2xl font-bold text-indigo-950 mt-1">{filtered.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-100">
              <Receipt size={20} className="text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="card">
        <select
          className="input sm:w-64 cursor-pointer"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">{t('allCategories')}</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <Receipt size={40} />
            <p className="font-medium">{t('noExpenses')}</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>{t('name')}</th>
                <th>{t('category')}</th>
                <th>{t('amount')}</th>
                <th>{t('notes')}</th>
                <th>{t('date')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((expense) => (
                <tr key={expense.id}>
                  <td className="font-medium text-indigo-900">{expense.title}</td>
                  <td>
                    <Badge variant={BADGE_MAP[expense.category] || 'gray'}>
                      {expense.category}
                    </Badge>
                  </td>
                  <td className="font-bold text-rose-600">{formatCurrency(expense.amount)}</td>
                  <td className="text-indigo-400 text-sm">{expense.notes || '—'}</td>
                  <td className="text-indigo-400 text-xs">{formatDateTime(expense.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={t('addExpense')}>
        <ExpenseForm />
      </Modal>
    </div>
  );
};
