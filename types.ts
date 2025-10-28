
export interface Income {
    id: string;
    date: string; // YYYY-MM-DD
    description: string;
    amount: number;
}

export interface FixedExpense {
    id: string;
    description: string;
    amount: number;
    dueDate: number; // Day of the month
    paidMonths: string[]; // e.g., ["2024-07", "2024-08"]
}

export interface Installment {
    monthYear: string; // YYYY-MM
    amount: number;
    paid: boolean;
}

export interface Purchase {
    id: string;
    purchaseDate: string; // YYYY-MM-DD
    store: string;
    item: string;
    totalInstallments: number;
    paidInstallmentsCount: number;
    installments: Installment[];
}

export interface Card {
    id: string;
    name: string;
    dueDate: number; // Day of the month
    purchases: Purchase[];
}

export interface FinancialData {
    income: Income[];
    fixedExpenses: FixedExpense[];
    cards: Card[];
}

export type Tab = 'dashboard' | 'income' | 'fixedExpenses' | 'creditCards' | 'report';
