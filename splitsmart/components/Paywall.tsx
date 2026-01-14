import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RevenueCatService } from '../services/revenueCatService';
import { Browser } from '@capacitor/browser';

interface PaywallProps {
    onClose: () => void;
    onSuccess: () => void;
}

export const Paywall: React.FC<PaywallProps> = ({ onClose, onSuccess }) => {
    const [price, setPrice] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        RevenueCatService.getPrice().then(setPrice);
    }, []);

    const handlePurchase = async () => {
        setLoading(true);
        const success = await RevenueCatService.purchasePro();
        setLoading(false);
        if (success) {
            onSuccess();
            onClose();
        }
    };

    const handleRestore = async () => {
        setLoading(true);
        const success = await RevenueCatService.restore();
        setLoading(false);
        if (success) {
            onSuccess();
            onClose();
        }
    };

    const openTermsOfUse = async () => {
        await Browser.open({ 
            url: 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/' 
        });
    };

    const openPrivacyPolicy = async () => {
        await Browser.open({ 
            url: 'https://prodigiousent.github.io/APP-Factory/docs/splitsmart/privacy-policy.html' 
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 rounded-[2.5rem] max-w-sm w-full relative overflow-hidden"
                style={{ maxHeight: '90vh', overflowY: 'auto' }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <div className="p-8 pb-6 text-center">
                    <div className="inline-block bg-white/30 backdrop-blur-sm px-4 py-1.5 rounded-full mb-4">
                        <span className="text-white text-xs font-bold tracking-wider">PREMIUM ACCESS</span>
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tight mb-3">
                        Go SplitSmart Pro
                    </h2>
                    <p className="text-white/90 text-base">
                        Unlock the full power of your AI receipt scanner.
                    </p>
                </div>

                <div className="mx-6 mb-6 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-zinc-900">SplitSmart Pro</h3>
                            <p className="text-sm text-blue-600 font-semibold">Annual Subscription</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-zinc-900">{price || '$4.99'}</p>
                            <p className="text-sm text-slate-500">per year</p>
                        </div>
                    </div>

                    <div className="space-y-2 mb-4 pb-4 border-b border-slate-200">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span>⏱</span>
                            <span>12 months of premium access</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span>💵</span>
                            <span>Just $0.42 per month</span>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-slate-700 mb-3">What's included:</p>
                        <ul className="space-y-2.5 text-sm text-slate-600">
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 font-bold">✓</span>
                                <span>Unlimited Scans - No daily limits on receipt scanning</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 font-bold">✓</span>
                                <span>2026 Annual Report - See your yearly spending breakdown</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 font-bold">✓</span>
                                <span>Priority AI Processing - Faster and more accurate results</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <p className="text-[10px] text-center text-white/60 mb-4 px-6 leading-tight">
                    Subscription automatically renews annually. Cancel anytime in App Store settings. Payment charged to Apple ID at confirmation of purchase.
                </p>

                <div className="px-6 pb-4">
                    <button
                        onClick={handlePurchase}
                        disabled={loading}
                        className="w-full bg-white text-blue-600 py-4 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-transform disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : `Subscribe Now - ${price || '$4.99'}/year`}
                    </button>
                </div>

                <div className="px-6 pb-4">
                    <button
                        onClick={handleRestore}
                        disabled={loading}
                        className="w-full text-white/80 font-semibold py-3 hover:text-white transition-colors disabled:opacity-50"
                    >
                        Restore Purchases
                    </button>
                </div>

                <div className="flex justify-center items-center gap-3 px-6 py-6 text-sm font-medium">
                    <button 
                        onClick={openTermsOfUse}
                        className="text-white/80 hover:text-white hover:underline"
                    >
                        Terms of Use
                    </button>
                    <span className="text-white/40">•</span>
                    <button 
                        onClick={openPrivacyPolicy}
                        className="text-white/80 hover:text-white hover:underline"
                    >
                        Privacy Policy
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};
