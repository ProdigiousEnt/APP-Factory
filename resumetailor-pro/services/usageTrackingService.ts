/**
 * Usage Tracking Service
 * Implements Pattern L.M.R (Local Monthly Reset)
 * 
 * Free Tier: 3 analyses total (lifetime)
 * Pro Tier: 1,000 analyses per month
 */

const FREE_LIMIT = 3;
const PRO_MONTHLY_LIMIT = 1000;

class UsageTrackingService {
    private readonly FREE_KEY = 'resumetailor_free_usage';
    private readonly PRO_KEY_PREFIX = 'resumetailor_pro_usage';

    /**
     * Get current month key in format: resumetailor_pro_usage_2026-01
     */
    private getCurrentMonthKey(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${this.PRO_KEY_PREFIX}_${year}-${month}`;
    }

    /**
     * Get free tier usage count (lifetime total)
     */
    getFreeUsage(): number {
        const stored = localStorage.getItem(this.FREE_KEY);
        return stored ? parseInt(stored, 10) : 0;
    }

    /**
     * Get Pro tier usage count (current month only)
     */
    getProUsage(): number {
        const monthKey = this.getCurrentMonthKey();
        const stored = localStorage.getItem(monthKey);
        return stored ? parseInt(stored, 10) : 0;
    }

    /**
     * Increment free tier usage
     */
    incrementFreeUsage(): void {
        const current = this.getFreeUsage();
        localStorage.setItem(this.FREE_KEY, String(current + 1));
    }

    /**
     * Increment Pro tier usage (auto-resets monthly)
     */
    incrementProUsage(): void {
        const monthKey = this.getCurrentMonthKey();
        const current = this.getProUsage();
        localStorage.setItem(monthKey, String(current + 1));
    }

    /**
     * Check if user can perform an analysis
     * @param isPro - Whether user has Pro subscription
     * @returns { canUse: boolean, remaining: number, limit: number }
     */
    checkUsageLimit(isPro: boolean): { canUse: boolean; remaining: number; limit: number } {
        if (isPro) {
            const used = this.getProUsage();
            const remaining = Math.max(0, PRO_MONTHLY_LIMIT - used);
            return {
                canUse: used < PRO_MONTHLY_LIMIT,
                remaining,
                limit: PRO_MONTHLY_LIMIT
            };
        } else {
            const used = this.getFreeUsage();
            const remaining = Math.max(0, FREE_LIMIT - used);
            return {
                canUse: used < FREE_LIMIT,
                remaining,
                limit: FREE_LIMIT
            };
        }
    }

    /**
     * Record a successful analysis
     * @param isPro - Whether user has Pro subscription
     */
    recordUsage(isPro: boolean): void {
        if (isPro) {
            this.incrementProUsage();
        } else {
            this.incrementFreeUsage();
        }
    }

    /**
     * Get usage display string for UI
     * @param isPro - Whether user has Pro subscription
     * @returns String like "2/3 free" or "Pro (45/1,000)"
     */
    getUsageDisplay(isPro: boolean): string {
        if (isPro) {
            const used = this.getProUsage();
            return `Pro (${used.toLocaleString()}/${PRO_MONTHLY_LIMIT.toLocaleString()})`;
        } else {
            const used = this.getFreeUsage();
            return `${used}/${FREE_LIMIT} free`;
        }
    }
}

export const usageTrackingService = new UsageTrackingService();
