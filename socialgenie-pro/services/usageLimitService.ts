
import { supabase, APP_ID } from './supabaseClient';
import { Purchases } from '@revenuecat/purchases-capacitor';

interface UsageRecord {
    id: string;
    app_id: string;
    device_id: string;
    generation_count: number;
    week_start_date: string;
    created_at: string;
    updated_at: string;
}

const FREE_TIER_LIMIT = 3;
const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

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
     * Checks if a new week has started and resets counter if needed
     */
    shouldResetWeek(weekStartDate: string): boolean {
        const weekStart = new Date(weekStartDate).getTime();
        const now = Date.now();
        return (now - weekStart) >= WEEK_IN_MS;
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
                    week_start_date: new Date().toISOString(),
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
     * Resets the weekly counter
     */
    async resetWeeklyCounter(deviceId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('generation_usage')
                .update({
                    generation_count: 0,
                    week_start_date: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('app_id', APP_ID)
                .eq('device_id', deviceId);

            if (error) throw error;
            console.log('[UsageLimit] Weekly counter reset');
        } catch (error) {
            console.error('[UsageLimit] Failed to reset counter:', error);
        }
    },

    /**
     * Checks remaining generations for free tier
     * Returns: { allowed: boolean, remaining: number, resetDate: Date }
     */
    async checkGenerationLimit(): Promise<{ allowed: boolean; remaining: number; resetDate: Date | null }> {
        try {
            let record = await this.getUsageRecord();

            // First time user - create record
            if (!record) {
                console.log('[UsageLimit] No record found, creating new record');
                record = await this.createUsageRecord();
                if (!record) {
                    // Fallback: allow generation if Supabase fails
                    console.warn('[UsageLimit] Failed to create record, allowing generation');
                    return { allowed: true, remaining: FREE_TIER_LIMIT, resetDate: null };
                }
            }

            // Check if week has passed - reset if needed
            if (this.shouldResetWeek(record.week_start_date)) {
                console.log('[UsageLimit] Week has passed, resetting counter');
                const deviceId = await this.getDeviceId();
                await this.resetWeeklyCounter(deviceId);
                record.generation_count = 0;
                record.week_start_date = new Date().toISOString();
            }

            const remaining = Math.max(0, FREE_TIER_LIMIT - record.generation_count);
            const resetDate = new Date(new Date(record.week_start_date).getTime() + WEEK_IN_MS);
            const allowed = record.generation_count < FREE_TIER_LIMIT;

            console.log(`[UsageLimit] Check result: count=${record.generation_count}, remaining=${remaining}, allowed=${allowed}`);

            return {
                allowed,
                remaining,
                resetDate,
            };
        } catch (error) {
            console.error('[UsageLimit] Check failed:', error);
            // Fallback: allow generation if check fails (better UX than blocking)
            console.warn('[UsageLimit] Allowing generation due to error');
            return { allowed: true, remaining: FREE_TIER_LIMIT, resetDate: null };
        }
    },

    /**
     * Increments generation count after successful generation
     */
    async incrementGenerationCount(): Promise<void> {
        try {
            const deviceId = await this.getDeviceId();

            const { error } = await supabase.rpc('increment_generation_count', {
                p_app_id: APP_ID,
                p_device_id: deviceId,
            });

            // Fallback if RPC doesn't exist - use update
            if (error && error.code === '42883') {
                const record = await this.getUsageRecord();
                if (record) {
                    await supabase
                        .from('generation_usage')
                        .update({
                            generation_count: record.generation_count + 1,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('app_id', APP_ID)
                        .eq('device_id', deviceId);
                }
            } else if (error) {
                throw error;
            }

            console.log('[UsageLimit] Generation count incremented');
        } catch (error) {
            console.error('[UsageLimit] Failed to increment count:', error);
        }
    },
};
