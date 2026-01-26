import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Bill, Income, Debt } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

interface InsightsResponse {
  insights: string[];
}

interface DebtAdviceResponse {
  strategyName: string;
  advice: string[];
  allocationSuggestion: string;
}

export const getFinancialInsights = async (bills: Bill[], incomes: Income[]): Promise<InsightsResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API key is not configured. Please set the API_KEY environment variable.");
  }
  
  const incomeSummary = incomes.map(i => `${i.source}: £${i.amount.toFixed(2)}`).join(', ');
  const billSummary = bills.map(b => `${b.name} (${b.category}): £${b.amount.toFixed(2)}`).join(', ');

  const prompt = `
    You are a friendly and insightful financial advisor AI.
    A user has the following monthly income sources: ${incomeSummary || 'None'}.
    And the following monthly expenses: ${billSummary || 'None'}.
    
    Based on this data, analyze their spending habits and provide 3-5 clear, actionable insights to help them improve their financial health. 
    Focus on potential savings, budget optimization, and healthy financial practices.

    Provide your response as a single, valid JSON object with one key: "insights".
    The value of "insights" must be an array of strings. Each string is one financial tip.
    Do not include any other text, explanations, or markdown formatting outside of this JSON object.

    Example response format:
    {
      "insights": [
        "Your spending on 'Entertainment' is higher than average. Consider setting a specific budget for this category.",
        "You have multiple subscriptions. Review them to see if any can be cancelled to save money.",
        "Consider allocating a portion of your remaining income towards a high-yield savings account."
      ]
    }
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.5,
      },
    });

    let jsonStr = response.text.trim();
    // Basic cleanup if the model wraps in code blocks despite mimeType (failsafe)
    if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(\w*)?/, '').replace(/```$/, '');
    }

    const parsedData: InsightsResponse = JSON.parse(jsonStr);
    
    if (parsedData.insights && Array.isArray(parsedData.insights)) {
        return parsedData;
    } else {
        throw new Error("Invalid JSON structure in AI response.");
    }

  } catch (error) {
    console.error("Error fetching financial insights from Gemini:", error);
    throw new Error("Failed to get financial insights. The AI may be temporarily unavailable.");
  }
};

export const getDebtAdvice = async (debts: Debt[], disposableIncome: number): Promise<DebtAdviceResponse> => {
    if (!process.env.API_KEY) {
      throw new Error("API key is not configured.");
    }

    const debtSummary = debts.map(d => 
        `Name: ${d.name}, Balance: £${d.totalAmount}, APR: ${d.interestRate}%, Min Payment: £${d.minimumPayment}`
    ).join('\n');

    const prompt = `
        You are a smart debt management expert. 
        A user has £${disposableIncome} remaining cashflow this month (after bills/minimums).
        
        Here is their debt portfolio:
        ${debtSummary}

        Analyze this portfolio. Determine the mathematically optimal strategy (usually Avalanche) or a psychological one (Snowball) if the balances are small.
        Suggest exactly how they should allocate their £${disposableIncome} surplus to reduce debt fastest.

        Return a JSON object with this schema:
        {
            "strategyName": "Name of strategy (e.g. Avalanche Method)",
            "advice": ["Tip 1", "Tip 2"],
            "allocationSuggestion": "A short, clear sentence on where to put the money."
        }
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.4,
            },
        });

        let jsonStr = response.text.trim();
        if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/^```(\w*)?/, '').replace(/```$/, '');
        }

        const parsedData: DebtAdviceResponse = JSON.parse(jsonStr);
        return parsedData;

    } catch (error) {
        console.error("Error fetching debt advice:", error);
        throw new Error("Failed to generate debt strategy.");
    }
}