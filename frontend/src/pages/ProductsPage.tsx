import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Pencil, Trash2, Package } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import toast from 'react-hot-toast';
import { productsApi } from '../api/products.api';
import { Product, CreateProductInput } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageSpinner } from '../components/ui/Spinner';
import { formatCurrency, formatDate, getStockStatus, getErrorMessage } from '../lib/utils';
import { useAuthStore } from '../app/store';

const CATEGORIES = ['Clothing', 'Shoes', 'Toys', 'Accessories', 'School Supplies', 'Other'];

// Size options based on category
const SIZE_OPTIONS: Record<string, string[]> = {
  Clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y', '12-13Y'],
  Shoes: ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38'],
};

const ProductForm: React.FC<{
  defaultValues?: Partial<CreateProductInput>;
  onSubmit: (data: CreateProductInput) => void;
  loading: boolean;
  onCancel: () => void;
}> = ({ defaultValues, onSubmit, loading, onCancel }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, control, formState: { errors } } = useForm<CreateProductInput>({
    defaultValues: { low_stock_threshold: 5, ...defaultValues },
  });

  const category = useWatch({ control, name: 'category' });
  const sizeOptions = SIZE_OPTIONS[category] || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="label">{t('name')} *</label>
          <input
            className={`input ${errors.name ? 'border-red-400' : ''}`}
            placeholder="Product name"
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name && <p className="error-text">{errors.name.message}</p>}
        </div>

        <div className="form-group">
          <label className="label">{t('category')} *</label>
          <select className={`input cursor-pointer ${errors.category ? 'border-red-400' : ''}`}
            {...register('category', { required: 'Category is required' })}>
            <option value="">Select category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p className="error-text">{errors.category.message}</p>}
        </div>

        <div className="form-group">
          <label className="label">{t('size')}</label>
          {sizeOptions.length > 0 ? (
            <select className="input cursor-pointer" {...register('size')}>
              <option value="">Select size</option>
              {sizeOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          ) : (
            <input className="input" placeholder="e.g. One Size, 5-Pack" {...register('size')} />
          )}
        </div>

        <div className="form-group">
          <label className="label">{t('supplier')}</label>
          <input className="input" placeholder="Supplier name" {...register('supplier')} />
        </div>

        <div className="form-group">
          <label className="label">{t('sellingPrice')} (ብር) *</label>
          <input
            type="number" step="0.01" min="0"
            className={`input ${errors.selling_price ? 'border-red-400' : ''}`}
            placeholder="0.00"
            {...register('selling_price', { required: 'Required', valueAsNumber: true, min: { value: 0.01, message: 'Must be positive' } })}
          />
          {errors.selling_price && <p className="error-text">{errors.selling_price.message}</p>}
        </div>

        <div className="form-group">
          <label className="label">{t('costPrice')} (ብር) *</label>
          <input
            type="number" step="0.01" min="0"
            className={`input ${errors.cost_price ? 'border-red-400' : ''}`}
            placeholder="0.00"
            {...register('cost_price', { required: 'Required', valueAsNumber: true, min: { value: 0.01, message: 'Must be positive' } })}
          />
          {errors.cost_price && <p className="error-text">{errors.cost_price.message}</p>}
        </div>

        <div className="form-group">
          <label className="label">{t('quantity')} *</label>
          <input
            type="number" min="0"
            className={`input ${errors.quantity ? 'border-red-400' : ''}`}
            placeholder="0"
            {...register('quantity', { required: 'Required', valueAsNumber: true, min: { value: 0, message: 'Cannot be negative' } })}
          />
          {errors.quantity && <p className="error-text">{errors.quantity.message}</p>}
        </div>

        <div className="form-group">
          <label className="label">{t('threshold')}</label>
          <input
            type="number" min="0"
            className="input"
            placeholder="5"
            {...register('low_stock_threshold', { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          {t('cancel')}
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          {t('save')}
        </Button>
      </div>
    </form>
  );
};

export const ProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const isAdmin = useAuthStore((s) => s.user?.role === 'admin');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      setModalOpen(false);
      toast.success('Product created!');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProductInput> }) =>
      productsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      setEditProduct(null);
      toast.success('Product updated!');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      setDeleteProduct(null);
      toast.success('Product deleted');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.supplier || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.size || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoryFilter || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const stockBadge = (p: Product) => {
    const status = getStockStatus(p.quantity, p.low_stock_threshold);
    if (status === 'out') return <Badge variant="danger" dot>{t('outOfStock')}</Badge>;
    if (status === 'low') return <Badge variant="warning" dot>{t('lowStock')}</Badge>;
    return <Badge variant="success" dot>{t('inStock')}</Badge>;
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">{t('inventory')}</h1>
        {isAdmin && (
          <Button
            icon={<Plus />}
            onClick={() => setModalOpen(true)}
            id="add-product-btn"
          >
            {t('addProduct')}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="search-box flex-1">
            <Search className="search-icon" size={16} />
            <input
              className="input pl-10"
              placeholder={t('search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="product-search"
            />
          </div>
          <select
            className="input sm:w-48 cursor-pointer"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">{t('allCategories')}</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <Package size={40} />
            <p className="font-medium">{t('noProducts')}</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>{t('name')}</th>
                <th>{t('category')}</th>
                <th>{t('size')}</th>
                <th>{t('sellingPrice')}</th>
                <th>{t('costPrice')}</th>
                <th>{t('quantity')}</th>
                <th>{t('stockStatus')}</th>
                <th>{t('supplier')}</th>
                <th>{t('date')}</th>
                {isAdmin && <th>{t('actions')}</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <Package size={14} className="text-indigo-500" />
                      </div>
                      <span className="font-medium text-indigo-900">{product.name}</span>
                    </div>
                  </td>
                  <td><Badge variant="primary">{product.category}</Badge></td>
                  <td className="text-indigo-600 font-mono text-sm font-semibold">{product.size || '—'}</td>
                  <td className="font-semibold text-indigo-700">{formatCurrency(product.selling_price)}</td>
                  <td className="text-indigo-500">{formatCurrency(product.cost_price)}</td>
                  <td>
                    <span className={`font-bold ${product.quantity === 0 ? 'text-red-600' : product.quantity <= product.low_stock_threshold ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {product.quantity}
                    </span>
                  </td>
                  <td>{stockBadge(product)}</td>
                  <td className="text-indigo-500 text-xs">{product.supplier || '—'}</td>
                  <td className="text-indigo-400 text-xs">{formatDate(product.created_at)}</td>
                  {isAdmin && (
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditProduct(product)}
                          className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-400 hover:text-indigo-600 transition-colors"
                          aria-label="Edit product"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteProduct(product)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-indigo-300 hover:text-red-500 transition-colors"
                          aria-label="Delete product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={t('addProduct')} size="lg">
        <ProductForm
          onSubmit={(data) => createMutation.mutate(data)}
          loading={createMutation.isPending}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editProduct} onClose={() => setEditProduct(null)} title={t('editProduct')} size="lg">
        {editProduct && (
          <ProductForm
            defaultValues={{
              name: editProduct.name,
              category: editProduct.category,
              size: editProduct.size,
              selling_price: editProduct.selling_price,
              cost_price: editProduct.cost_price,
              quantity: editProduct.quantity,
              low_stock_threshold: editProduct.low_stock_threshold,
              supplier: editProduct.supplier,
            }}
            onSubmit={(data) => updateMutation.mutate({ id: editProduct.id, data })}
            loading={updateMutation.isPending}
            onCancel={() => setEditProduct(null)}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteProduct} onClose={() => setDeleteProduct(null)} title={t('deleteProduct')} size="sm">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 size={24} className="text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-indigo-900">{t('deleteConfirm')}</p>
            <p className="text-sm text-indigo-400 mt-1">"{deleteProduct?.name}"</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeleteProduct(null)} className="flex-1">
              {t('cancel')}
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={() => deleteProduct && deleteMutation.mutate(deleteProduct.id)}
              className="flex-1"
            >
              {t('delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
