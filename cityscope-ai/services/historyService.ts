import { supabase } from './supabaseClient';
import { APP_CONFIG } from '../app.config';

export interface HistoryItem {
    id?: string;
    created_at?: string;
    app_id: string;
    user_id?: string;
    data: {
        name: string;
        location: string;
        description: string;
        image_url?: string;
        type: 'discovery' | 'postcard';
        style?: string;
    };
}

export const historyService = {
    async saveHistory(item: Omit<HistoryItem, 'app_id'>) {
        try {
            const { data, error } = await supabase
                .from('history')
                .insert([
                    {
                        ...item,
                        app_id: APP_CONFIG.appId,
                    }
                ])
                .select();

            if (error) throw error;
            return data;
        } catch (err) {
            console.error("Error saving history to Supabase:", err);
            return null;
        }
    },

    async getHistory() {
        try {
            const { data, error } = await supabase
                .from('history')
                .select('*')
                .eq('app_id', APP_CONFIG.appId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (err) {
            console.error("Error fetching history from Supabase:", err);
            return [];
        }
    }
};
