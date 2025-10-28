import React, { useState } from 'react';
import { Card, FinancialData, Purchase, Installment } from '../types';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import { formatCurrency, formatDate, formatMonthYear } from '../utils/formatters';
import { dateToYearMonthDay, getYearMonth } from '../utils/date';

interface CreditCardManagerProps {
    data: FinancialData;
    onUpdate: (newData: FinancialData) => void;
}

// Sub-component for a single card's details
const CardDetails: React.FC<{
    card: Card;
    onUpdateCard: (updatedCard: Card) => void;
    onDeleteCard: (cardId: string) => void;
}> = ({ card, onUpdateCard, onDeleteCard }) => {
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
    const [purchaseToDelete, setPurchaseToDelete] = useState<Purchase | null>(null);

    const handleAddPurchase = () => {
        setEditingPurchase(null);
        setIsPurchaseModalOpen(true);
    };
    
    const handleEditPurchase = (purchase: Purchase) => {
        setEditingPurchase(purchase);
        setIsPurchaseModalOpen(true);
    };

    const handleDeletePurchaseRequest = (purchase: Purchase) => {
        setPurchaseToDelete(purchase);
    };

    const confirmDeletePurchase = () => {
        if(purchaseToDelete){
            const updatedPurchases = card.purchases.filter(p => p.id !== purchaseToDelete.id);
            onUpdateCard({ ...card, purchases: updatedPurchases });
        }
    };

    const handleSubmitPurchase = (purchaseData: Omit<Purchase, 'id' | 'paidInstallmentsCount' | 'installments'>) => {
        const installmentAmount = (purchaseData.item.split(',').reduce((acc, v) => acc + parseFloat(v), 0)) / purchaseData.totalInstallments;

        const installments: Installment[] = [];
        const purchaseDate = new Date(purchaseData.purchaseDate + 'T12:00:00Z'); // Use noon to avoid timezone issues
        for (let i = 0; i < purchaseData.totalInstallments; i++) {
            const installmentDate = new Date(purchaseDate);
            installmentDate.setMonth(installmentDate.getMonth() + i + 1);
            installments.push({
                monthYear: getYearMonth(installmentDate),
                amount: installmentAmount,
                paid: false,
            });
        }
        
        if (editingPurchase) {
             const updatedPurchases = card.purchases.map(p => p.id === editingPurchase.id ? { 
                ...editingPurchase,
                ...purchaseData, 
                installments: installments, // Recalculate installments
                paidInstallmentsCount: p.installments.filter(i => i.paid).length // Keep paid status
             } : p);
             onUpdateCard({ ...card, purchases: updatedPurchases });
        } else {
             const newPurchase: Purchase = { 
                id: crypto.randomUUID(), 
                ...purchaseData, 
                installments, 
                paidInstallmentsCount: 0
            };
            onUpdateCard({ ...card, purchases: [...card.purchases, newPurchase] });
        }
        setIsPurchaseModalOpen(false);
        setEditingPurchase(null);
    };
    
    const toggleInstallmentPaid = (purchaseId: string, monthYear: string) => {
        const updatedPurchases = card.purchases.map(p => {
            if (p.id === purchaseId) {
                let paidCount = p.paidInstallmentsCount;
                const newInstallments = p.installments.map(i => {
                    if (i.monthYear === monthYear) {
                        if (i.paid) paidCount--; else paidCount++;
                        return { ...i, paid: !i.paid };
                    }
                    return i;
                });
                return { ...p, installments: newInstallments, paidInstallmentsCount: paidCount };
            }
            return p;
        });
        onUpdateCard({ ...card, purchases: updatedPurchases });
    };

    return (
        <div className="mt-4">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Compras</h3>
                 <div className="space-x-2">
                     <button onClick={handleAddPurchase} className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium">
                        Adicionar Compra
                    </button>
                    <button onClick={() => onDeleteCard(card.id)} className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium">
                        Excluir Cartão
                    </button>
                 </div>
            </div>
            {card.purchases.map(purchase => (
                <div key={purchase.id} className="mb-4 border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-3">
                        <div><strong>Data:</strong> {formatDate(purchase.purchaseDate)}</div>
                        <div><strong>Local:</strong> {purchase.store}</div>
                        <div><strong>Item:</strong> {purchase.item.split(',').map(v => formatCurrency(parseFloat(v))).join(' + ')}</div>
                        <div className="font-semibold"><strong>Total:</strong> {formatCurrency(purchase.installments.reduce((a, b) => a + b.amount, 0))}</div>
                        <div><strong>Parcelas:</strong> {purchase.paidInstallmentsCount}/{purchase.totalInstallments}</div>
                    </div>
                     <div className="flex justify-end space-x-2 mb-3">
                        <button onClick={() => handleEditPurchase(purchase)} className="text-xs text-indigo-600 hover:text-indigo-900">Editar</button>
                        <button onClick={() => handleDeletePurchaseRequest(purchase)} className="text-xs text-red-600 hover:text-red-900">Excluir</button>
                    </div>
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-2 px-3 text-left">Parcela</th>
                                <th className="py-2 px-3 text-left">Vencimento</th>
                                <th className="py-2 px-3 text-left">Valor</th>
                                <th className="py-2 px-3 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchase.installments.map((inst, index) => (
                                <tr key={inst.monthYear} className={inst.paid ? 'bg-green-50' : ''}>
                                    <td className="py-2 px-3">{index + 1}/{purchase.totalInstallments}</td>
                                    <td className="py-2 px-3">{formatMonthYear(inst.monthYear)}</td>
                                    <td className="py-2 px-3">{formatCurrency(inst.amount)}</td>
                                    <td className="py-2 px-3">
                                        <input type="checkbox" checked={inst.paid} onChange={() => toggleInstallmentPaid(purchase.id, inst.monthYear)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
             {card.purchases.length === 0 && <p className="text-center py-4 text-gray-500">Nenhuma compra registrada para este cartão.</p>}
            
            <PurchaseFormModal 
                isOpen={isPurchaseModalOpen}
                onClose={() => setIsPurchaseModalOpen(false)}
                onSubmit={handleSubmitPurchase}
                initialData={editingPurchase}
            />
            <ConfirmationModal
                isOpen={!!purchaseToDelete}
                onClose={() => setPurchaseToDelete(null)}
                onConfirm={confirmDeletePurchase}
                title="Confirmar Exclusão de Compra"
            >
                <p>Tem certeza que deseja excluir esta compra e todas as suas parcelas?</p>
                <p className="font-semibold mt-2">{purchaseToDelete?.store} - {purchaseToDelete?.item}</p>
            </ConfirmationModal>
        </div>
    );
};

const PurchaseFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (purchase: Omit<Purchase, 'id' | 'paidInstallmentsCount' | 'installments'>) => void;
    initialData?: Purchase | null;
}> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [purchaseDate, setPurchaseDate] = useState(initialData?.purchaseDate || dateToYearMonthDay(new Date()));
    const [store, setStore] = useState(initialData?.store || '');
    const [item, setItem] = useState(initialData?.item || '');
    const [totalInstallments, setTotalInstallments] = useState(initialData?.totalInstallments || 1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ purchaseDate, store, item, totalInstallments });
    };
    
    React.useEffect(() => {
        if(initialData) {
            setPurchaseDate(initialData.purchaseDate);
            setStore(initialData.store);
            setItem(initialData.item);
            setTotalInstallments(initialData.totalInstallments);
        } else {
            setPurchaseDate(dateToYearMonthDay(new Date()));
            setStore('');
            setItem('');
            setTotalInstallments(1);
        }
    }, [initialData]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Editar Compra" : "Adicionar Compra"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Form fields */}
                <div><label className="block text-sm font-medium">Data da Compra</label><input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="mt-1 w-full p-2 border rounded" required /></div>
                <div><label className="block text-sm font-medium">Local/Loja</label><input type="text" value={store} onChange={e => setStore(e.target.value)} className="mt-1 w-full p-2 border rounded" required /></div>
                <div><label className="block text-sm font-medium">Item/Valor (separe múltiplos valores com vírgula)</label><input type="text" value={item} onChange={e => setItem(e.target.value)} placeholder="Ex: 50.00,25.50" className="mt-1 w-full p-2 border rounded" required /></div>
                <div><label className="block text-sm font-medium">Total de Parcelas</label><input type="number" min="1" value={totalInstallments} onChange={e => setTotalInstallments(Number(e.target.value))} className="mt-1 w-full p-2 border rounded" required /></div>
                <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salvar</button>
                </div>
            </form>
        </Modal>
    );
};

// Main Component
const CreditCardManager: React.FC<CreditCardManagerProps> = ({ data, onUpdate }) => {
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [cardToDelete, setCardToDelete] = useState<Card | null>(null);
    const [activeCardId, setActiveCardId] = useState<string | null>(data.cards[0]?.id || null);

    const handleAddCard = (card: Omit<Card, 'id' | 'purchases'>) => {
        const newCard: Card = { id: crypto.randomUUID(), ...card, purchases: [] };
        const updatedCards = [...data.cards, newCard];
        onUpdate({ ...data, cards: updatedCards });
        setActiveCardId(newCard.id);
        setIsCardModalOpen(false);
    };

    const handleUpdateCard = (updatedCard: Card) => {
        const updatedCards = data.cards.map(c => c.id === updatedCard.id ? updatedCard : c);
        onUpdate({ ...data, cards: updatedCards });
    };

    const handleDeleteCardRequest = (cardId: string) => {
        const card = data.cards.find(c => c.id === cardId);
        if (card) {
            setCardToDelete(card);
        }
    }

    const confirmDeleteCard = () => {
        if (cardToDelete) {
            const updatedCards = data.cards.filter(c => c.id !== cardToDelete.id);
            onUpdate({ ...data, cards: updatedCards });
            if(activeCardId === cardToDelete.id) {
                setActiveCardId(updatedCards[0]?.id || null);
            }
        }
    }
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Cartões de Crédito</h2>
                <button onClick={() => setIsCardModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
                    Adicionar Cartão
                </button>
            </div>
            
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-4">
                    {data.cards.map(card => (
                        <button
                            key={card.id}
                            onClick={() => setActiveCardId(card.id)}
                            className={`py-3 px-3 text-sm font-medium border-b-2 ${activeCardId === card.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            {card.name} (Venc. dia {card.dueDate})
                        </button>
                    ))}
                </nav>
            </div>
            
            {activeCardId && data.cards.find(c => c.id === activeCardId) ? (
                 <CardDetails
                    card={data.cards.find(c => c.id === activeCardId)!}
                    onUpdateCard={handleUpdateCard}
                    onDeleteCard={handleDeleteCardRequest}
                />
            ) : (
                <p className="text-center py-8 text-gray-500">Selecione um cartão ou adicione um novo para começar.</p>
            )}

            <CardFormModal isOpen={isCardModalOpen} onClose={() => setIsCardModalOpen(false)} onSubmit={handleAddCard} />
            <ConfirmationModal
                isOpen={!!cardToDelete}
                onClose={() => setCardToDelete(null)}
                onConfirm={confirmDeleteCard}
                title="Confirmar Exclusão de Cartão"
            >
                <p>Tem certeza que deseja excluir o cartão "{cardToDelete?.name}" e todas as suas compras? Esta ação não pode ser desfeita.</p>
            </ConfirmationModal>
        </div>
    );
};

const CardFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (card: Omit<Card, 'id' | 'purchases'>) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [dueDate, setDueDate] = useState(10);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, dueDate: Number(dueDate) });
        setName('');
        setDueDate(10);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Novo Cartão">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium">Nome do Cartão</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full p-2 border rounded" required /></div>
                <div><label className="block text-sm font-medium">Dia do Vencimento</label><input type="number" min="1" max="31" value={dueDate} onChange={e => setDueDate(Number(e.target.value))} className="mt-1 w-full p-2 border rounded" required /></div>
                <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salvar</button>
                </div>
            </form>
        </Modal>
    );
};

export default CreditCardManager;