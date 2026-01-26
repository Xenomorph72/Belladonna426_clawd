import React, { useState, useCallback } from 'react';
import { Bill, Income } from '../types';
import { getFinancialInsights } from '../services/geminiService';
import Card, { CardHeader, CardContent } from './common/Card';
import Button from './common/Button';

interface GeminiInsightsProps {
    bills: Bill[];
    incomes: Income[];
}

const GeminiInsights: React.FC<GeminiInsightsProps> = ({ bills, incomes }) => {
    const [insights, setInsights] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFetchInsights = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setInsights([]);
        try {
            const response = await getFinancialInsights(bills, incomes);
            setInsights(response.insights);
        } catch (e: any) {
            setError(e.message || "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [bills, incomes]);

    const isApiKeySet = !!process.env.API_KEY;

    return (
        <Card>
            <CardHeader className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">AI Financial Insights</h2>
                </div>
                <Button onClick={handleFetchInsights} disabled={isLoading || !isApiKeySet}>
                    {isLoading ? 'Analyzing...' : 'Get Insights'}
                </Button>
            </CardHeader>
            <CardContent>
                {!isApiKeySet && (
                     <div className="text-center py-4">
                        <p className="text-amber-600 dark:text-amber-400 font-semibold">Gemini API key not configured.</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please set the API_KEY environment variable to enable this feature.</p>
                    </div>
                )}
                {isLoading && (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                        <p className="ml-3 text-slate-500 dark:text-slate-400">Thinking...</p>
                    </div>
                )}
                {error && <p className="text-red-500 text-center">{error}</p>}
                {!isLoading && !error && insights.length > 0 && (
                    <ul className="space-y-3">
                        {insights.map((insight, index) => (
                           <li key={index} className="flex items-start gap-3 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                               <span className="text-indigo-400 mt-1">&#10022;</span>
                               <p className="text-slate-700 dark:text-slate-300">{insight}</p>
                           </li>
                        ))}
                    </ul>
                )}
                 {!isLoading && !error && insights.length === 0 && isApiKeySet &&(
                     <p className="text-center text-slate-500 dark:text-slate-400 py-8">Click "Get Insights" to receive personalized financial advice from Gemini.</p>
                )}
            </CardContent>
        </Card>
    );
};

export default GeminiInsights;
