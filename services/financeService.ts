import { FinancialData, Purchase, Card } from '../types';
import { getYearMonth, getFirstDayOfCurrentMonth, dateToYearMonthDay } from '../utils/date';

interface MonthRolloverResult {
    updatedData: FinancialData;
    newLastProcessedMonth: string;
    changesMade: boolean;
}

export const processMonthRollover = (data: FinancialData, lastProcessedMonth: string): MonthRolloverResult => {
    const currentMonth = getFirstDayOfCurrentMonth();
    const currentMonthStr = dateToYearMonthDay(currentMonth);

    if (lastProcessedMonth >= currentMonthStr) {
        return { updatedData: data, newLastProcessedMonth: lastProcessedMonth, changesMade: false };
    }

    let changesMade = false;
    const today = new Date();
    const updatedCards = data.cards.map(card => {
        const updatedPurchases = card.purchases.map(purchase => {
            if (purchase.paidInstallmentsCount >= purchase.totalInstallments) {
                return purchase;
            }

            const cardDueDateInPreviousMonth = new Date(today.getFullYear(), today.getMonth() -1, card.dueDate);

            if (today <= cardDueDateInPreviousMonth) {
                 return purchase;
            }

            const newInstallments = [...purchase.installments];
            let newPaidCount = purchase.paidInstallmentsCount;

            purchase.installments.forEach((inst, index) => {
                const [year, month] = inst.monthYear.split('-').map(Number);
                const installmentDate = new Date(year, month - 1, card.dueDate);
                
                if (!inst.paid && installmentDate < today && newPaidCount < purchase.totalInstallments) {
                    newInstallments[index] = { ...inst, paid: true };
                    newPaidCount++;
                    changesMade = true;
                }
            });

            return { ...purchase, installments: newInstallments, paidInstallmentsCount: newPaidCount };
        });
        return { ...card, purchases: updatedPurchases };
    });

    if (changesMade) {
        return {
            updatedData: { ...data, cards: updatedCards },
            newLastProcessedMonth: currentMonthStr,
            changesMade: true,
        };
    }
    
    return { updatedData: data, newLastProcessedMonth: lastProcessedMonth, changesMade: false };
};


export const calculateTotals = (data: FinancialData) => {
    const currentYearMonth = getYearMonth(new Date());

    const totalIncome = data.income.reduce((sum, item) => sum + item.amount, 0);
    
    const totalPaidFixedExpensesThisMonth = data.fixedExpenses
        .filter(e => e.paidMonths.includes(currentYearMonth))
        .reduce((sum, e) => sum + e.amount, 0);

    const totalPaidCardExpensesThisMonth = data.cards.flatMap(c => c.purchases)
        .flatMap(p => p.installments)
        .filter(i => i.monthYear === currentYearMonth && i.paid)
        .reduce((sum, i) => sum + i.amount, 0);
    
    const totalPaidThisMonth = totalPaidFixedExpensesThisMonth + totalPaidCardExpensesThisMonth;

    const totalPaidExpenses = data.fixedExpenses
        .flatMap(e => e.paidMonths.map(m => ({ amount: e.amount, month: m })))
        .reduce((sum, item) => sum + item.amount, 0)
        +
        data.cards.flatMap(c => c.purchases)
        .flatMap(p => p.installments)
        .filter(i => i.paid)
        .reduce((sum, i) => sum + i.amount, 0);

    const balance = totalIncome - totalPaidExpenses;

    const toPayThisMonth = data.fixedExpenses
        .filter(exp => !exp.paidMonths.includes(currentYearMonth))
        .reduce((sum, item) => sum + item.amount, 0)
        +
        data.cards.flatMap(card =>
            card.purchases.flatMap(purchase =>
                purchase.installments.filter(inst => inst.monthYear === currentYearMonth && !inst.paid)
            )
        ).reduce((sum, inst) => sum + inst.amount, 0);

    return {
        totalIncome,
        totalPaidExpenses,
        balance,
        toPayThisMonth,
        totalPaidThisMonth,
        totalPaidFixedExpensesThisMonth,
        totalPaidCardExpensesThisMonth,
    };
};