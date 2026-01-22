import React, { useState, useEffect } from 'react';
import { revenueCatService } from '../services/revenueCatService';

interface PaywallProps {
    onClose: () => void;
    onPurchaseSuccess: () => void;
}

const Paywall: React.FC<PaywallProps> = ({ onClose, onPurchaseSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [restoring, setRestoring] = useState(false);

    const handlePurchase = async () => {
        setLoading(true);
        try {
            await revenueCatService.purchaseSubscription();
            onPurchaseSuccess();
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
        setRestoring(true);
        try {
            await revenueCatService.restorePurchases();
            const isPro = await revenueCatService.checkSubscriptionStatus();
            if (isPro) {
                alert('Purchases restored successfully!');
                onPurchaseSuccess();
                onClose();
            } else {
                alert('No previous purchases found.');
            }
        } catch (error) {
            alert('Failed to restore purchases. Please try again.');
        } finally {
            setRestoring(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            {/* Semi-transparent dark overlay (CityScope Standard) */}
            <div
                className="absolute inset-0 bg-black/75"
                onClick={onClose}
            />

            {/* Centered blue gradient card with glassmorphism */}
            <div className="relative w-full max-w-md bg-gradient-to-br from-blue-500/90 to-blue-700/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 animate-in slide-in-from-bottom duration-500">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    aria-label="Close"
                >
                    <span className="text-white text-xl font-light">×</span>
                </button>

                {/* Content */}
                <div className="text-center text-white">
                    {/* Icon */}
                    <div className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-bold mb-2">ResumeTailor Pro</h2>
                    <p className="text-blue-100 mb-8">Unlock unlimited resume optimization</p>

                    {/* Pricing */}
                    <div className="mb-8">
                        <div className="text-5xl font-bold mb-2">$4.99</div>
                        <div className="text-blue-100 text-lg">per month</div>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-4 mb-8 text-left">
                        <div className="flex items-start gap-3">
                            <span className="text-green-300 mt-1">✓</span>
                            <span className="text-white/90">1,000 resume analyses per month</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-green-300 mt-1">✓</span>
                            <span className="text-white/90">AI-powered job matching scores</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-green-300 mt-1">✓</span>
                            <span className="text-white/90">Tailored resume suggestions</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-green-300 mt-1">✓</span>
                            <span className="text-white/90">Actionable improvement tips</span>
                        </div>
                    </div>

                    {/* Subscribe button */}
                    <button
                        onClick={handlePurchase}
                        disabled={loading}
                        className="w-full py-4 bg-white text-blue-600 rounded-full font-bold text-lg shadow-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                    >
                        {loading ? 'Processing...' : 'Subscribe Now'}
                    </button>

                    {/* Restore button */}
                    <button
                        onClick={handleRestore}
                        disabled={restoring}
                        className="w-full py-3 text-white/80 hover:text-white text-sm transition-colors disabled:opacity-50"
                    >
                        {restoring ? 'Restoring...' : 'Restore Purchases'}
                    </button>

                    {/* Auto-renewal disclaimer */}
                    <p className="text-xs text-white/60 mt-6 leading-relaxed">
                        Subscription automatically renews monthly unless cancelled at least 24 hours before the end of the current period. Manage subscriptions in your App Store account settings.
                    </p>

                    {/* Legal links */}
                    <div className="flex justify-center gap-4 mt-4 text-xs">
                        <a
                            href="https://prodigiousent.github.io/APP-Factory/docs/resumetailor-pro/privacy-policy.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/70 hover:text-white underline"
                        >
                            Privacy Policy
                        </a>
                        <span className="text-white/40">•</span>
                        <a
                            href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/70 hover:text-white underline"
                        >
                            Terms of Use
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Paywall;
