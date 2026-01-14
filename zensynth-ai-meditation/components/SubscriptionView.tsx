import React, { useEffect, useState } from 'react';
import { revenueCatService } from '../services/revenueCatService';
import { PurchasesPackage } from '@revenuecat/purchases-capacitor';

interface SubscriptionViewProps {
    onPurchased: () => void;
    onClose: () => void;
}

const SubscriptionView: React.FC<SubscriptionViewProps> = ({ onPurchased, onClose }) => {
    const [packages, setPackages] = useState<PurchasesPackage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadOfferings() {
            const offering = await revenueCatService.getOfferings();
            if (offering) {
                setPackages(offering.availablePackages);
            }
            setLoading(false);
        }
        loadOfferings();
    }, []);

    const handlePurchase = async (pkg: PurchasesPackage) => {
        setLoading(true);
        const success = await revenueCatService.purchaseProduct(pkg);
        if (success) {
            onPurchased();
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[70] bg-slate-950 flex flex-col p-8 bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950 animate-in fade-in duration-500">
            <div className="flex-1 flex flex-col items-center justify-center space-y-8 max-w-md mx-auto w-full">
                <div className="text-center space-y-4">
                    <div className="w-24 h-24 mx-auto rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-500/20 bg-white/5 p-4 backdrop-blur-3xl border border-white/10">
                        <img src="/logo.png" alt="ZenSynth Logo" className="w-full h-full object-cover" />
                    </div>
                    <h2 className="text-4xl font-serif text-white tracking-tight">ZenSynth Pro</h2>
                    <p className="text-slate-400 text-lg">Unlimited AI-generated journeys, crystal clear audio, and spatial expansion.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 w-full">
                    {loading ? (
                        <div className="py-12 flex justify-center">
                            <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                        </div>
                    ) : (
                        packages.map((pkg) => (
                            <button
                                key={pkg.identifier}
                                onClick={() => handlePurchase(pkg)}
                                className="group relative p-6 bg-slate-900/60 border border-slate-800 rounded-3xl text-left transition-all active:scale-[0.98] hover:border-indigo-500/50"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-bold text-white uppercase tracking-tighter">{pkg.packageType}</h3>
                                        <p className="text-slate-500 text-sm mt-1">Full access to all sensory features</p>
                                    </div>
                                    <div className="text-2xl font-black text-indigo-400">{pkg.product.priceString}</div>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <button
                    onClick={async () => {
                        const success = await revenueCatService.restorePurchases();
                        if (success) onPurchased();
                    }}
                    className="text-xs font-bold text-slate-600 uppercase tracking-widest hover:text-slate-400 transition-colors"
                >
                    Restore Purchases
                </button>
            </div>

            <button
                onClick={onClose}
                className="absolute top-12 right-8 text-slate-600 hover:text-white transition-colors"
            >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <div className="mt-auto py-8 text-center">
                <p className="text-[10px] text-slate-700 leading-relaxed max-w-xs mx-auto">
                    Subscriptions will automatically renew unless canceled within 24-hours before the end of the current period.
                </p>
            </div>
        </div>
    );
};

export default SubscriptionView;
