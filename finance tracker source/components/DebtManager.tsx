import React, { useState, useEffect } from 'react';
import { Debt } from '../types';
import Card, { CardHeader, CardContent } from './common/Card';
import Button from './common/Button';
import Input from './common/Input';
import Modal from './common/Modal';
import { getDebtAdvice } from '../services/geminiService';

interface DebtManagerProps {
  debts: Debt[];
  remainingBudget: number;
  onAddDebt: (debt: Omit<Debt, 'id'>) => void;
  onUpdateDebt: (id: string, data: Partial<Omit<Debt, 'id'>>) => void;
  onDeleteDebt: (id: string) => void;
}

const DebtItem: React.FC<{ 
    debt: Debt; 
    onEdit: (debt: Debt) => void; 
    onDelete: (id: string) => void;
    recommendedExtra?: number; 
}> = ({ debt, onEdit, onDelete, recommendedExtra }) => {
    const formatCurrency = (value: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);

    return (
        <li className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 relative overflow-hidden group">
             {recommendedExtra !== undefined && recommendedExtra > 0 && (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg z-10 animate-fade-in">
                   + {formatCurrency(recommendedExtra)} recommended
                </div>
            )}
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">{debt.name}</h4>
                    <div className="text-sm text-slate-500 dark:text-slate-400 flex gap-3 mt-1">
                        <span className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-xs font-semibold">{debt.interestRate}% APR</span>
                        <span>Min: {formatCurrency(debt.minimumPayment)}</span>
                    </div>
                </div>
                <div className="text-right">
                     <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatCurrency(debt.totalAmount)}</p>
                </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(debt)} className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">Edit</button>
                <button onClick={() => onDelete(debt.id)} className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium">Delete</button>
            </div>
        </li>
    );
};

interface DebtFormProps {
    onAdd: (debt: Omit<Debt, 'id'>) => void;
    onUpdate: (id: string, data: Partial<Omit<Debt, 'id'>>) => void;
    onClose: () => void;
    debtToEdit: Debt | null;
}

const DebtForm: React.FC<DebtFormProps> = ({ onAdd, onUpdate, onClose, debtToEdit }) => {
    const [name, setName] = useState(debtToEdit?.name || '');
    const [totalAmount, setTotalAmount] = useState(debtToEdit?.totalAmount.toString() || '');
    const [interestRate, setInterestRate] = useState(debtToEdit?.interestRate.toString() || '');
    const [minimumPayment, setMinimumPayment] = useState(debtToEdit?.minimumPayment.toString() || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            name,
            totalAmount: parseFloat(totalAmount),
            interestRate: parseFloat(interestRate),
            minimumPayment: parseFloat(minimumPayment)
        };

        if (debtToEdit) {
            onUpdate(debtToEdit.id, data);
        } else {
            onAdd(data);
        }
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Debt Name</label>
                <Input value={name} onChange={e => setName(e.target.value)} required placeholder="Credit Card A" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Total Balance Remaining</label>
                <Input type="number" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} required min="0" step="0.01" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">APR (%)</label>
                    <Input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} required min="0" step="0.1" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Min. Payment</label>
                    <Input type="number" value={minimumPayment} onChange={e => setMinimumPayment(e.target.value)} required min="0" step="0.01" />
                </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit">Save Debt</Button>
            </div>
        </form>
    );
};

const DebtManager: React.FC<DebtManagerProps> = ({ debts, remainingBudget, onAddDebt, onUpdateDebt, onDeleteDebt }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
    const [aiAdvice, setAiAdvice] = useState<{ strategyName: string; advice: string[]; allocationSuggestion: string } | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    
    // State for manual strategy Calculation
    const [allocation, setAllocation] = useState<Record<string, number>>({});
    const [plannedSurplus, setPlannedSurplus] = useState<number | null>(null);

    // Load strategy from localStorage on mount
    useEffect(() => {
        try {
            const savedStrategy = localStorage.getItem('debtStrategy');
            if (savedStrategy) {
                const parsed = JSON.parse(savedStrategy);
                setAllocation(parsed.allocation || {});
                setPlannedSurplus(parsed.plannedSurplus);
                setAiAdvice(parsed.aiAdvice || null);
            }
        } catch (e) {
            console.error("Failed to load debt strategy", e);
        }
    }, []);

    // Save strategy to localStorage whenever it changes
    const saveStrategy = (newAllocation: Record<string, number>, newSurplus: number | null, newAdvice: any) => {
        const data = {
            allocation: newAllocation,
            plannedSurplus: newSurplus,
            aiAdvice: newAdvice
        };
        localStorage.setItem('debtStrategy', JSON.stringify(data));
    };

    const formatCurrency = (value: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);

    const totalDebt = debts.reduce((sum, d) => sum + d.totalAmount, 0);
    const totalMinPayments = debts.reduce((sum, d) => sum + d.minimumPayment, 0);

    const handleCalculatePlan = () => {
        if (remainingBudget <= 0 || debts.length === 0) {
            setAllocation({});
            setPlannedSurplus(remainingBudget);
            saveStrategy({}, remainingBudget, aiAdvice);
            return;
        }

        // Strategy: Avalanche (Highest APR first)
        const sortedDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);
        const highestAprDebt = sortedDebts[0];
        const newAllocation = { [highestAprDebt.id]: remainingBudget };
        
        setAllocation(newAllocation);
        setPlannedSurplus(remainingBudget);
        saveStrategy(newAllocation, remainingBudget, aiAdvice);
    };

    const handleOpenAdd = () => {
        setEditingDebt(null);
        setIsModalOpen(true);
    };

    const handleEdit = (debt: Debt) => {
        setEditingDebt(debt);
        setIsModalOpen(true);
    };

    const handleGetAiAdvice = async () => {
        setIsAiLoading(true);
        try {
            const result = await getDebtAdvice(debts, remainingBudget);
            setAiAdvice(result);
            saveStrategy(allocation, plannedSurplus, result);
        } catch (e) {
            alert("Could not fetch AI advice at this time.");
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <>
            <Card className="flex flex-col">
                <CardHeader className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/80">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Debt Manager
                    </h2>
                    <Button onClick={handleOpenAdd} className="text-xs">Add Debt</Button>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg text-center">
                            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Total Debt</span>
                            <div className="text-xl font-bold text-slate-800 dark:text-slate-200">{formatCurrency(totalDebt)}</div>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg text-center">
                            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Min Monthly</span>
                            <div className="text-xl font-bold text-slate-800 dark:text-slate-200">{formatCurrency(totalMinPayments)}</div>
                        </div>
                    </div>

                    {/* Debt List */}
                    {debts.length > 0 ? (
                        <div className="space-y-4">
                            <ul className="flex flex-col gap-3">
                                {debts.map(debt => (
                                    <DebtItem 
                                        key={debt.id} 
                                        debt={debt} 
                                        onEdit={handleEdit} 
                                        onDelete={onDeleteDebt}
                                        recommendedExtra={allocation[debt.id]} 
                                    />
                                ))}
                            </ul>
                            
                            {/* Smart Logic Section */}
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Smart Strategy</h3>
                                
                                {plannedSurplus === null ? (
                                    <div className="text-center py-2">
                                        <p className="text-sm text-slate-500 mb-3">
                                            Ready to allocate your surplus cash? Update your bills and income first, then generate a plan.
                                        </p>
                                        <Button onClick={handleCalculatePlan} className="w-full">
                                            Generate Payment Plan
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {plannedSurplus > 0 ? (
                                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-md text-sm text-indigo-800 dark:text-indigo-200">
                                                <p><strong>Plan Active:</strong> Based on a surplus of <strong>{formatCurrency(plannedSurplus)}</strong>.</p>
                                                <p className="mt-1">Apply this extra amount to the debt marked with the green flag.</p>
                                            </div>
                                        ) : (
                                            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md text-sm text-amber-800 dark:text-amber-200">
                                                <p><strong>No Surplus:</strong> Your budget was £0 or negative when this plan was generated.</p>
                                            </div>
                                        )}
                                        
                                        <div className="flex gap-2">
                                            <Button onClick={handleCalculatePlan} variant="secondary" className="flex-1 text-xs">
                                                Recalculate Plan
                                            </Button>
                                            <Button onClick={handleGetAiAdvice} disabled={isAiLoading || !process.env.API_KEY} variant="secondary" className="flex-1 text-xs">
                                                {isAiLoading ? '...' : 'Ask AI'}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {aiAdvice && (
                                    <div className="bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-600 rounded-lg p-4 animate-fade-in mt-3">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-indigo-600 dark:text-indigo-400">{aiAdvice.strategyName}</h4>
                                            <button onClick={() => { setAiAdvice(null); saveStrategy(allocation, plannedSurplus, null); }} className="text-slate-400 hover:text-slate-600">&times;</button>
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-3">{aiAdvice.allocationSuggestion}</p>
                                        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
                                            {aiAdvice.advice.map((tip, idx) => (
                                                <li key={idx}>{tip}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-slate-500">
                            No debts tracked. Add one to see smart insights.
                        </div>
                    )}
                </CardContent>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDebt ? "Edit Debt" : "Add New Debt"}>
                <DebtForm 
                    onAdd={onAddDebt} 
                    onUpdate={onUpdateDebt} 
                    onClose={() => setIsModalOpen(false)} 
                    debtToEdit={editingDebt} 
                />
            </Modal>
        </>
    );
};

export default DebtManager;