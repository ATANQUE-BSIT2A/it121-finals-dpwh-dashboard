export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "₱0";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number | null | undefined): string {
  if (num == null) return "0";
  return new Intl.NumberFormat("en-PH").format(num);
}
