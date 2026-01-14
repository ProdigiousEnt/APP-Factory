
/**
 * Retry Utilities for AI Operations
 * Implements 3-Layer Defense System for production stability
 */

export interface RetryOptions {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
}

/**
 * Layer 1: Exponential Backoff Retry
 * Retries a function with increasing delays (1s, 2s, 4s)
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const { maxRetries = 3, baseDelay = 1000, maxDelay = 8000 } = options;

    let lastError: Error;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;

            // Don't retry on certain errors
            if (error.message === 'API_KEY_RESET_REQUIRED') {
                throw error;
            }

            // If this was the last attempt, throw
            if (attempt === maxRetries - 1) {
                break;
            }

            // Calculate delay with exponential backoff
            const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);

            console.log(`[Retry] Attempt ${attempt + 1}/${maxRetries} failed. Retrying in ${delay}ms...`);

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
}

/**
 * Layer 2: Sanitized Error Messages
 * Converts technical errors to user-friendly messages
 */
export function sanitizeError(error: any): string {
    const errorMessage = error?.message || String(error);

    // Map technical errors to user-friendly messages
    const errorMap: Record<string, string> = {
        'API_KEY_RESET_REQUIRED': 'Please reconnect your API key to continue.',
        'PERMISSION_DENIED': 'Unable to access the AI service. Please check your permissions.',
        'QUOTA_EXCEEDED': 'Daily generation limit reached. Please try again tomorrow.',
        'INVALID_ARGUMENT': 'Invalid request. Please try a different prompt.',
        'DEADLINE_EXCEEDED': 'Request timed out. Please check your internet connection and try again.',
        'RESOURCE_EXHAUSTED': 'Service temporarily unavailable. Please try again in a moment.',
        'UNAVAILABLE': 'Service temporarily unavailable. Please try again in a moment.',
        'INTERNAL': 'An unexpected error occurred. Please try again.',
        'UNAUTHENTICATED': 'Authentication failed. Please reconnect your API key.',
    };

    // Check for known error patterns
    for (const [pattern, message] of Object.entries(errorMap)) {
        if (errorMessage.includes(pattern) || errorMessage.toUpperCase().includes(pattern)) {
            return message;
        }
    }

    // Check for HTTP status codes
    if (errorMessage.includes('503') || errorMessage.includes('Service Unavailable')) {
        return 'Service temporarily unavailable. Please try again in a moment.';
    }

    if (errorMessage.includes('429') || errorMessage.includes('Too Many Requests')) {
        return 'Too many requests. Please wait a moment and try again.';
    }

    if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
        return 'An unexpected error occurred. Please try again.';
    }

    if (errorMessage.includes('network') || errorMessage.includes('Network')) {
        return 'Network error. Please check your internet connection and try again.';
    }

    // Generic fallback - ensure no internal development names leak
    return 'Unable to create your content. Please check your internet connection and try again.';
}

/**
 * Layer 3: Model Fallback Configuration
 */
export const MODEL_CONFIG = {
    PRIMARY: 'gemini-2.5-flash-image',
    FALLBACK: 'gemini-2.0-flash-preview-image-generation',
    TEXT_MODEL: 'gemini-2.5-flash',
} as const;

/**
 * Aspect Ratio Mapping for Gemini API
 * Maps user-friendly ratios to API format
 */
export function mapAspectRatio(ratio: string): string {
    // Gemini API expects ratios in "width:height" format
    // Our app already uses this format, so we can pass through
    return ratio;
}
