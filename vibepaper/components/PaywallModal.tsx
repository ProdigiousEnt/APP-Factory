import React, { useState } from 'react';
import { Browser } from '@capacitor/browser';
import { revenueCatService } from '../services/revenueCatService';

interface PaywallModalProps {
    onClose: () => void;
    onPurchase: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ onClose, onPurchase }) => {
    const [isRestoring, setIsRestoring] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);

    const handleRestore = async () => {
        console.log('[PaywallModal] 🔘 Restore Purchases button tapped');
        setIsRestoring(true);
        try {
            console.log('[PaywallModal] 📞 Calling revenueCatService.restorePurchases()...');
            const hasActiveSubscription = await revenueCatService.restorePurchases();

            if (hasActiveSubscription) {
                console.log('[PaywallModal] ✅ Subscription restored - unlocking Pro features');
                onPurchase();
            } else {
                console.log('[PaywallModal] ⚠️ No subscription found - showing alert');
                alert('No active subscription found. If you previously purchased, please contact support.');
            }
        } catch (err) {
            console.error('[PaywallModal] ❌ Restore failed:', err);
            alert('Failed to restore purchases. Please try again.');
        } finally {
            console.log('[PaywallModal] 🏁 Restore process complete');
            setIsRestoring(false);
        }
    };

    const handlePurchase = async () => {
        setIsPurchasing(true);
        try {
            await onPurchase();
        } finally {
            setIsPurchasing(false);
        }
    };

    const openTermsOfUse = async () => {
        await Browser.open({
            url: 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/'
        });
    };

    const openPrivacyPolicy = async () => {
        await Browser.open({
            url: 'https://prodigiousent.github.io/APP-Factory/vibepaper/privacy-policy.html'
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700"
            style={{ maxHeight: '100vh', overflowY: 'auto' }}
        >
            {/* Close Button */}
            <div className="absolute top-0 right-0 pt-[calc(var(--sat)+1rem)] pr-6 z-10">
                <button
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Content Container */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 pt-20">
                {/* Premium Badge */}
                <div className="inline-block bg-white/30 backdrop-blur-sm px-4 py-1.5 rounded-full mb-4">
                    <span className="text-white text-xs font-bold tracking-wider">PREMIUM ACCESS</span>
                </div>

                {/* Title */}
                <h1 className="text-4xl font-black text-white mb-2 text-center">
                    Go VibePaper Pro
                </h1>

                {/* Tagline */}
                <p className="text-white/90 text-base text-center mb-8 max-w-sm">
                    Create stunning AI wallpapers with unlimited generations
                </p>

                {/* White Subscription Info Card */}
                <div className="mx-6 mb-6 bg-white rounded-2xl p-6 shadow-xl border border-slate-100 w-full max-w-sm">
                    {/* Title + Price Row */}
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">VibePaper Pro</h3>
                            <p className="text-sm text-blue-600 font-semibold">Annual Subscription</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-slate-900">$4.99</p>
                            <p className="text-sm text-slate-500">per year</p>
                        </div>
                    </div>

                    {/* Disclosure Icons */}
                    <div className="space-y-2 mb-4 pb-4 border-b border-slate-200">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                            <span>⏱</span>
                            <span>12 months of premium access</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                            <span>💵</span>
                            <span>Just $0.42 per month</span>
                        </div>
                    </div>

                    {/* What's Included */}
                    <div>
                        <p className="text-sm font-semibold text-slate-700 mb-3">What's included:</p>
                        <ul className="space-y-2.5">
                            <li className="flex items-start gap-2 text-sm text-slate-700">
                                <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                                <div>
                                    <span className="font-semibold">Unlimited Wallpaper Generations</span>
                                    <span className="text-slate-500"> - Create as many wallpapers as you want</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-slate-700">
                                <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                                <div>
                                    <span className="font-semibold">Priority AI Processing</span>
                                    <span className="text-slate-500"> - Faster generation times</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-slate-700">
                                <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                                <div>
                                    <span className="font-semibold">Premium Quality (2K)</span>
                                    <span className="text-slate-500"> - Ultra-high resolution wallpapers</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Auto-Renewal Disclaimer */}
                <p className="text-[10px] text-center text-white/70 mb-4 px-6 leading-tight max-w-sm">
                    Subscription automatically renews annually. Cancel anytime in App Store settings.
                    Payment charged to Apple ID at confirmation of purchase.
                </p>

                {/* Subscribe Button */}
                <button
                    onClick={handlePurchase}
                    disabled={isPurchasing}
                    className="w-full max-w-sm bg-white text-blue-600 font-bold text-lg py-4 rounded-2xl shadow-xl hover:bg-blue-50 active:scale-95 transition-all mb-3 disabled:opacity-50"
                >
                    {isPurchasing ? 'Processing...' : 'Subscribe Now'}
                </button>

                {/* Restore Button */}
                <button
                    onClick={handleRestore}
                    disabled={isRestoring}
                    className="text-white/80 text-sm font-medium underline mb-6 disabled:opacity-50"
                >
                    {isRestoring ? 'Restoring...' : 'Restore Purchases'}
                </button>

                {/* Legal Links Footer */}
                <div className="flex justify-center items-center gap-3 px-6 py-4 text-sm font-medium">
                    <button
                        onClick={openTermsOfUse}
                        className="text-white/90 hover:text-white hover:underline transition-all"
                    >
                        Terms of Use
                    </button>
                    <span className="text-white/40">•</span>
                    <button
                        onClick={openPrivacyPolicy}
                        className="text-white/90 hover:text-white hover:underline transition-all"
                    >
                        Privacy Policy
                    </button>
                </div>
            </div>
        </div>
    );
};
