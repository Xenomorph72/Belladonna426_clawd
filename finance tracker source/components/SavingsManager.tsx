import React, { useState, useEffect } from 'react';
import { SavingsGoal } from '../types';
import Card, { CardHeader, CardContent } from './common/Card';
import Button from './common/Button';
import Input from './common/Input';
import Modal from './common/Modal';

interface SavingsManagerProps {
  goals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  onDeleteGoal: (id: string) => void;
  onUpdateGoal: (id: string, data: Partial<Omit<SavingsGoal, 'id'>>) => void;
  remainingBalance: number;
}

const SavingsGoalItem: React.FC<{ goal: SavingsGoal; onEdit: (goal: SavingsGoal) => void; onDelete: (id: string) => void; onUpdate: (id: string, data: Partial<Omit<SavingsGoal, 'id'>>) => void; remainingBalance: number }> = ({ goal, onEdit, onDelete, onUpdate, remainingBalance }) => {
    const [addAmount, setAddAmount] = useState('');
    const formatCurrency = (value: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);
    const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);

    const handleAddFunds = (e: React.FormEvent) => {
        e.preventDefault();
        const amountToAdd = parseFloat(addAmount);
        if(!isNaN(amountToAdd) && amountToAdd > 0) {
            onUpdate(goal.id, { currentAmount: goal.currentAmount + amountToAdd });
            setAddAmount('');
        }
    }

    return (
        <li className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">{goal.name}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatCurrency(goal.currentAmount)} / <span className="font-semibold">{formatCurrency(goal.targetAmount)}</span>
                    </p>
                </div>
                 <div className="flex items-center gap-1">
                    <button onClick={() => onEdit(goal)} className="text-slate-400 hover:text-indigo-500 transition-colors p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
                        </svg>
                    </button>
                    <button onClick={() => onDelete(goal.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <form onSubmit={handleAddFunds} className="flex gap-2 items-center">
                <Input type="number" placeholder="Add funds" value={addAmount} onChange={e => setAddAmount(e.target.value)} min="0.01" step="0.01" className="h-9 text-sm" />
                <Button type="submit" className="h-9 !px-3" disabled={remainingBalance < parseFloat(addAmount) || !addAmount}>+</Button>
            </form>
        </li>
    );
};

interface AddGoalFormProps {
    onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
    onUpdateGoal: (id: string, data: Partial<Omit<SavingsGoal, 'id'>>) => void;
    onClose: () => void;
    goalToEdit: SavingsGoal | null;
}

const AddGoalForm: React.FC<AddGoalFormProps> = ({ onAddGoal, onUpdateGoal, onClose, goalToEdit }) => {
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');

    useEffect(() => {
        if(goalToEdit) {
            setName(goalToEdit.name);
            setTargetAmount(String(goalToEdit.targetAmount));
        } else {
            setName('');
            setTargetAmount('');
        }
    }, [goalToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(name && targetAmount) {
            const goalData = { name, targetAmount: parseFloat(targetAmount) };
            if (goalToEdit) {
                onUpdateGoal(goalToEdit.id, goalData);
            } else {
                onAddGoal({ ...goalData, currentAmount: 0 });
            }
            onClose();
        }
    }
    return (
         <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="goalName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Goal Name</label>
                <Input id="goalName" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., New Laptop" required />
            </div>
             <div>
                <label htmlFor="targetAmount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Amount</label>
                <Input id="targetAmount" type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="e.g., 1500" required min="1" />
            </div>
            <div className="flex justify-end pt-2 gap-2">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit">{goalToEdit ? 'Save Changes' : 'Set Goal'}</Button>
            </div>
        </form>
    );
}

const SavingsManager: React.FC<SavingsManagerProps> = ({ goals, onAddGoal, onDeleteGoal, onUpdateGoal, remainingBalance }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

    const handleOpenAddModal = () => {
        setEditingGoal(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (goal: SavingsGoal) => {
        setEditingGoal(goal);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingGoal(null);
    };

    return (
    <>
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Savings Goals</h2>
          <Button onClick={handleOpenAddModal}>New Goal</Button>
        </CardHeader>
        <CardContent>
          {goals.length > 0 ? (
            <ul className="space-y-4">
              {goals.map(goal => (
                <SavingsGoalItem key={goal.id} goal={goal} onEdit={handleOpenEditModal} onDelete={onDeleteGoal} onUpdate={onUpdateGoal} remainingBalance={remainingBalance} />
              ))}
            </ul>
          ) : (
            <p className="text-center text-slate-500 dark:text-slate-400 py-8">No savings goals yet. Create one to start saving!</p>
          )}
        </CardContent>
      </Card>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingGoal ? "Edit Savings Goal" : "Create a New Savings Goal"}>
        <AddGoalForm 
            onAddGoal={onAddGoal}
            onUpdateGoal={onUpdateGoal}
            onClose={handleCloseModal}
            goalToEdit={editingGoal}
        />
      </Modal>
    </>
  );
};

export default SavingsManager;