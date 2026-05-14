import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Plus, TrendingUp, DollarSign, Package, Banknote, Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { salesApi } from '../api/sales.api';
import { productsApi } from '../api/products.api';
import { CreateSaleInput } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageSpinner } from '../components/ui/Spinner';
import { formatCurrency, formatDateTime, getErrorMessage } from '../lib/utils';

const ETHIOPIAN_BANKS = [
  'Commercial Bank of Ethiopia (CBE)',
  'Awash Bank',
  'Dashen Bank',
  'Bank of Abyssinia',
  'Wegagen Bank',
  'United Bank',
  'Nib International Bank',
  'Cooperative Bank of Oromia',
  'Lion International Bank',
  'Oromia Bank',
  'Bunna International Bank',
  'Berhan International Bank',
  'Abay Bank',
  'Addis International Bank',
  'Debub Global Bank',
  'Enat Bank',
  'ZamZam Bank',
  'Hijra Bank',
  'Amhara Bank',
  'Gadaa Bank',
  'Siinqee Bank',
  'Ahadu Bank',
  'Goh Betoch Bank',
  'telebirr (Ethio Telecom)',
  'CBE Birr',
  'M-PESA',
];

export const SalesPage: React.FC = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: salesApi.getAll,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
  });

  const { data: todaySummary } = useQuery({
    queryKey: ['sales-today'],
    queryFn: salesApi.getTodaySummary,
  });

  const createMutation = useMutation({
    mutationFn: salesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] });
      qc.invalidateQueries({ queryKey: ['sales-today'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      setModalOpen(false);
      toast.success('Sale recorded!');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // Sale form with discount, payment method, and preview
  const SaleForm = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm<CreateSaleInput>({
      defaultValues: { discount: 0, payment_method: 'cash' },
    });
    const selectedProductId = watch('product_id');
    const quantity = watch('quantity_sold');
    const discount = watch('discount') || 0;
    const paymentMethod = watch('payment_method');
    const selectedProduct = products.find((p) => p.id === selectedProductId);

    const grossTotal = selectedProduct && quantity
      ? selectedProduct.selling_price * Number(quantity)
      : 0;
    const netTotal = Math.max(0, grossTotal - Number(discount));

    return (
      <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
        <div className="form-group">
          <label className="label">{t('product')} *</label>
          <select
            className={`input cursor-pointer ${errors.product_id ? 'border-red-400' : ''}`}
            {...register('product_id', { required: 'Product is required' })}
          >
            <option value="">{t('selectProduct')}</option>
            {products
              .filter((p) => p.quantity > 0)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}{p.size ? ` (${p.size})` : ''} — {formatCurrency(p.selling_price)} (Stock: {p.quantity})
                </option>
              ))}
          </select>
          {errors.product_id && <p className="error-text">{errors.product_id.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label">{t('quantitySold')} *</label>
            <input
              type="number" min="1"
              max={selectedProduct?.quantity}
              className={`input ${errors.quantity_sold ? 'border-red-400' : ''}`}
              placeholder="1"
              {...register('quantity_sold', {
                required: 'Required',
                valueAsNumber: true,
                min: { value: 1, message: 'Min 1' },
                max: selectedProduct ? { value: selectedProduct.quantity, message: `Max ${selectedProduct.quantity}` } : undefined,
              })}
            />
            {errors.quantity_sold && <p className="error-text">{errors.quantity_sold.message}</p>}
          </div>

          <div className="form-group">
            <label className="label">{t('discount')} (ብር)</label>
            <input
              type="number" min="0" step="0.01"
              className="input"
              placeholder="0.00"
              {...register('discount', { valueAsNumber: true, min: 0 })}
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="form-group">
          <label className="label">{t('paymentMethod')} *</label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-emerald-400 bg-emerald-50' : 'border-indigo-100 hover:border-indigo-200'}`}>
              <input type="radio" value="cash" className="sr-only" {...register('payment_method', { required: true })} />
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${paymentMethod === 'cash' ? 'bg-emerald-100' : 'bg-indigo-50'}`}>
                <Banknote size={18} className={paymentMethod === 'cash' ? 'text-emerald-600' : 'text-indigo-400'} />
              </div>
              <div>
                <p className={`text-sm font-semibold ${paymentMethod === 'cash' ? 'text-emerald-700' : 'text-indigo-700'}`}>{t('cash')}</p>
                <p className="text-[11px] text-indigo-400">{t('cashPayment')}</p>
              </div>
            </label>
            <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'bank_transfer' ? 'border-blue-400 bg-blue-50' : 'border-indigo-100 hover:border-indigo-200'}`}>
              <input type="radio" value="bank_transfer" className="sr-only" {...register('payment_method', { required: true })} />
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${paymentMethod === 'bank_transfer' ? 'bg-blue-100' : 'bg-indigo-50'}`}>
                <Building2 size={18} className={paymentMethod === 'bank_transfer' ? 'text-blue-600' : 'text-indigo-400'} />
              </div>
              <div>
                <p className={`text-sm font-semibold ${paymentMethod === 'bank_transfer' ? 'text-blue-700' : 'text-indigo-700'}`}>{t('mobileBanking')}</p>
                <p className="text-[11px] text-indigo-400">{t('bankTransfer')}</p>
              </div>
            </label>
          </div>
        </div>

        {/* Bank Dropdown — only when bank_transfer */}
        {paymentMethod === 'bank_transfer' && (
          <div className="form-group">
            <label className="label">{t('selectBank')} *</label>
            <select
              className={`input cursor-pointer ${errors.bank_name ? 'border-red-400' : ''}`}
              {...register('bank_name', { required: paymentMethod === 'bank_transfer' ? 'Bank is required' : false })}
            >
              <option value="">{t('selectBank')}</option>
              {ETHIOPIAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            {errors.bank_name && <p className="error-text">{errors.bank_name.message}</p>}
          </div>
        )}

        {/* Preview */}
        {selectedProduct && (
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 space-y-2">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">{t('salePreview')}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-indigo-600">{t('unitPrice')}</span>
              <span className="font-semibold text-indigo-900">{formatCurrency(selectedProduct.selling_price)}</span>
            </div>
            {grossTotal > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-indigo-600">{t('subtotal')}</span>
                  <span className="font-semibold text-indigo-900">{formatCurrency(grossTotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between text-red-500">
                    <span className="text-sm">{t('discount')}</span>
                    <span className="font-semibold">- {formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-indigo-100 pt-2">
                  <span className="text-sm font-bold text-indigo-700">{t('total')}</span>
                  <span className="text-lg font-bold gradient-text">{formatCurrency(netTotal)}</span>
                </div>
                <div className="flex items-center justify-between text-indigo-400">
                  <span className="text-xs">{t('paymentMethod')}</span>
                  <span className="text-xs font-medium">
                    {paymentMethod === 'cash' ? '💵 ' + t('cash') : '🏦 ' + t('mobileBanking')}
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">
            {t('cancel')}
          </Button>
          <Button type="submit" loading={createMutation.isPending} className="flex-1">
            {t('recordSale')}
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
        <h1 className="page-title">{t('sales')}</h1>
        <Button icon={<Plus />} onClick={() => setModalOpen(true)} id="record-sale-btn">
          {t('recordSale')}
        </Button>
      </div>

      {/* Today summary cards */}
      {todaySummary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: t('todaySales'), value: formatCurrency(todaySummary.totalSales), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
            { label: t('transactions'), value: String(todaySummary.totalTransactions), icon: ShoppingCart, color: 'text-indigo-600', bg: 'bg-indigo-100' },
            { label: t('profit'), value: formatCurrency(todaySummary.totalProfit), icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-100' },
          ].map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-2xl font-bold text-indigo-950 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon size={20} className={stat.color} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sales table */}
      <div className="table-container">
        {sales.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={40} />
            <p className="font-medium">{t('noSales')}</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>{t('product')}</th>
                <th>{t('category')}</th>
                <th>{t('quantitySold')}</th>
                <th>{t('sellingPrice')}</th>
                <th>{t('discount')}</th>
                <th>{t('total')}</th>
                <th>{t('profit')}</th>
                <th>{t('paymentMethod')}</th>
                <th>{t('date')}</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Package size={14} className="text-indigo-500" />
                      </div>
                      <span className="font-medium text-indigo-900">
                        {sale.product?.name || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td>
                    {sale.product?.category && (
                      <Badge variant="primary">{sale.product.category}</Badge>
                    )}
                  </td>
                  <td>
                    <span className="font-semibold text-indigo-700">{sale.quantity_sold}</span>
                  </td>
                  <td>{formatCurrency(sale.selling_price)}</td>
                  <td>
                    {sale.discount > 0 ? (
                      <span className="text-red-500 font-medium">-{formatCurrency(sale.discount)}</span>
                    ) : (
                      <span className="text-indigo-300">—</span>
                    )}
                  </td>
                  <td>
                    <span className="font-bold text-indigo-900">{formatCurrency(sale.total_amount)}</span>
                  </td>
                  <td>
                    <span className={`font-bold ${sale.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {formatCurrency(sale.profit)}
                    </span>
                  </td>
                  <td>
                    {sale.payment_method === 'bank_transfer' ? (
                      <div>
                        <Badge variant="info">🏦 {t('mobileBanking')}</Badge>
                        {sale.bank_name && (
                          <p className="text-[10px] text-indigo-400 mt-0.5 truncate max-w-[120px]">{sale.bank_name}</p>
                        )}
                      </div>
                    ) : (
                      <Badge variant="success">💵 {t('cash')}</Badge>
                    )}
                  </td>
                  <td className="text-indigo-400 text-xs">{formatDateTime(sale.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={t('recordSale')}>
        <SaleForm />
      </Modal>
    </div>
  );
};
