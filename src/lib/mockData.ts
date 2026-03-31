import { Transaction, SMSRecord } from '../types';
import { subDays, format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export const generateMockData = () => {
  const transactions: Transaction[] = [];
  const smsRecords: SMSRecord[] = [];
  const now = new Date();
  
  // Generate 6 months of data
  for (let i = 0; i < 180; i++) {
    const date = subDays(now, i);
    const dateStr = format(date, 'yyyy-MM-dd');

    // M-Pesa Inflows (Simulated business income)
    if (Math.random() > 0.7) {
      transactions.push({
        id: `tx-in-${i}`,
        date: dateStr,
        amount: Math.floor(Math.random() * 5000) + 1000,
        type: 'inflow',
        category: 'business',
        description: 'Payment received from Customer',
        provider: 'M-Pesa'
      });
    }

    // Regular Utility Payments
    if (date.getDate() === 5) {
      transactions.push({
        id: `tx-util-${i}`,
        date: dateStr,
        amount: 2500,
        type: 'outflow',
        category: 'utility',
        description: 'KPLC Electricity Bill',
        provider: 'Utility'
      });
    }

    // Airtime
    if (Math.random() > 0.8) {
      transactions.push({
        id: `tx-air-${i}`,
        date: dateStr,
        amount: Math.floor(Math.random() * 500) + 50,
        type: 'outflow',
        category: 'airtime',
        description: 'Safaricom Airtime Purchase',
        provider: 'M-Pesa'
      });
    }

    // Personal Expenses
    if (Math.random() > 0.5) {
      transactions.push({
        id: `tx-pers-${i}`,
        date: dateStr,
        amount: Math.floor(Math.random() * 2000) + 200,
        type: 'outflow',
        category: 'personal',
        description: 'Supermarket Purchase',
        provider: 'M-Pesa'
      });
    }

    // SMS Records
    if (Math.random() > 0.8) {
      smsRecords.push({
        id: `sms-${i}`,
        date: dateStr,
        sender: 'MPESA',
        content: `Confirmed. You have received Ksh${Math.floor(Math.random() * 5000)} from 0712345678.`,
        isBusiness: true
      });
    }
  }

  return { transactions, smsRecords };
};
