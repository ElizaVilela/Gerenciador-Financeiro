import React, { useState } from 'react';
import { FinancialData, FixedExpense } from '../types';
import { formatCurrency } from '../utils/formatters';
import { getYearMonth } from '../utils/date';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';

interface FixedExpensesManagerProps {
    data: FinancialData;
    onUpdate: (newData: FinancialData) => void;
}

const ExpenseForm: React.FC<{
    onSubmit: (expense: Omit<FixedExpense, 'id' | 'paidMonths'>) => void;
    initialData?: FixedExpense | null;
    onCancel: () => void;
}> = ({ onSubmit, initialData, onCancel }) => {
    const [description, setDescription] = useState(initialData?.description || '');
    const [amount, setAmount] = useState(initialData?.amount || 0);
    const [dueDate, setDueDate] = useState(initialData?.dueDate || 1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ description, amount: Number(amount), dueDate: Number(dueDate) });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Valor Mensal</label>
                <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Dia do Vencimento</label>
                <input
                    type="number"
                    min="1"
                    max="31"
                    value={dueDate}
                    onChange={(e) => setDueDate(Number(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                />
            </div>
             <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salvar</button>
            </div>
        </form>
    );
};


const FixedExpensesManager: React.FC<FixedExpensesManagerProps> = ({ data, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null);
    const [expenseToDelete, setExpenseToDelete] = useState<FixedExpense | null>(null);
    const currentYearMonth = getYearMonth(new Date());

    const handleAdd = () => {
        setEditingExpense(null);
        setIsModalOpen(true);
    };
    
    const handleEdit = (expense: FixedExpense) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };

    const handleDeleteRequest = (expense: FixedExpense) => {
        setExpenseToDelete(expense);
    };

    const confirmDelete = () => {
        if (expenseToDelete) {
            const updatedExpenses = data.fixedExpenses.filter(e => e.id !== expenseToDelete.id);
            onUpdate({ ...data, fixedExpenses: updatedExpenses });
        }
    };
    
    const handleSubmit = (expenseData: Omit<FixedExpense, 'id' | 'paidMonths'>) => {
        if (editingExpense) {
            const updatedExpenses = data.fixedExpenses.map(e => e.id === editingExpense.id ? { ...editingExpense, ...expenseData } : e);
            onUpdate({ ...data, fixedExpenses: updatedExpenses });
        } else {
            const newExpense: FixedExpense = { id: crypto.randomUUID(), ...expenseData, paidMonths: [] };
            onUpdate({ ...data, fixedExpenses: [...data.fixedExpenses, newExpense] });
        }
        setIsModalOpen(false);
        setEditingExpense(null);
    };
    
    const togglePaidStatus = (expenseId: string) => {
        const updatedExpenses = data.fixedExpenses.map(exp => {
            if (exp.id === expenseId) {
                const paidMonths = new Set(exp.paidMonths);
                if (paidMonths.has(currentYearMonth)) {
                    paidMonths.delete(currentYearMonth);
                } else {
                    paidMonths.add(currentYearMonth);
                }
                return { ...exp, paidMonths: Array.from(paidMonths) };
            }
            return exp;
        });
        onUpdate({ ...data, fixedExpenses: updatedExpenses });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Saídas Fixas</h2>
                <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
                    Adicionar Despesa
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pago</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimento</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.fixedExpenses.map(item => {
                            const isPaid = item.paidMonths.includes(currentYearMonth);
                            return (
                                <tr key={item.id} className={isPaid ? 'bg-green-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap"><input type="checkbox" checked={isPaid} onChange={() => togglePaidStatus(item.id)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{item.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">{formatCurrency(item.amount)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">Dia {item.dueDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => handleEdit(item)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                        <button onClick={() => handleDeleteRequest(item)} className="text-red-600 hover:text-red-900">Excluir</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {data.fixedExpenses.length === 0 && <p className="text-center py-4 text-gray-500">Nenhuma despesa fixa registrada.</p>}
            </div>
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingExpense ? 'Editar Despesa Fixa' : 'Adicionar Despesa Fixa'}>
                <ExpenseForm
                    onSubmit={handleSubmit}
                    initialData={editingExpense}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
            <ConfirmationModal
                isOpen={!!expenseToDelete}
                onClose={() => setExpenseToDelete(null)}
                onConfirm={confirmDelete}
                title="Confirmar Exclusão"
            >
                 <p>Tem certeza que deseja excluir a despesa: "{expenseToDelete?.description}"?</p>
            </ConfirmationModal>
        </div>
    );
};

export default FixedExpensesManager;