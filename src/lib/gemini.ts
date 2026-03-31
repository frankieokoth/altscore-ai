import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, SMSRecord, CreditAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const analyzeCreditworthiness = async (
  transactions: Transaction[],
  smsRecords: SMSRecord[]
): Promise<CreditAnalysis> => {
  const summaryData = {
    totalInflow: transactions.filter(t => t.type === 'inflow').reduce((acc, t) => acc + t.amount, 0),
    totalOutflow: transactions.filter(t => t.type === 'outflow').reduce((acc, t) => acc + t.amount, 0),
    utilityConsistency: transactions.filter(t => t.category === 'utility').length,
    businessSmsCount: smsRecords.filter(s => s.isBusiness).length,
    transactionCount: transactions.length,
  };

  const prompt = `
    Analyze the following financial pattern summary for an alternative credit score.
    The user has no traditional bank history but uses mobile money (M-Pesa) and pays utilities.
    
    Data Summary:
    - Total Inflow (6 months): ${summaryData.totalInflow}
    - Total Outflow (6 months): ${summaryData.totalOutflow}
    - Utility Payments Count: ${summaryData.utilityConsistency}
    - Business-related SMS records: ${summaryData.businessSmsCount}
    - Total Transactions: ${summaryData.transactionCount}

    Provide a credit analysis including a score (300-850), a grade (A-F), risk factors, and recommendations.
    Be realistic but look for positive alternative signals like consistency in utility payments and business activity.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          grade: { type: Type.STRING },
          summary: { type: Type.STRING },
          riskFactors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                factor: { type: Type.STRING },
                impact: { type: Type.STRING, enum: ['positive', 'negative', 'neutral'] },
                description: { type: Type.STRING }
              },
              required: ['factor', 'impact', 'description']
            }
          },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          metrics: {
            type: Type.OBJECT,
            properties: {
              monthlyInflow: { type: Type.NUMBER },
              monthlyOutflow: { type: Type.NUMBER },
              consistencyScore: { type: Type.NUMBER },
              savingsRate: { type: Type.NUMBER }
            },
            required: ['monthlyInflow', 'monthlyOutflow', 'consistencyScore', 'savingsRate']
          }
        },
        required: ['score', 'grade', 'summary', 'riskFactors', 'recommendations', 'metrics']
      }
    }
  });

  return JSON.parse(response.text);
};
