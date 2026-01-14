
import { createClient } from '@supabase/supabase-js';
import { generateReceiptNote } from '../utils/noteGenerator';
import { ReceiptData, Assignment } from '../types';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const APP_ID = 'splitsmart';

export interface SavedReceipt {
    id: string;
    user_id: string | null;
    app_id: string;
    created_at: string;
    total: number;
    currency: string;
    items: any;
    assignments: any;
    note?: string;
}

export const saveReceiptSession = async (
    userId: string | null,
    receiptData: ReceiptData,
    assignments: Assignment[]
) => {
    // Generate descriptive note
    const note = generateReceiptNote(receiptData, assignments);

    const { data, error } = await supabase
        .from('receipts')
        .insert({
            user_id: userId,
            app_id: APP_ID,
            total: receiptData.total,
            currency: receiptData.currency,
            items: receiptData.items,
            assignments: assignments,
            tax: receiptData.tax,
            tip: receiptData.tip,
            note: note
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getReceiptHistory = async (userId?: string | null) => {
    const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('app_id', APP_ID)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};
