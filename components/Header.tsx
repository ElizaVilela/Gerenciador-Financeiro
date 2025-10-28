import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4v1m-4 0a2 2 0 100 4 2 2 0 000-4zm0 0V5" />
                                <path d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Gerenciador Financeiro</h1>
                            <p className="text-sm text-gray-500">Sua vida financeira sob controle.</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;