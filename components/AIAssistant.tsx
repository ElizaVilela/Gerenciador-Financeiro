import React, { useState, useRef, useEffect } from 'react';
import { FinancialData } from '../types';
import { getFinancialAdvice } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';

declare global {
    interface Window {
        marked: {
            parse(markdown: string): string;
        };
    }
}

interface AIAssistantProps {
    financialData: FinancialData;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ financialData }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState('');
    const [error, setError] = useState('');
    const chatBoxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [response, isLoading]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsLoading(true);
        setResponse('');
        setError('');

        try {
            const stream = await getFinancialAdvice(financialData, prompt);
            setPrompt('');
            let fullResponse = '';
            for await (const chunk of stream) {
                const chunkText = (chunk as GenerateContentResponse).text;
                fullResponse += chunkText;
                setResponse(fullResponse);
            }

        } catch (err) {
            setError('Desculpe, não foi possível obter uma resposta do assistente. Verifique sua chave de API e tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-110"
                aria-label="Assistente IA"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </button>
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-full max-w-md bg-white rounded-lg shadow-2xl flex flex-col h-[60vh] z-40">
                    <header className="p-4 bg-blue-600 text-white rounded-t-lg flex justify-between items-center">
                        <h3 className="font-semibold">Assistente Financeiro IA</h3>
                        <button onClick={() => setIsOpen(false)} className="text-blue-200 hover:text-white">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </header>
                    <div ref={chatBoxRef} className="flex-1 p-4 overflow-y-auto bg-gray-50">
                        <div className="space-y-4">
                            <div className="flex justify-start">
                                <div className="text-gray-800 bg-white shadow-sm p-3 rounded-lg max-w-xs border border-gray-200">
                                    Olá! Como posso ajudar com suas finanças hoje?
                                </div>
                            </div>
                            {response && (
                                <div className="flex justify-start">
                                    <div 
                                        className="text-gray-800 bg-white shadow-sm p-3 rounded-lg prose prose-sm max-w-full border border-gray-200" 
                                        dangerouslySetInnerHTML={{ __html: window.marked.parse(response) }}>
                                    </div>
                                </div>
                            )}
                            {isLoading && !response && <div className="text-sm text-gray-500">Analisando seus dados...</div>}
                            {error && <div className="text-red-500 text-sm">{error}</div>}
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="p-4 border-t bg-white rounded-b-lg">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Pergunte algo..."
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                disabled={isLoading}
                            />
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300" disabled={isLoading}>
                                Enviar
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default AIAssistant;