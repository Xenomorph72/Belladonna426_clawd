import React, { useState, useEffect, useRef } from 'react';
import { Bill, BillCategory, Owner } from '../types';
import Card, { CardHeader, CardContent } from './common/Card';
import Button from './common/Button';
import Modal from './common/Modal';
import Input from './common/Input';

interface OutgoingsManagerProps {
  bills: Bill[];
  owners: Owner[];
  onAddBill: (bill: Omit<Bill, 'id' | 'isPaid'>) => void;
  onUpdateBill: (id: string, bill: Partial<Omit<Bill, 'id'>>) => void;
  onDeleteBill: (id: string) => void;
  onSetBillPaid: (id: string, isPaid: boolean) => void;
  onRenameOwner: (id: string, newName: string) => void;
}

const BillItem: React.FC<{ bill: Bill; onEdit: (bill: Bill) => void; onDelete: (id: string) => void; onSetPaid: (id: string, isPaid: boolean) => void; }> = ({ bill, onEdit, onDelete, onSetPaid }) => {
  const formatCurrency = (value: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);
  const itemClasses = bill.isPaid ? 'opacity-50 line-through' : '';
  
  return (
    <li className={`flex items-center justify-between py-3 px-4 odd:bg-slate-50 odd:dark:bg-slate-800/25 even:bg-white even:dark:bg-slate-800/50 rounded-lg transition-opacity`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <input type="checkbox" checked={bill.isPaid} onChange={(e) => onSetPaid(bill.id, e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 shrink-0"/>
        <div className={`flex-1 min-w-0 ${itemClasses}`}>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{bill.name}</span>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 ">{bill.category}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`font-mono text-slate-900 dark:text-slate-100 ${itemClasses}`}>{formatCurrency(bill.amount)}</span>
        <button onClick={() => onEdit(bill)} className="text-slate-400 hover:text-indigo-500 transition-colors p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
            </svg>
        </button>
        <button onClick={() => onDelete(bill.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </li>
  );
};

interface AddBillFormProps {
    onAddBill: (bill: Omit<Bill, 'id' | 'isPaid'>) => void;
    onUpdateBill: (id: string, bill: Partial<Omit<Bill, 'id'>>) => void;
    onClose: () => void;
    billToEdit: Bill | null;
    owners: Owner[];
}

const AddBillForm: React.FC<AddBillFormProps> = ({ onAddBill, onUpdateBill, onClose, billToEdit, owners }) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<BillCategory>(BillCategory.Other);
    const [isRecurring, setIsRecurring] = useState(true);
    const [ownerId, setOwnerId] = useState<string>(owners[0]?.id || '');

    useEffect(() => {
        if (billToEdit) {
            setName(billToEdit.name);
            setAmount(String(billToEdit.amount));
            setCategory(billToEdit.category);
            setIsRecurring(billToEdit.isRecurring);
            setOwnerId(billToEdit.ownerId);
        } else {
            setName('');
            setAmount('');
            setCategory(BillCategory.Other);
            setIsRecurring(true);
            setOwnerId(owners[0]?.id || '');
        }
    }, [billToEdit, owners]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(name && amount && ownerId) {
            const billData = { name, amount: parseFloat(amount), category, isRecurring, ownerId };
            if (billToEdit) {
                onUpdateBill(billToEdit.id, billData);
            } else {
                onAddBill(billData);
            }
            onClose();
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="billName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bill Name</label>
                <Input id="billName" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Netflix" required />
            </div>
             <div>
                <label htmlFor="billAmount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount</label>
                <Input id="billAmount" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g., 15.99" required min="0.01" step="0.01" />
            </div>
            <div>
                <label htmlFor="billCategory" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select id="billCategory" value={category} onChange={e => setCategory(e.target.value as BillCategory)} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {Object.values(BillCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
             <div>
                <label htmlFor="billOwner" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assigned To</label>
                <select id="billOwner" value={ownerId} onChange={e => setOwnerId(e.target.value)} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
            </div>
             <div className="flex items-center">
                <input id="isRecurringBill" type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                <label htmlFor="isRecurringBill" className="ml-2 block text-sm text-slate-800 dark:text-slate-200">This is a recurring bill</label>
            </div>
            <div className="flex justify-end pt-2 gap-2">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit">{billToEdit ? 'Save Changes' : 'Add Bill'}</Button>
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
      <span className="font-mono text-sm text-red-500 shrink-0 ml-2">{formatCurrency(total)}</span>
    </div>
  );
};


const OutgoingsManager: React.FC<OutgoingsManagerProps> = ({ bills, owners, onAddBill, onUpdateBill, onDeleteBill, onSetBillPaid, onRenameOwner }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  const handleOpenAddModal = () => {
    setEditingBill(null);
    setIsModalOpen(true);
  }

  const handleOpenEditModal = (bill: Bill) => {
    setEditingBill(bill);
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBill(null);
  }

  return (
    <>
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Monthly Outgoings</h2>
          <Button onClick={handleOpenAddModal}>Add Bill</Button>
        </CardHeader>
        <CardContent>
          {bills.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
              {(owners || []).map(owner => {
                const ownerBills = bills.filter(b => b.ownerId === owner.id);
                const ownerTotal = ownerBills.reduce((sum, b) => sum + b.amount, 0);
                const sortedOwnerBills = [...ownerBills].sort((a, b) => (a.isPaid === b.isPaid) ? b.amount - a.amount : a.isPaid ? 1 : -1);
                
                return (
                  <div key={owner.id}>
                    <OwnerColumnHeader name={owner.name} total={ownerTotal} onRename={(newName) => onRenameOwner(owner.id, newName)} />
                    {ownerBills.length > 0 ? (
                      <ul className="space-y-2 mt-2">
                        {sortedOwnerBills.map(bill => (
                          <BillItem key={bill.id} bill={bill} onEdit={handleOpenEditModal} onDelete={onDeleteBill} onSetPaid={onSetBillPaid} />
                        ))}
                      </ul>
                    ) : (
                      <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-4">No bills assigned to {owner.name}.</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-slate-500 dark:text-slate-400 py-8">No bills added yet. Add your first one!</p>
          )}
        </CardContent>
      </Card>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingBill ? "Edit Bill" : "Add a New Bill"}>
        <AddBillForm 
            onAddBill={onAddBill}
            onUpdateBill={onUpdateBill}
            onClose={handleCloseModal}
            billToEdit={editingBill}
            owners={owners}
        />
      </Modal>
    </>
  );
};

export default OutgoingsManager;