import React, { useEffect, useRef } from 'react';
import { FinancialData } from '../types';
import { calculateTotals } from '../services/financeService';
import { formatCurrency } from '../utils/formatters';
import type { Chart } from 'chart.js';

interface DashboardProps {
    data: FinancialData;
}

const StatCard: React.FC<{ title: string; value: string; colorClass: string, icon: React.ReactNode }> = ({ title, value, colorClass, icon }) => (
    <div className="bg-white rounded-lg shadow-sm p-5 flex items-center space-x-4">
        <div className={`rounded-full p-3 ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-semibold text-gray-800">{value}</p>
        </div>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ data }) => {
    const { totalIncome, balance, toPayThisMonth, totalPaidThisMonth, totalPaidFixedExpensesThisMonth, totalPaidCardExpensesThisMonth } = calculateTotals(data);
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (chartRef.current) {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }

            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                const chartData = {
                    labels: ['Despesas Fixas Pagas', 'Despesas Cartão Pagas'],
                    datasets: [
                        {
                            label: 'Gastos do Mês',
                            data: [totalPaidFixedExpensesThisMonth, totalPaidCardExpensesThisMonth],
                            backgroundColor: [
                                'rgba(59, 130, 246, 0.7)', // blue-500
                                'rgba(239, 68, 68, 0.7)',  // red-500
                            ],
                            borderColor: [
                                'rgba(59, 130, 246, 1)',
                                'rgba(239, 68, 68, 1)',
                            ],
                            borderWidth: 1,
                        },
                    ],
                };
                
                chartInstanceRef.current = new (window as any).Chart(ctx, {
                    type: 'doughnut',
                    data: chartData,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                            },
                            title: {
                                display: false,
                            },
                        },
                    },
                });
            }
        }
        
        return () => {
             if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        }
    }, [data, totalPaidFixedExpensesThisMonth, totalPaidCardExpensesThisMonth]);


    const CashIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    );
    const WalletIcon = () => (
         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    );

    const ExclamationIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    );
    
    const CheckCircleIcon = () => (
         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Entradas do Mês" value={formatCurrency(totalIncome)} colorClass="bg-green-100" icon={<CashIcon />} />
                <StatCard title="Pago este Mês" value={formatCurrency(totalPaidThisMonth)} colorClass="bg-indigo-100" icon={<CheckCircleIcon />} />
                <StatCard title="A Pagar neste Mês" value={formatCurrency(toPayThisMonth)} colorClass="bg-yellow-100" icon={<ExclamationIcon />} />
                <StatCard title="Saldo Geral" value={formatCurrency(balance)} colorClass="bg-blue-100" icon={<WalletIcon />} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                 <h2 className="text-lg font-semibold mb-4 text-gray-800">Balanço de Despesas do Mês</h2>
                 <div className="h-80 relative">
                     <canvas ref={chartRef}></canvas>
                 </div>
            </div>
        </div>
    );
};

export default Dashboard;