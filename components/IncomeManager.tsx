import React, { useState } from 'react';
import { FinancialData, Income } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { dateToYearMonthDay } from '../utils/date';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';

interface IncomeManagerProps {
    data: FinancialData;
    onUpdate: (newData: FinancialData) => void;
}

const IncomeForm: React.FC<{
    onSubmit: (income: Omit<Income, 'id'>) => void;
    initialData?: Income | null;
    onCancel: () => void;
}> = ({ onSubmit, initialData, onCancel }) => {
    const [description, setDescription] = useState(initialData?.description || '');
    const [amount, setAmount] = useState(initialData?.amount || 0);
    const [date, setDate] = useState(initialData?.date || dateToYearMonthDay(new Date()));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ description, amount: Number(amount), date });
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
                <label className="block text-sm font-medium text-gray-700">Valor</label>
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
                <label className="block text-sm font-medium text-gray-700">Data</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
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

const IncomeManager: React.FC<IncomeManagerProps> = ({ data, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIncome, setEditingIncome] = useState<Income | null>(null);
    const [incomeToDelete, setIncomeToDelete] = useState<Income | null>(null);

    const handleAdd = () => {
        setEditingIncome(null);
        setIsModalOpen(true);
    };
    
    const handleEdit = (income: Income) => {
        setEditingIncome(income);
        setIsModalOpen(true);
    };

    const handleDeleteRequest = (income: Income) => {
        setIncomeToDelete(income);
    };

    const confirmDelete = () => {
        if (incomeToDelete) {
            const updatedIncome = data.income.filter(i => i.id !== incomeToDelete.id);
            onUpdate({ ...data, income: updatedIncome });
            setIncomeToDelete(null);
        }
    };
    
    const handleSubmit = (incomeData: Omit<Income, 'id'>) => {
        if (editingIncome) {
            const updatedIncome = data.income.map(i => i.id === editingIncome.id ? { ...editingIncome, ...incomeData } : i);
            onUpdate({ ...data, income: updatedIncome });
        } else {
            const newIncome: Income = { id: crypto.randomUUID(), ...incomeData };
            onUpdate({ ...data, income: [...data.income, newIncome] });
        }
        setIsModalOpen(false);
        setEditingIncome(null);
    };


    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Entradas (Recebidos)</h2>
                <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
                    Adicionar Entrada
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.income.map(item => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(item.date)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{formatCurrency(item.amount)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => handleEdit(item)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                    <button onClick={() => handleDeleteRequest(item)} className="text-red-600 hover:text-red-900">Excluir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {data.income.length === 0 && <p className="text-center py-4 text-gray-500">Nenhuma entrada registrada.</p>}
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingIncome ? 'Editar Entrada' : 'Adicionar Nova Entrada'}>
                <IncomeForm
                    onSubmit={handleSubmit}
                    initialData={editingIncome}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
            <ConfirmationModal
                isOpen={!!incomeToDelete}
                onClose={() => setIncomeToDelete(null)}
                onConfirm={confirmDelete}
                title="Confirmar Exclusão"
            >
                <p>Tem certeza que deseja excluir a entrada: "{incomeToDelete?.description}"?</p>
            </ConfirmationModal>
        </div>
    );
};

export default IncomeManager;