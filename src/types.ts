export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'inflow' | 'outflow';
  category: 'business' | 'personal' | 'utility' | 'airtime' | 'transfer' | 'other';
  description: string;
  provider: 'M-Pesa' | 'Bank' | 'Utility';
}

export interface SMSRecord {
  id: string;
  date: string;
  sender: string;
  content: string;
  isBusiness: boolean;
}

export interface LoanProduct {
  id: string;
  name: string;
  provider: string;
  amount: number;
  interestRate: number;
  term: string;
  minScore: number;
  description: string;
}

export interface CreditAnalysis {
  score: number; // 300-850
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  summary: string;
  riskFactors: {
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }[];
  recommendations: string[];
  metrics: {
    monthlyInflow: number;
    monthlyOutflow: number;
    consistencyScore: number; // 0-100
    savingsRate: number; // percentage
  };
}
