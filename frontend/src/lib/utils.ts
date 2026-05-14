// Format currency in ETB (Ethiopian Birr)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ET', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' ብር';
}

// Format date
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-ET', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format date-time
export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-ET', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Get stock status
export function getStockStatus(quantity: number, threshold: number) {
  if (quantity === 0) return 'out';
  if (quantity <= threshold) return 'low';
  return 'healthy';
}

// Abbreviate large numbers
export function abbreviateNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toFixed(0);
}

// Get error message from axios error
export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as any;
    return axiosError.response?.data?.message || 'An error occurred';
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}

// Class merging utility
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
