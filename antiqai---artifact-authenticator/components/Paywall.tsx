import React from 'react';
import { motion } from 'framer-motion';
import { Browser } from '@capacitor/browser';
import { revenueCatService } from '../services/revenueCatService';

interface PaywallProps {
    onClose: () => void;
}

export const Paywall: React.FC<PaywallProps> = ({ onClose }) => {
    const [loading, setLoading] = React.useState(false);

    const openLink = async (url: string) => {
        await Browser.open({ url });
    };

    const handlePurchase = async () => {
        setLoading(true);
        try {
            await revenueCatService.purchasePackage('$rc_monthly');
            onClose();
        } catch (error: any) {
            if (!error.userCancelled) {
                alert('Purchase failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async () => {
        setLoading(true);
        try {
            await revenueCatService.restorePurchases();
            alert('Purchases restored successfully!');
            onClose();
        } catch (error) {
            alert('No purchases to restore.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm p-4"
            onClick={onClose}
            style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
                style={{ maxHeight: '90vh', overflowY: 'auto' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header with Gradient */}
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 px-8 pt-12 pb-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Unlock Pro Features</h2>
                    <p className="text-white/90 text-sm">Get unlimited expert identifications</p>
                </div>

                {/* Subscription Info Card */}
                <div className="px-8 py-6">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">AntiqueAI Pro</h3>
                                <p className="text-sm text-gray-600">Monthly Subscription</p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-amber-600">$4.99</div>
                                <div className="text-xs text-gray-500">per month</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                            <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span>Renews monthly</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                            </svg>
                            <span>Cancel anytime</span>
                        </div>
                    </div>

                    {/* Benefits List */}
                    <div className="space-y-3 mb-6">
                        <h4 className="font-bold text-gray-900 mb-3">What's Included:</h4>
                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">1,000 Expert Identifications/Month</p>
                                <p className="text-sm text-gray-600">Perfect for serious collectors and dealers</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Unlimited Scan History</p>
                                <p className="text-sm text-gray-600">Access all your past identifications anytime</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Save Favorites</p>
                                <p className="text-sm text-gray-600">Bookmark important items for quick reference</p>
                            </div>
                        </div>
                    </div>

                    {/* Auto-Renewal Disclaimer */}
                    <p className="text-xs text-gray-600 text-center mb-6 leading-relaxed">
                        Subscription automatically renews monthly unless cancelled at least 24 hours before the end of the current period. Manage in Settings.
                    </p>

                    {/* Subscribe Button */}
                    <button
                        onClick={handlePurchase}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl shadow-lg hover:from-amber-600 hover:to-orange-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                    >
                        {loading ? 'Processing...' : 'Start Pro Subscription'}
                    </button>

                    {/* Restore Button */}
                    <button
                        onClick={handleRestore}
                        disabled={loading}
                        className="w-full py-3 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors disabled:opacity-50"
                    >
                        Restore Purchases
                    </button>

                    {/* Legal Links */}
                    <div className="flex items-center justify-center gap-4 mt-6 text-xs pb-2">
                        <button
                            onClick={() => openLink('https://prodigiousent.github.io/APP-Factory/antiqueai-privacy-policy.html')}
                            className="text-amber-600 hover:text-amber-700 underline"
                        >
                            Privacy Policy
                        </button>
                        <span className="text-gray-400">•</span>
                        <button
                            onClick={() => openLink('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}
                            className="text-amber-600 hover:text-amber-700 underline"
                        >
                            Terms of Use
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
