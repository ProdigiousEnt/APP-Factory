import React, { useState, useEffect } from 'react';
import { testRevenueCatAPI } from './test-revenuecat';

interface TestResult {
    test: string;
    status: 'PASS' | 'FAIL' | 'WARN';
    message: string;
    data?: any;
}

export const RevenueCatTestPanel: React.FC = () => {
    const [results, setResults] = useState<TestResult[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [showDetails, setShowDetails] = useState<{ [key: number]: boolean }>({});

    const runTests = async () => {
        setIsRunning(true);
        setResults([]);

        const apiKey = (import.meta as any).env?.VITE_REVENUECAT_APPLE_KEY || '';

        if (!apiKey) {
            setResults([{
                test: 'Configuration Check',
                status: 'FAIL',
                message: 'VITE_REVENUECAT_APPLE_KEY not found in environment variables'
            }]);
            setIsRunning(false);
            return;
        }

        try {
            const testResults = await testRevenueCatAPI(apiKey);
            setResults(testResults);
        } catch (error: any) {
            setResults([{
                test: 'Test Execution',
                status: 'FAIL',
                message: `Test execution failed: ${error.message || error}`
            }]);
        } finally {
            setIsRunning(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PASS': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'FAIL': return 'bg-red-50 text-red-700 border-red-200';
            case 'WARN': return 'bg-amber-50 text-amber-700 border-amber-200';
            default: return 'bg-zinc-50 text-zinc-700 border-zinc-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PASS': return '✅';
            case 'FAIL': return '❌';
            case 'WARN': return '⚠️';
            default: return '•';
        }
    };

    const summary = {
        total: results.length,
        passed: results.filter(r => r.status === 'PASS').length,
        failed: results.filter(r => r.status === 'FAIL').length,
        warned: results.filter(r => r.status === 'WARN').length
    };

    return (
        <div className="fixed inset-0 bg-zinc-900/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                    <h2 className="text-2xl font-black tracking-tight">RevenueCat API Test</h2>
                    <p className="text-indigo-100 text-sm mt-1">Comprehensive integration testing</p>
                </div>

                {/* Summary Stats */}
                {results.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 p-4 bg-zinc-50 border-b border-zinc-200">
                        <div className="text-center">
                            <div className="text-2xl font-black text-zinc-900">{summary.total}</div>
                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-black text-emerald-600">{summary.passed}</div>
                            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Passed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-black text-red-600">{summary.failed}</div>
                            <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Failed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-black text-amber-600">{summary.warned}</div>
                            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Warnings</div>
                        </div>
                    </div>
                )}

                {/* Results */}
                <div className="flex-1 overflow-y-auto p-6">
                    {results.length === 0 && !isRunning && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🧪</div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-2">Ready to Test</h3>
                            <p className="text-zinc-500 text-sm">Click the button below to run all RevenueCat API tests</p>
                        </div>
                    )}

                    {isRunning && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-zinc-600 font-semibold">Running tests...</p>
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="space-y-3">
                            {results.map((result, index) => (
                                <div
                                    key={index}
                                    className={`border rounded-2xl overflow-hidden transition-all ${getStatusColor(result.status)}`}
                                >
                                    <div
                                        className="p-4 cursor-pointer"
                                        onClick={() => setShowDetails(prev => ({ ...prev, [index]: !prev[index] }))}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-xl">{getStatusIcon(result.status)}</span>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-sm">{result.test}</h4>
                                                <p className="text-xs mt-1 opacity-80">{result.message}</p>
                                            </div>
                                            {result.data && (
                                                <button className="text-xs font-bold opacity-60 hover:opacity-100">
                                                    {showDetails[index] ? '▼' : '▶'}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {showDetails[index] && result.data && (
                                        <div className="px-4 pb-4">
                                            <div className="bg-white/50 rounded-xl p-3 mt-2">
                                                <pre className="text-[10px] font-mono overflow-x-auto">
                                                    {JSON.stringify(result.data, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex gap-3">
                    <button
                        onClick={runTests}
                        disabled={isRunning}
                        className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
                    >
                        {isRunning ? 'Testing...' : results.length > 0 ? 'Run Again' : 'Run Tests'}
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-zinc-200 text-zinc-700 rounded-xl font-bold hover:bg-zinc-300 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
