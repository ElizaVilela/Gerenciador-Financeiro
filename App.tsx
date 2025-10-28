import React, { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { FinancialData, Tab } from './types';
import { processMonthRollover } from './services/financeService';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import IncomeManager from './components/IncomeManager';
import FixedExpensesManager from './components/FixedExpensesManager';
import CreditCardManager from './components/CreditCardManager';
import FullReport from './components/FullReport';
import AIAssistant from './components/AIAssistant';
import { initialData } from './constants';

const App: React.FC = () => {
    const [data, setData] = useLocalStorage<FinancialData>('finances_data', initialData);
    const [lastProcessedMonth, setLastProcessedMonth] = useLocalStorage<string>('last_processed_month', '');
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');

    const handleDataUpdate = useCallback((newData: FinancialData) => {
        setData(newData);
    }, [setData]);

    useEffect(() => {
        const { updatedData, newLastProcessedMonth, changesMade } = processMonthRollover(data, lastProcessedMonth);
        if (changesMade) {
            console.log("Month rollover processed. Updating data.");
            setData(updatedData);
            setLastProcessedMonth(newLastProcessedMonth);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard data={data} />;
            case 'income':
                return <IncomeManager data={data} onUpdate={handleDataUpdate} />;
            case 'fixedExpenses':
                return <FixedExpensesManager data={data} onUpdate={handleDataUpdate} />;
            case 'creditCards':
                return <CreditCardManager data={data} onUpdate={handleDataUpdate} />;
            case 'report':
                return <FullReport data={data} />;
            default:
                return <Dashboard data={data} />;
        }
    };
    
    const tabs: { id: Tab; label: string }[] = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'income', label: 'Entradas' },
        { id: 'fixedExpenses', label: 'Saídas Fixas' },
        { id: 'creditCards', label: 'Cartões' },
        { id: 'report', label: 'Relatório' },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                
                <div className="transition-opacity duration-300">
                    {renderContent()}
                </div>
            </main>
            <AIAssistant financialData={data} />
        </div>
    );
};

export default App;