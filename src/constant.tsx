export const SECRET_KEY = import.meta.env.VITE_SECRET_KEY ?? "";
export const API_URL = import.meta.env.VITE_API_URL ?? "";

// Pagination
export const PAGE_LIMIT = 8;

// View Icons
export const VIEW_ICONS = {
    TABLE: 'solar:list-bold',
    GRID: 'solar:widget-bold',
} as const;

export const PAYMENT_STATUS: any = {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed'
}

export const PAYMENT_METHODS: any = {
    CASH_ON_DELIVERY: 'cash_on_delivery',
    CREDIT_CARD: 'credit_card',
    DEBIT_CARD: 'debit_card',
    UPI: 'upi',
}