
import { GoogleGenAI } from "@google/genai";
import { FinancialData } from "../types";

export async function getFinancialAdvice(data: FinancialData, prompt: string) {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const simplifiedData = {
        income: data.income.map(i => ({ description: i.description, amount: i.amount })),
        fixedExpenses: data.fixedExpenses.map(e => ({ description: e.description, amount: e.amount })),
        creditCardPurchases: data.cards.flatMap(c => c.purchases.map(p => ({
            card: c.name,
            item: p.item,
            store: p.store,
            totalInstallments: p.totalInstallments,
            installmentValue: p.installments[0]?.amount || 0,
        }))),
    };

    const fullPrompt = `
        Você é um assistente financeiro prestativo e amigável. Analise os seguintes dados financeiros e responda à pergunta do usuário. Forneça conselhos concisos e práticos. Não forneça conselhos de investimento profissional.

        Dados Financeiros:
        ${JSON.stringify(simplifiedData, null, 2)}

        Pergunta do usuário:
        "${prompt}"

        Sua resposta (em português):
    `;

    try {
        const response = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
        });
        return response;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get response from AI assistant.");
    }
}
