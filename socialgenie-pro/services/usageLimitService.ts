
import { supabase, APP_ID } from './supabaseClient';
import { Purchases } from '@revenuecat/purchases-capacitor';

interface UsageRecord {
    id: string;
    app_id: string;
    device_id: string;
    generation_count: number;
    created_at: string;
    updated_at: string;
}

const FREE_TIER_LIMIT = 3; // 3 generations total (lifetime)
const PRO_TIER_LIMIT = 100; // 100 posts per month for Pro users ($4.99/month)

export const UsageLimitService = {
    /**
     * Gets the device ID from RevenueCat (survives app reinstalls)
     */
    async getDeviceId(): Promise<string> {
        try {
            const customerInfo = await Purchases.getCustomerInfo();
            return customerInfo.customerInfo.originalAppUserId;
        } catch (error) {
            console.warn('[UsageLimit] Failed to get RevenueCat ID, using fallback');
            // Fallback to a generated ID stored in localStorage
            let deviceId = localStorage.getItem('sg_device_id');
            if (!deviceId) {
                deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                localStorage.setItem('sg_device_id', deviceId);
            }
            return deviceId;
        }
    },

    /**
     * Gets current usage record for this device
     */
    async getUsageRecord(): Promise<UsageRecord | null> {
        try {
            const deviceId = await this.getDeviceId();

            const { data, error } = await supabase
                .from('generation_usage')
                .select('*')
                .eq('app_id', APP_ID)
                .eq('device_id', deviceId)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
                throw error;
            }

            return data as UsageRecord | null;
        } catch (error) {
            console.error('[UsageLimit] Failed to get usage record:', error);
            return null;
        }
    },

    /**
     * Creates a new usage record for this device
     */
    async createUsageRecord(): Promise<UsageRecord | null> {
        try {
            const deviceId = await this.getDeviceId();

            const { data, error } = await supabase
                .from('generation_usage')
                .insert({
                    app_id: APP_ID,
                    device_id: deviceId,
                    generation_count: 0,
                })
                .select()
                .single();

            if (error) throw error;
            return data as UsageRecord;
        } catch (error) {
            console.error('[UsageLimit] Failed to create usage record:', error);
            return null;
        }
    },

    /**
     * Checks if user has remaining generations (LIFETIME limit for free tier)
     */
    async checkGenerationLimit(): Promise<{ allowed: boolean; remaining: number; resetDate: Date | null }> {
        try {
            let record = await this.getUsageRecord();

            // If no record exists, create one
            if (!record) {
                console.log('[UsageLimit] No record found, creating new one');
                record = await this.createUsageRecord();
                if (!record) {
                    // If creation fails, allow generation (fail-open for better UX)
                    console.warn('[UsageLimit] Failed to create record, allowing generation');
                    return { allowed: true, remaining: FREE_TIER_LIMIT, resetDate: null };
                }
            }

            const remaining = Math.max(0, FREE_TIER_LIMIT - record.generation_count);
            const allowed = record.generation_count < FREE_TIER_LIMIT;

            console.log(`[UsageLimit] Count: ${record.generation_count}/${FREE_TIER_LIMIT}, Remaining: ${remaining}, Allowed: ${allowed}`);

            return {
                allowed,
                remaining,
                resetDate: null // No reset - lifetime limit
            };
        } catch (error) {
            console.error('[UsageLimit] Error checking limit:', error);
            // Fail-open: allow generation if there's an error
            return { allowed: true, remaining: FREE_TIER_LIMIT, resetDate: null };
        }
    },

    /**
     * Checks Pro tier monthly limit (40 posts/month)
     */
    async checkProGenerationLimit(): Promise<{ allowed: boolean; remaining: number; resetDate: Date }> {
        try {
            const deviceId = await this.getDeviceId();
            const now = new Date();
            const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

            // Get Pro usage from localStorage (keyed by month)
            const storageKey = `sg_pro_usage_${currentMonth}`;
            const storedCount = parseInt(localStorage.getItem(storageKey) || '0');

            const remaining = Math.max(0, PRO_TIER_LIMIT - storedCount);
            const allowed = storedCount < PRO_TIER_LIMIT;

            // Calculate reset date (first day of next month)
            const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

            console.log(`[UsageLimit Pro] Count: ${storedCount}/${PRO_TIER_LIMIT}, Remaining: ${remaining}, Allowed: ${allowed}`);

            return { allowed, remaining, resetDate };
        } catch (error) {
            console.error('[UsageLimit] Error checking Pro limit:', error);
            // Fail-open: allow generation if there's an error
            const resetDate = new Date();
            resetDate.setMonth(resetDate.getMonth() + 1, 1);
            return { allowed: true, remaining: PRO_TIER_LIMIT, resetDate };
        }
    },

    /**
     * Increments the generation count after a successful generation
     */
    async incrementGenerationCount(): Promise<void> {
        try {
            const deviceId = await this.getDeviceId();

            // Try using the RPC function first (atomic operation)
            const { error: rpcError } = await supabase.rpc('increment_generation_count', {
                p_app_id: APP_ID,
                p_device_id: deviceId
            });

            if (rpcError) {
                console.warn('[UsageLimit] RPC failed, using direct update:', rpcError);

                // Fallback: direct update
                const { error: updateError } = await supabase
                    .from('generation_usage')
                    .update({
                        generation_count: supabase.raw('generation_count + 1'),
                        updated_at: new Date().toISOString()
                    })
                    .eq('app_id', APP_ID)
                    .eq('device_id', deviceId);

                if (updateError) throw updateError;
            }

            console.log('[UsageLimit] Generation count incremented');
        } catch (error) {
            console.error('[UsageLimit] Failed to increment count:', error);
            // Non-blocking error - we already allowed the generation
        }
    },

    /**
     * Increments Pro tier monthly count
     */
    async incrementProGenerationCount(): Promise<void> {
        try {
            const now = new Date();
            const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const storageKey = `sg_pro_usage_${currentMonth}`;

            const currentCount = parseInt(localStorage.getItem(storageKey) || '0');
            localStorage.setItem(storageKey, String(currentCount + 1));

            console.log('[UsageLimit Pro] Count incremented to:', currentCount + 1);
        } catch (error) {
            console.error('[UsageLimit] Failed to increment Pro count:', error);
        }
    }
};

