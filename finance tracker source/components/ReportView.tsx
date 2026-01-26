import React, { useMemo } from 'react';
import { FinancialPeriod, BillCategory } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ReportViewProps {
  period: FinancialPeriod;
  totalSavings: number;
}

const COLORS = ['#4f46e5', '#ec4899', '#22c55e', '#f97316', '#3b82f6', '#eab308', '#8b5cf6', '#ef4444', '#14b8a6', '#64748b'];

const ReportView: React.FC<ReportViewProps> = ({ period, totalSavings }) => {
  const formatCurrency = (value: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);

  const totals = useMemo(() => {
    const totalIncome = period.incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalOutgoings = period.bills.reduce((sum, item) => sum + item.amount, 0);
    const remaining = totalIncome - totalOutgoings;
    return { totalIncome, totalOutgoings, remaining };
  }, [period]);

  const chartData = useMemo(() => {
    const categoryTotals = period.bills.reduce((acc, bill) => {
      acc[bill.category] = (acc[bill.category] || 0) + bill.amount;
      return acc;
    }, {} as Record<BillCategory, number>);
    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  }, [period.bills]);

  return (
    <div className="report-view bg-white text-slate-900 p-8 font-sans" style={{ width: '800px' }}>
      <header className="border-b-2 border-slate-700 pb-4 mb-8 text-center">
        <h1 className="text-4xl font-bold text-slate-800">Financial Report</h1>
        <p className="text-xl text-slate-600 mt-2">{period.name}</p>
        <p className="text-sm text-slate-500 mt-1">Generated on: {new Date().toLocaleDateString()}</p>
      </header>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-slate-700 border-b border-slate-300 pb-2 mb-4">Overall Summary</h2>
        <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-slate-100 rounded-lg">
                <h3 className="text-sm font-medium text-slate-600">Total Income</h3>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.totalIncome)}</p>
            </div>
            <div className="p-4 bg-slate-100 rounded-lg">
                <h3 className="text-sm font-medium text-slate-600">Total Outgoings</h3>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.totalOutgoings)}</p>
            </div>
            <div className="p-4 bg-slate-100 rounded-lg">
                <h3 className="text-sm font-medium text-slate-600">Net Remainder</h3>
                <p className={`text-2xl font-bold ${totals.remaining >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>{formatCurrency(totals.remaining)}</p>
            </div>
            <div className="p-4 bg-slate-100 rounded-lg">
                <h3 className="text-sm font-medium text-slate-600">Total Savings</h3>
                <p className="text-2xl font-bold text-indigo-600">{formatCurrency(totalSavings)}</p>
            </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-slate-700 border-b border-slate-300 pb-2 mb-4">Individual Balances</h2>
        <div className={`grid grid-cols-${period.owners.length > 1 ? '2' : '1'} gap-6`}>
            {period.owners.map(owner => {
                const ownerIncomes = period.incomes.filter(i => i.ownerId === owner.id).reduce((sum, i) => sum + i.amount, 0);
                const ownerOutgoings = period.bills.filter(b => b.ownerId === owner.id).reduce((sum, b) => sum + b.amount, 0);
                const ownerRemainder = ownerIncomes - ownerOutgoings;
                return (
                    <div key={owner.id} className="p-4 bg-slate-100 rounded-lg">
                        <h3 className="font-bold text-slate-800 mb-3 text-center text-lg">{owner.name}</h3>
                        <div className="flex justify-around text-center">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider">Income</p>
                                <p className="font-semibold text-green-600 text-lg">{formatCurrency(ownerIncomes)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider">Outgoings</p>
                                <p className="font-semibold text-red-600 text-lg">{formatCurrency(ownerOutgoings)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider">Remainder</p>
                                <p className={`font-semibold text-lg ${ownerRemainder >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>{formatCurrency(ownerRemainder)}</p>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-8 mb-8">
        {period.owners.map(owner => {
          const ownerIncomes = period.incomes.filter(i => i.ownerId === owner.id);
          const ownerBills = period.bills.filter(b => b.ownerId === owner.id);
          return (
            <div key={owner.id}>
              <h3 className="text-xl font-bold text-slate-700 border-b border-slate-300 pb-2 mb-4">{owner.name}'s Details</h3>
              <div className="mb-6">
                <h4 className="font-semibold text-lg text-slate-600 mb-2">Income Sources</h4>
                <table className="w-full text-left text-sm">
                  <thead><tr className="border-b"><th className="py-2 pr-2">Source</th><th className="py-2 text-right">Amount</th></tr></thead>
                  <tbody>{ownerIncomes.map(i => <tr key={i.id} className="border-b border-slate-200"><td className="py-2 pr-2">{i.source}</td><td className="py-2 text-right font-mono">{formatCurrency(i.amount)}</td></tr>)}</tbody>
                </table>
              </div>
              <div>
                <h4 className="font-semibold text-lg text-slate-600 mb-2">Outgoings</h4>
                <table className="w-full text-left text-sm">
                  <thead><tr className="border-b"><th className="py-2 pr-2">Bill</th><th className="py-2 pr-2">Category</th><th className="py-2 text-right">Amount</th></tr></thead>
                  <tbody>{ownerBills.map(b => <tr key={b.id} className="border-b border-slate-200"><td className="py-2 pr-2">{b.name}</td><td className="py-2 pr-2">{b.category}</td><td className="py-2 text-right font-mono">{formatCurrency(b.amount)}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          )
        })}
      </section>
      
      {chartData.length > 0 && (
        <section>
            <h2 className="text-2xl font-bold text-slate-700 border-b border-slate-300 pb-2 mb-4">Outgoing Categories</h2>
            <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={120} fill="#8884d8" dataKey="value" nameKey="name" stroke="none" isAnimationActive={false}>
                            {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#1e293b' }} formatter={(value: number) => formatCurrency(value)} />
                        <Legend iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </section>
      )}
    </div>
  );
};

export default ReportView;