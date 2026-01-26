export enum BillCategory {
  Housing = 'Housing',
  Utilities = 'Utilities',
  Food = 'Food',
  Transport = 'Transport',
  Health = 'Health',
  Entertainment = 'Entertainment',
  Debt = 'Debt Repayment',
  Personal = 'Personal Care',
  Subscriptions = 'Subscriptions',
  Other = 'Other',
}

export interface Owner {
  id: string;
  name: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  category: BillCategory;
  isRecurring: boolean;
  isPaid: boolean;
  ownerId: string;
}

export interface Income {
  id:string;
  source: string;
  amount: number;
  isRecurring: boolean;
  ownerId: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
}

export interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  interestRate: number;
  minimumPayment: number;
}

export interface FinancialPeriod {
  id: string;
  name: string;
  owners: Owner[];
  incomes: Income[];
  bills: Bill[];
  liveBalance?: number;
}