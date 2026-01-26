import React, { useState, useMemo, useEffect } from 'react';
import { Bill, BillCategory, Income, Owner } from '../types';
import Card, { CardContent } from './common/Card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Input from './common/Input';

interface SummaryProps {
  totalIncome: number;
  totalOutgoings: number;
  totalPaidOutgoings: number;
  remaining: number;
  totalSavings: number;
  bills: Bill[];
  incomes: Income[];
  owners: Owner[];
  liveBalance?: number;
  onUpdateLiveBalance: (amount: number) => void;
}

const COLORS = ['#4f46e5', '#ec4899', '#22c55e', '#f97316', '#3b82f6', '#eab308', '#8b5cf6', '#ef4444', '#14b8a6', '#64748b'];

const Summary: React.FC<SummaryProps> = ({ totalIncome, totalOutgoings, totalPaidOutgoings, remaining, totalSavings, bills, incomes, owners, liveBalance, onUpdateLiveBalance }) => {
  const [currentBalanceInput, setCurrentBalanceInput] = useState<string>(liveBalance ? String(liveBalance) : '');

  useEffect(() => {
    setCurrentBalanceInput(liveBalance ? String(liveBalance) : '');
  }, [liveBalance]);

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentBalanceInput(e.target.value);
  };

  const handleBalanceBlur = () => {
    onUpdateLiveBalance(parseFloat(currentBalanceInput) || 0);
  };
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);

  const chartData = useMemo(() => {
    const categoryTotals = bills.reduce((acc, bill) => {
      acc[bill.category] = (acc[bill.category] || 0) + bill.amount;
      return acc;
    }, {} as Record<BillCategory, number>);

    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  }, [bills]);
  
  const cashFlow = totalIncome - totalPaidOutgoings;
  const variance = (liveBalance || 0) - cashFlow;

  return (
    <Card>
        <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Income</h3>
                    <p className="text-2xl font-bold text-green-500">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Forecast Outgoings</h3>
                    <p className="text-2xl font-bold text-red-500">{formatCurrency(totalOutgoings)}</p>
                </div>
                <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Forecast Remainder</h3>
                    <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-blue-500' : 'text-amber-500'}`}>
                        {formatCurrency(remaining)}
                    </p>
                </div>
                <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Savings</h3>
                    <p className="text-2xl font-bold text-indigo-500">{formatCurrency(totalSavings)}</p>
                </div>
            </div>

            <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 text-center mb-4">Individual Balances</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(owners || []).map(owner => {
                        const ownerIncomes = incomes.filter(i => i.ownerId === owner.id).reduce((sum, i) => sum + i.amount, 0);
                        const ownerOutgoings = bills.filter(b => b.ownerId === owner.id).reduce((sum, b) => sum + b.amount, 0);
                        const ownerRemainder = ownerIncomes - ownerOutgoings;
                        return (
                            <div key={owner.id} className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
                                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3 text-center truncate">{owner.name}</h4>
                                <div className="flex justify-around text-center">
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Income</p>
                                        <p className="font-semibold text-green-500">{formatCurrency(ownerIncomes)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Outgoings</p>
                                        <p className="font-semibold text-red-500">{formatCurrency(ownerOutgoings)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Remainder</p>
                                        <p className={`font-semibold ${ownerRemainder >= 0 ? 'text-blue-500' : 'text-amber-500'}`}>{formatCurrency(ownerRemainder)}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            
            <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 text-center mb-4">Live Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
                      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Paid Outgoings</h4>
                      <p className="text-xl font-bold text-orange-500">{formatCurrency(totalPaidOutgoings)}</p>
                  </div>
                   <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
                      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Cash Flow</h4>
                      <p className="text-xl font-bold text-cyan-500">{formatCurrency(cashFlow)}</p>
                  </div>
                  <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
                      <label htmlFor="liveBalance" className="text-sm font-medium text-slate-500 dark:text-slate-400 block">Live Bank Balance</label>
                      <Input
                        id="liveBalance"
                        type="number"
                        placeholder="0.00"
                        className="text-center font-bold text-xl !bg-transparent border-0 !ring-0 p-0 h-auto"
                        value={currentBalanceInput}
                        onChange={handleBalanceChange}
                        onBlur={handleBalanceBlur}
                      />
                       <p className={`text-xs mt-1 font-medium ${variance === 0 ? 'text-slate-500' : variance > 0 ? 'text-green-500' : 'text-red-500'}`}>
                         Variance: {formatCurrency(variance)}
                       </p>
                  </div>
              </div>
            </div>

            {chartData.length > 0 && (
                <div className="mt-6 h-64 md:h-80">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 text-center mb-2">Outgoing Categories</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius="80%" fill="#8884d8" dataKey="value" nameKey="name" stroke="none">
                                {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                            </Pie>
                            <Tooltip contentStyle={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid #334155', borderRadius: '0.5rem', color: '#f1f5f9' }} formatter={(value: number) => formatCurrency(value)} />
                            <Legend iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </CardContent>
    </Card>
  );
};

export default Summary;