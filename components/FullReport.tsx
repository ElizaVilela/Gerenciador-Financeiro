import React, { useMemo } from 'react';
import { FinancialData } from '../types';
import { formatCurrency, formatMonthYear } from '../utils/formatters';
import { getYearMonth } from '../utils/date';

interface FullReportProps {
    data: FinancialData;
}

const FullReport: React.FC<FullReportProps> = ({ data }) => {
    const currentMonthYear = getYearMonth(new Date());

    const { pendingInstallments, paymentHistory, futureProjections } = useMemo(() => {
        const pending: { cardName: string; purchaseItem: string; monthYear: string; amount: number }[] = [];
        const history: { type: string; description: string; date: string; amount: number }[] = [];
        const projections: { [monthYear: string]: number } = {};

        // Fixed Expenses
        data.fixedExpenses.forEach(exp => {
            if (!exp.paidMonths.includes(currentMonthYear)) {
                // Not paid this month, consider it pending for this month
            }
            exp.paidMonths.forEach(month => {
                history.push({
                    type: 'Despesa Fixa',
                    description: exp.description,
                    date: month,
                    amount: exp.amount,
                });
            });
        });

        // Card Installments
        data.cards.forEach(card => {
            card.purchases.forEach(purchase => {
                purchase.installments.forEach(inst => {
                    if (inst.paid) {
                        history.push({
                            type: 'Parcela Cartão',
                            description: `${card.name} - ${purchase.item}`,
                            date: inst.monthYear,
                            amount: inst.amount
                        });
                    } else {
                        pending.push({
                            cardName: card.name,
                            purchaseItem: purchase.item,
                            monthYear: inst.monthYear,
                            amount: inst.amount
                        });
                    }
                     // For projections
                    if (!projections[inst.monthYear]) {
                        projections[inst.monthYear] = 0;
                    }
                    projections[inst.monthYear] += inst.amount;
                });
            });
        });

        history.sort((a, b) => b.date.localeCompare(a.date));
        pending.sort((a, b) => a.monthYear.localeCompare(b.monthYear));
        
        return { pendingInstallments: pending, paymentHistory: history, futureProjections: projections };
    }, [data, currentMonthYear]);
    
    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Parcelas Pendentes (Incluindo Futuras)</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vencimento</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cartão</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Compra</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingInstallments.map((item, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{formatMonthYear(item.monthYear)}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{item.cardName}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{item.purchaseItem}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{formatCurrency(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {pendingInstallments.length === 0 && <p className="text-center py-4 text-gray-500">Nenhuma parcela pendente.</p>}
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                 <h2 className="text-xl font-semibold mb-4">Projeção de Gastos Futuros (Cartão)</h2>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mês/Ano</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total a Pagar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(futureProjections).sort((a,b) => a[0].localeCompare(b[0])).map(([monthYear, total]) => (
                                <tr key={monthYear}>
                                    <td className="px-4 py-2 text-sm">{formatMonthYear(monthYear)}</td>
                                    <td className="px-4 py-2 text-sm font-semibold">{formatCurrency(Number(total))}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Histórico de Pagamentos</h2>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data/Mês</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentHistory.map((item, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{formatMonthYear(item.date)}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{item.type}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{item.description}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{formatCurrency(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {paymentHistory.length === 0 && <p className="text-center py-4 text-gray-500">Nenhum pagamento registrado.</p>}
                </div>
            </div>
        </div>
    );
};

export default FullReport;