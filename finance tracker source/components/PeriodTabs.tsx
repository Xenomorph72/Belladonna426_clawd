import React, { useState, useRef, useEffect } from 'react';
import { FinancialPeriod } from '../types';
import Button from './common/Button';

interface PeriodTabsProps {
  periods: FinancialPeriod[];
  activePeriodId: string | null;
  onSelectPeriod: (id: string) => void;
  onAddPeriod: () => void;
  onDeletePeriod: (id: string) => void;
  onRenamePeriod: (id: string, newName: string) => void;
}

const PeriodTab: React.FC<{
    period: FinancialPeriod;
    isActive: boolean;
    onSelect: () => void;
    onDelete: () => void;
    onRename: (newName: string) => void;
}> = ({ period, isActive, onSelect, onDelete, onRename }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(period.name);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);
    
    useEffect(() => {
        setName(period.name);
    }, [period.name]);

    const handleDoubleClick = () => {
        setIsEditing(true);
    };

    const handleRename = () => {
        if (name.trim() && name.trim() !== period.name) {
            onRename(name.trim());
        } else {
            setName(period.name);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleRename();
        } else if (e.key === 'Escape') {
            setName(period.name);
            setIsEditing(false);
        }
    };
    
    const activeClasses = 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-slate-700/50';
    const inactiveClasses = 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600';

    return (
        <div className="relative group">
            {isEditing ? (
                 <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={handleRename}
                    onKeyDown={handleKeyDown}
                    className="px-3 py-2 text-sm font-medium outline-none ring-2 ring-indigo-500 rounded-md bg-white dark:bg-slate-900"
                />
            ) : (
                <button
                    onDoubleClick={handleDoubleClick}
                    onClick={onSelect}
                    className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap ${isActive ? activeClasses : inactiveClasses}`}
                >
                    {period.name}
                </button>
            )}
             <button
                onClick={onDelete}
                className="absolute top-0 right-0 p-1 text-slate-400 hover:text-red-500 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 -mt-1 -mr-1 bg-slate-100 dark:bg-slate-800"
                aria-label={`Delete ${period.name}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    )
}

const PeriodTabs: React.FC<PeriodTabsProps> = ({ periods, activePeriodId, onSelectPeriod, onAddPeriod, onDeletePeriod, onRenamePeriod }) => {
  return (
    <div>
      <div className="flex items-center border-b border-slate-300 dark:border-slate-700">
        <div className="flex-grow flex items-center gap-1 overflow-x-auto">
          {periods.map(period => (
            <PeriodTab
                key={period.id}
                period={period}
                isActive={period.id === activePeriodId}
                onSelect={() => onSelectPeriod(period.id)}
                onDelete={() => onDeletePeriod(period.id)}
                onRename={(newName) => onRenamePeriod(period.id, newName)}
            />
          ))}
        </div>
        <div className="p-1 pl-2">
          <Button onClick={onAddPeriod} variant="secondary" className="!px-3 h-9">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            <span className="ml-2 hidden sm:inline">New Period</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PeriodTabs;