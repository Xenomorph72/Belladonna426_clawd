import React, { useState, useEffect, useRef } from 'react';
import { Income, Owner } from '../types';
import Card, { CardHeader, CardContent } from './common/Card';
import Button from './common/Button';
import Input from './common/Input';
import Modal from './common/Modal';

interface IncomeManagerProps {
  incomes: Income[];
  owners: Owner[];
  onAddIncome: (income: Omit<Income, 'id'>) => void;
  onUpdateIncome: (id: string, data: Partial<Omit<Income, 'id'>>) => void;
  onDeleteIncome: (id: string) => void;
  onRenameOwner: (id: string, newName: string) => void;
}

const IncomeItem: React.FC<{ income: Income; onEdit: (income: Income) => void; onDelete: (id: string) => void }> = ({ income, onEdit, onDelete }) => {
    const formatCurrency = (value: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);

    return (
        <li className="flex items-center justify-between py-3 px-4 odd:bg-slate-50 odd:dark:bg-slate-800/25 even:bg-white even:dark:bg-slate-800/50 rounded-lg">
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{income.source}</span>
            <div className="flex items-center gap-2">
                <span className="font-mono text-green-500">{formatCurrency(income.amount)}</span>
                <button onClick={() => onEdit(income)} className="text-slate-400 hover:text-indigo-500 transition-colors p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
                    </svg>
                </button>
                <button onClick={() => onDelete(income.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </li>
    );
};

interface IncomeFormProps {
    onAddIncome: (income: Omit<Income, 'id'>) => void;
    onUpdateIncome: (id: string, data: Partial<Omit<Income, 'id'>>) => void;
    onClose: () => void;
    incomeToEdit: Income | null;
    owners: Owner[];
}

const IncomeForm: React.FC<IncomeFormProps> = ({ onAddIncome, onUpdateIncome, onClose, incomeToEdit, owners }) => {
    const [source, setSource] = useState('');
    const [amount, setAmount] = useState('');
    const [isRecurring, setIsRecurring] = useState(true);
    const [ownerId, setOwnerId] = useState<string>(owners[0]?.id || '');

    useEffect(() => {
        if(incomeToEdit) {
            setSource(incomeToEdit.source);
            setAmount(String(incomeToEdit.amount));
            setIsRecurring(incomeToEdit.isRecurring);
            setOwnerId(incomeToEdit.ownerId);
        } else {
            setSource('');
            setAmount('');
            setIsRecurring(true);
            setOwnerId(owners[0]?.id || '');
        }
    }, [incomeToEdit, owners]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (source && amount && ownerId) {
            const incomeData = { source, amount: parseFloat(amount), isRecurring, ownerId };
            if (incomeToEdit) {
                onUpdateIncome(incomeToEdit.id, incomeData);
            } else {
                onAddIncome(incomeData);
            }
            onClose();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="incomeSource" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Income Source</label>
                <Input id="incomeSource" type="text" value={source} onChange={e => setSource(e.target.value)} placeholder="e.g., Salary" required />
            </div>
             <div>
                <label htmlFor="incomeAmount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount</label>
                <Input id="incomeAmount" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g., 3000" required min="0.01" step="0.01" />
            </div>
             <div>
                <label htmlFor="incomeOwner" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assigned To</label>
                <select id="incomeOwner" value={ownerId} onChange={e => setOwnerId(e.target.value)} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
            </div>
             <div className="flex items-center">
                <input id="isRecurringIncome" type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                <label htmlFor="isRecurringIncome" className="ml-2 block text-sm text-slate-800 dark:text-slate-200">This is a recurring income source</label>
            </div>
            <div className="flex justify-end pt-2 gap-2">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit">{incomeToEdit ? 'Save Changes' : 'Add Income'}</Button>
            </div>
        </form>
    )
}

const OwnerColumnHeader: React.FC<{ name: string; total: number; onRename: (newName: string) => void }> = ({ name, total, onRename }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentName, setCurrentName] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);
  const formatCurrency = (value: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setCurrentName(name);
  }, [name]);

  const handleRename = () => {
    if (currentName.trim() && currentName.trim() !== name) {
      onRename(currentName.trim());
    } else {
      setCurrentName(name);
    }
    setIsEditing(false);
  };

  return (
    <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200 dark:border-slate-700" onDoubleClick={() => setIsEditing(true)}>
      {isEditing ? (
        <Input
          ref={inputRef}
          type="text"
          value={currentName}
          onChange={(e) => setCurrentName(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => e.key === 'Enter' ? handleRename() : e.key === 'Escape' ? setIsEditing(false) : null}
          className="text-lg font-bold !p-0 !bg-transparent !border-0 ring-2 ring-indigo-500 rounded"
        />
      ) : (
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 truncate" title="Double-click to rename">{name}</h3>
      )}
      <span className="font-mono text-sm text-green-500 shrink-0 ml-2">{formatCurrency(total)}</span>
    </div>
  );
};


const IncomeManager: React.FC<IncomeManagerProps> = ({ incomes, owners, onAddIncome, onUpdateIncome, onDeleteIncome, onRenameOwner }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  const handleOpenAddModal = () => {
    setEditingIncome(null);
    setIsModalOpen(true);
  }

  const handleOpenEditModal = (income: Income) => {
    setEditingIncome(income);
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIncome(null);
  }

  return (
    <>
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Income Sources</h2>
          <Button onClick={handleOpenAddModal}>Add Income</Button>
        </CardHeader>
        <CardContent>
          {incomes.length > 0 ? (
            <div className="space-y-6">
              {(owners || []).map(owner => {
                const ownerIncomes = incomes.filter(i => i.ownerId === owner.id);
                const ownerTotal = ownerIncomes.reduce((sum, i) => sum + i.amount, 0);
                
                return (
                  <div key={owner.id}>
                    <OwnerColumnHeader name={owner.name} total={ownerTotal} onRename={(newName) => onRenameOwner(owner.id, newName)} />
                    {ownerIncomes.length > 0 ? (
                      <ul className="space-y-2 mt-2">
                        {ownerIncomes.map(income => (
                          <IncomeItem key={income.id} income={income} onEdit={handleOpenEditModal} onDelete={onDeleteIncome} />
                        ))}
                      </ul>
                    ) : (
                      <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-4">No income assigned to {owner.name}.</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
             <p className="text-center text-slate-500 dark:text-slate-400 py-8">No income sources added yet.</p>
          )}
        </CardContent>
      </Card>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingIncome ? 'Edit Income Source' : 'Add New Income'}>
          <IncomeForm
            onAddIncome={onAddIncome}
            onUpdateIncome={onUpdateIncome}
            onClose={handleCloseModal}
            incomeToEdit={editingIncome}
            owners={owners}
           />
      </Modal>
    </>
  );
};

export default IncomeManager;