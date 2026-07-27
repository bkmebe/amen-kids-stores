import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  ShoppingBag, Plus, DollarSign, Package, Banknote, Building2,
  Search, ChevronDown, X, TrendingDown, FileText, Truck
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { purchasesApi } from '../api/purchases.api';
import { productsApi } from '../api/products.api';
import { CreatePurchaseInput, Product } from '../types';
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

// ─── Searchable Product Picker ─────────────────────────────────────
interface ProductPickerProps {
  products: Product[];
  value: string;
  onChange: (id: string) => void;
  error?: string;
}

const ProductPicker: React.FC<ProductPickerProps> = ({ products, value, onChange, error }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.supplier?.toLowerCase().includes(q) ||
        p.size?.toLowerCase().includes(q)
    );
  }, [search, products]);

  const selected = products.find((p) => p.id === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (id: string) => {
    onChange(id);
    setSearch('');
    setOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setSearch('');
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className={`input flex items-center gap-2 cursor-pointer ${error ? 'border-red-400' : ''} ${open ? 'ring-2 ring-violet-300 border-violet-400' : ''}`}
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
      >
        <Search size={14} className="text-violet-400 shrink-0" />
        {selected && !open ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-indigo-900 font-medium truncate">
              {selected.name}{selected.size ? ` (${selected.size})` : ''} — {formatCurrency(selected.cost_price)}
            </span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleClear(); }}
              className="p-0.5 rounded hover:bg-violet-100 transition-colors"
            >
              <X size={14} className="text-violet-400" />
            </button>
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={t('searchProducts') || 'Search products by name, category, size...'}
            className="flex-1 bg-transparent border-none outline-none text-sm text-indigo-900 placeholder-indigo-300"
          />
        )}
        <ChevronDown size={14} className={`text-violet-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-white rounded-xl border border-violet-100 shadow-xl animate-in fade-in slide-in-from-top-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-violet-400">
              <Package size={24} className="mx-auto mb-2 opacity-50" />
              <p>{t('noProducts') || 'No products found'}</p>
              {search && <p className="text-xs mt-1">Try a different search term</p>}
            </div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors hover:bg-violet-50 ${value === p.id ? 'bg-violet-50 border-l-2 border-violet-500' : ''}`}
                onClick={() => handleSelect(p.id)}
              >
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                  <Package size={14} className="text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-indigo-900 truncate">
                    {p.name}{p.size ? ` (${p.size})` : ''}
                  </p>
                  <p className="text-[11px] text-indigo-400">
                    {p.category} {p.supplier ? `• ${p.supplier}` : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-violet-700">Cost: {formatCurrency(p.cost_price)}</p>
                  <p className={`text-[10px] font-medium ${p.quantity <= 5 ? 'text-red-500' : 'text-emerald-500'}`}>
                    Stock: {p.quantity}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ─── Purchases Page ─────────────────────────────────────────────────
export const PurchasesPage: React.FC = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [purchasesSearch, setPurchasesSearch] = useState('');

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ['purchases'],
    queryFn: purchasesApi.getAll,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: purchasesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      setModalOpen(false);
      toast.success('Purchase recorded! Inventory updated.');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // Summary stats (today)
  const today = new Date().toDateString();
  const todayPurchases = purchases.filter(
    (p) => new Date(p.created_at).toDateString() === today
  );
  const todaySpent = todayPurchases.reduce((sum, p) => sum + p.total_cost, 0);
  const todayUnits = todayPurchases.reduce((sum, p) => sum + p.quantity_purchased, 0);

  // Filter purchases by search
  const filteredPurchases = useMemo(() => {
    if (!purchasesSearch.trim()) return purchases;
    const q = purchasesSearch.toLowerCase();
    return purchases.filter(
      (p) =>
        p.product?.name?.toLowerCase().includes(q) ||
        p.product?.category?.toLowerCase().includes(q) ||
        p.supplier?.toLowerCase().includes(q) ||
        p.payment_method?.toLowerCase().includes(q) ||
        p.bank_name?.toLowerCase().includes(q)
    );
  }, [purchases, purchasesSearch]);

  // ─── Purchase Form ──────────────────────────────────────────────
  const PurchaseForm = () => {
    const { register, handleSubmit, watch, control, setValue, formState: { errors } } = useForm<CreatePurchaseInput>({
      defaultValues: { payment_method: 'cash', quantity_purchased: 1 },
    });

    const selectedProductId = watch('product_id');
    const quantity = watch('quantity_purchased') || 0;
    const costPerUnit = watch('cost_per_unit') || 0;
    const paymentMethod = watch('payment_method');
    const selectedProduct = products.find((p) => p.id === selectedProductId);

    // Auto-fill cost_per_unit and supplier when product selected
    useEffect(() => {
      if (selectedProduct) {
        setValue('cost_per_unit', selectedProduct.cost_price);
        if (selectedProduct.supplier) {
          setValue('supplier', selectedProduct.supplier);
        }
      }
    }, [selectedProductId]);

    const totalCost = parseFloat((Number(quantity) * Number(costPerUnit)).toFixed(2));

    return (
      <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
        {/* Product picker */}
        <div className="form-group">
          <label className="label">{t('product')} *</label>
          <Controller
            name="product_id"
            control={control}
            rules={{ required: 'Product is required' }}
            render={({ field }) => (
              <ProductPicker
                products={products}
                value={field.value || ''}
                onChange={field.onChange}
                error={errors.product_id?.message}
              />
            )}
          />
          {errors.product_id && <p className="error-text">{errors.product_id.message}</p>}
        </div>

        {/* Supplier */}
        <div className="form-group">
          <label className="label">
            <Truck size={13} className="inline mr-1 text-violet-500" />
            {t('supplier')}
          </label>
          <input
            className="input"
            placeholder="Supplier name (auto-filled from product)"
            {...register('supplier')}
          />
        </div>

        {/* Quantity + Cost per unit */}
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label">{t('quantityPurchased')} *</label>
            <input
              type="number" min="1"
              className={`input ${errors.quantity_purchased ? 'border-red-400' : ''}`}
              placeholder="1"
              {...register('quantity_purchased', {
                required: 'Required',
                valueAsNumber: true,
                min: { value: 1, message: 'Min 1' },
              })}
            />
            {errors.quantity_purchased && <p className="error-text">{errors.quantity_purchased.message}</p>}
          </div>

          <div className="form-group">
            <label className="label">{t('costPerUnit')} (ብር) *</label>
            <input
              type="number" step="0.01" min="0.01"
              className={`input ${errors.cost_per_unit ? 'border-red-400' : ''}`}
              placeholder="0.00"
              {...register('cost_per_unit', {
                required: 'Required',
                valueAsNumber: true,
                min: { value: 0.01, message: 'Must be positive' },
              })}
            />
            {errors.cost_per_unit && <p className="error-text">{errors.cost_per_unit.message}</p>}
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

        {/* Bank dropdown — only when bank_transfer */}
        {paymentMethod === 'bank_transfer' && (
          <div className="form-group">
            <label className="label">{t('selectBank')} *</label>
            <select
              className={`input cursor-pointer ${errors.bank_name ? 'border-red-400' : ''}`}
              {...register('bank_name', { required: paymentMethod === 'bank_transfer' ? 'Bank is required' : false })}
            >
              <option value="">{t('selectBank')}</option>
              {ETHIOPIAN_BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            {errors.bank_name && <p className="error-text">{errors.bank_name.message}</p>}
          </div>
        )}

        {/* Notes */}
        <div className="form-group">
          <label className="label">
            <FileText size={13} className="inline mr-1 text-violet-500" />
            {t('notes')} ({t('optional') || 'Optional'})
          </label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="e.g. New shipment from Merkato..."
            {...register('notes')}
          />
        </div>

        {/* Preview */}
        {selectedProduct && quantity > 0 && costPerUnit > 0 && (
          <div className="p-4 rounded-xl bg-violet-50 border border-violet-100 space-y-2">
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-wide">Purchase Summary</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-violet-600">Product</span>
              <span className="font-semibold text-indigo-900">
                {selectedProduct.name}{selectedProduct.size ? ` (${selectedProduct.size})` : ''}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-violet-600">New Stock</span>
              <span className="font-semibold text-indigo-900">
                {selectedProduct.quantity} → <span className="text-emerald-600">{selectedProduct.quantity + Number(quantity)}</span>
              </span>
            </div>
            {selectedProduct.cost_price !== Number(costPerUnit) && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-violet-600">New Cost Price</span>
                <span className="font-semibold text-indigo-900">
                  <span className="line-through text-indigo-300 mr-2">{formatCurrency(selectedProduct.cost_price)}</span>
                  <span className="text-violet-700">{formatCurrency(Number(costPerUnit))}</span>
                </span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-violet-100 pt-2">
              <span className="text-sm font-bold text-violet-700">{t('totalCost')}</span>
              <span className="text-lg font-bold text-violet-700">{formatCurrency(totalCost)}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">
            {t('cancel')}
          </Button>
          <Button type="submit" loading={createMutation.isPending} className="flex-1">
            {t('addPurchase')}
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
        <h1 className="page-title">{t('purchases')}</h1>
        <Button icon={<Plus />} onClick={() => setModalOpen(true)} id="add-purchase-btn">
          {t('addPurchase')}
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Today's Spent", value: formatCurrency(todaySpent), icon: DollarSign, color: 'text-violet-600', bg: 'bg-violet-100' },
          { label: 'Transactions', value: String(todayPurchases.length), icon: ShoppingBag, color: 'text-indigo-600', bg: 'bg-indigo-100' },
          { label: 'Units Received', value: String(todayUnits), icon: TrendingDown, color: 'text-emerald-600', bg: 'bg-emerald-100' },
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

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
        <input
          type="text"
          value={purchasesSearch}
          onChange={(e) => setPurchasesSearch(e.target.value)}
          placeholder={t('searchPurchases') || 'Search by product, supplier, payment...'}
          className="input pl-10 w-full"
          id="search-purchases-input"
        />
      </div>

      {/* Purchases table */}
      <div className="table-container">
        {filteredPurchases.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag size={40} />
            <p className="font-medium">{purchasesSearch ? 'No matching purchases found' : t('noPurchases')}</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>{t('product')}</th>
                <th>{t('supplier')}</th>
                <th>{t('quantityPurchased')}</th>
                <th>{t('costPerUnit')}</th>
                <th>{t('totalCost')}</th>
                <th>{t('paymentMethod')}</th>
                <th>{t('notes')}</th>
                <th>{t('date')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map((purchase) => (
                <tr key={purchase.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                        <Package size={14} className="text-violet-500" />
                      </div>
                      <div>
                        <span className="font-medium text-indigo-900">
                          {purchase.product?.name || 'Unknown'}
                        </span>
                        {purchase.product?.size && (
                          <span className="text-xs text-indigo-400 ml-1">({purchase.product.size})</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    {purchase.supplier ? (
                      <div className="flex items-center gap-1 text-indigo-700">
                        <Truck size={12} className="text-violet-400" />
                        <span className="text-sm">{purchase.supplier}</span>
                      </div>
                    ) : (
                      <span className="text-indigo-300">—</span>
                    )}
                  </td>
                  <td>
                    <span className="font-semibold text-violet-700">+{purchase.quantity_purchased}</span>
                  </td>
                  <td>{formatCurrency(purchase.cost_per_unit)}</td>
                  <td>
                    <span className="font-bold text-indigo-900">{formatCurrency(purchase.total_cost)}</span>
                  </td>
                  <td>
                    {purchase.payment_method === 'bank_transfer' ? (
                      <div>
                        <Badge variant="info">{t('mobileBanking')}</Badge>
                        {purchase.bank_name && (
                          <p className="text-[10px] text-indigo-400 mt-0.5 truncate max-w-[120px]">{purchase.bank_name}</p>
                        )}
                      </div>
                    ) : (
                      <Badge variant="success">{t('cash')}</Badge>
                    )}
                  </td>
                  <td>
                    {purchase.notes ? (
                      <span className="text-xs text-indigo-500 max-w-[160px] truncate block" title={purchase.notes}>
                        {purchase.notes}
                      </span>
                    ) : (
                      <span className="text-indigo-300">—</span>
                    )}
                  </td>
                  <td className="text-indigo-400 text-xs">{formatDateTime(purchase.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={t('addPurchase')}>
        <PurchaseForm />
      </Modal>
    </div>
  );
};
