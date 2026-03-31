import { Transaction, SMSRecord } from '../types';

export const parseMpesaText = (text: string): { transactions: Transaction[], smsRecords: SMSRecord[] } => {
  const transactions: Transaction[] = [];
  const smsRecords: SMSRecord[] = [];
  const lines = text.split('\n');
  const now = new Date().toISOString().split('T')[0];

  lines.forEach((line, index) => {
    const cleanLine = line.trim();
    if (!cleanLine) return;

    // Detect M-Pesa SMS patterns
    const isMpesa = cleanLine.includes('Confirmed.') || cleanLine.includes('Ksh') || cleanLine.includes('M-PESA');
    
    if (isMpesa) {
      smsRecords.push({
        id: `sms-parsed-${index}`,
        date: now,
        sender: 'MPESA',
        content: cleanLine,
        isBusiness: cleanLine.toLowerCase().includes('received') && cleanLine.toLowerCase().includes('from')
      });

      // Extract amount
      const amountMatch = cleanLine.match(/Ksh([\d,]+\.?\d*)/);
      if (amountMatch) {
        const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
        
        // Determine Type
        let type: 'inflow' | 'outflow' = 'outflow';
        if (cleanLine.toLowerCase().includes('received')) {
          type = 'inflow';
        }

        // Determine Category
        let category: Transaction['category'] = 'other';
        const lowerLine = cleanLine.toLowerCase();
        if (lowerLine.includes('kplc') || lowerLine.includes('token') || lowerLine.includes('zuku') || lowerLine.includes('water')) {
          category = 'utility';
        } else if (type === 'inflow') {
          category = 'business';
        } else if (lowerLine.includes('airtime')) {
          category = 'utility';
        }

        transactions.push({
          id: `tx-parsed-${index}`,
          date: now,
          amount,
          type,
          category,
          description: cleanLine.substring(0, 40) + '...',
          provider: 'M-Pesa'
        });
      }
    }
  });

  return { transactions, smsRecords };
};
