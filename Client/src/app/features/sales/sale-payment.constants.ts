/** Mirrors `paymentMethod` enum on server `Receipt` model. */
export const SALE_PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'check', label: 'Check' },
  { value: 'bank_transfer', label: 'Bank transfer' },
] as const;

export type SalePaymentMethod = (typeof SALE_PAYMENT_METHODS)[number]['value'];
