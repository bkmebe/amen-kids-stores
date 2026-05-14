export function calculateProfit(
  quantitySold: number,
  sellingPrice: number,
  costPrice: number,
  discount: number = 0
): { totalAmount: number; totalCost: number; profit: number; discount: number } {
  const grossAmount = quantitySold * sellingPrice;
  const totalAmount = grossAmount - discount;
  const totalCost = quantitySold * costPrice;
  const profit = totalAmount - totalCost;

  return {
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    totalCost: parseFloat(totalCost.toFixed(2)),
    profit: parseFloat(profit.toFixed(2)),
    discount: parseFloat(discount.toFixed(2)),
  };
}

export function sumArray(arr: number[]): number {
  return parseFloat(arr.reduce((acc, val) => acc + val, 0).toFixed(2));
}

export function calculateNetProfit(
  totalRevenue: number,
  totalProductCosts: number,
  totalExpenses: number
): number {
  return parseFloat((totalRevenue - totalProductCosts - totalExpenses).toFixed(2));
}
