import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            app_id: 'zensynth'
                        }
                    }
                });
                if (error) throw error;
                setMessage({ type: 'success', text: 'Check your email for the confirmation link!' });
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.error_description || error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/20">
                        <img src="/logo.png" alt="ZenSynth Logo" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-4xl font-serif text-white tracking-tight">ZenSynth</h1>
                    <p className="text-slate-400">Your journey to mindfulness begins here.</p>
                </div>

                <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl backdrop-blur-xl shadow-2xl space-y-6">
                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                                placeholder="hello@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {message && (
                            <div className={`p-4 rounded-2xl text-sm font-medium border ${message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-teal-500/10 border-teal-500/20 text-teal-400'}`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            disabled={loading}
                            className="w-full py-4 bg-white text-slate-950 font-bold rounded-2xl transition-all active:scale-[0.98] hover:shadow-lg hover:shadow-white/5 disabled:opacity-50"
                        >
                            {loading ? 'Authenticating...' : isSignUp ? 'Create Account' : 'Sign In'}
                        </button>
                    </form>

                    <div className="text-center">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
