import { LoanProduct } from '../types';

export const LOAN_PRODUCTS: LoanProduct[] = [
  {
    id: 'lp-1',
    name: 'Micro-Business Growth Loan',
    provider: 'Safaricom M-Shwari',
    amount: 50000,
    interestRate: 7.5,
    term: '12 Months',
    minScore: 650,
    description: 'Designed for small business owners with consistent mobile money inflows.'
  },
  {
    id: 'lp-2',
    name: 'Utility Resilience Credit',
    provider: 'KCB M-Pesa',
    amount: 15000,
    interestRate: 5.0,
    term: '6 Months',
    minScore: 550,
    description: 'A low-interest loan for users with a perfect utility payment history.'
  },
  {
    id: 'lp-3',
    name: 'Emergency Cash Advance',
    provider: 'Tala',
    amount: 5000,
    interestRate: 12.0,
    term: '1 Month',
    minScore: 450,
    description: 'Quick access to capital based on your recent transaction volume.'
  },
  {
    id: 'lp-4',
    name: 'Premium Expansion Fund',
    provider: 'Equity Bank',
    amount: 250000,
    interestRate: 11.5,
    term: '24 Months',
    minScore: 750,
    description: 'Large-scale capital for businesses with high-grade AltScores.'
  }
];
