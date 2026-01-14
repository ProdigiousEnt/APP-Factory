
import { Filesystem, Directory } from '@capacitor/filesystem';
import { GeneratedContent, Platform } from '../types';

export interface HistoryEntry {
    id: string;
    created_at: string;
    data: {
        platform: Platform;
        text: string;
        imageUrl: string;
        localPath?: string;
        idea: string;
    };
}

const HISTORY_STORAGE_KEY = 'sg_history';

export const HistoryService = {
    /**
     * Saves a generated result to local storage (both image and metadata)
     */
    async saveResult(idea: string, content: GeneratedContent): Promise<void> {
        if (content.status !== 'success' || !content.imageUrl) return;

        let localPath = '';

        // 1. Save Image to Local Filesystem (Capacitor)
        try {
            const fileName = `sg_${Date.now()}_${content.platform.toLowerCase().replace(/\//g, '_')}.png`;

            // Remove data:image/png;base64, prefix if present
            const base64Data = content.imageUrl.replace(/^data:image\/\w+;base64,/, '');

            const savedFile = await Filesystem.writeFile({
                path: fileName,
                data: base64Data,
                directory: Directory.Documents,
            });

            localPath = savedFile.uri;
            console.log(`[History] Image saved locally: ${localPath}`);
        } catch (e) {
            console.warn('[History] Failed to save image locally:', e);
            return; // Don't save metadata if image save failed
        }

        // 2. Save Metadata to localStorage
        try {
            const entry: HistoryEntry = {
                id: `sg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                created_at: new Date().toISOString(),
                data: {
                    platform: content.platform,
                    text: content.text,
                    imageUrl: content.imageUrl, // Keep base64 as backup
                    localPath: localPath,
                    idea: idea
                }
            };

            // Get existing history
            const existingHistory = this.getHistorySync();

            // Add new entry at the beginning
            const updatedHistory = [entry, ...existingHistory];

            // Keep only last 100 entries to avoid storage bloat
            const trimmedHistory = updatedHistory.slice(0, 100);

            // Save to localStorage
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmedHistory));

            console.log(`[History] Metadata saved locally for ${content.platform}`);
        } catch (e) {
            console.error('[History] Failed to save metadata:', e);
        }
    },

    /**
     * Retrieves history entries from localStorage (synchronous)
     */
    getHistorySync(): HistoryEntry[] {
        try {
            const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
            if (!stored) return [];
            return JSON.parse(stored) as HistoryEntry[];
        } catch (e) {
            console.error('[History] Failed to parse history:', e);
            return [];
        }
    },

    /**
     * Retrieves history entries (async wrapper for consistency)
     */
    async getHistory(): Promise<HistoryEntry[]> {
        return this.getHistorySync();
    },

    /**
     * Deletes a specific history entry
     */
    async deleteEntry(id: string): Promise<void> {
        try {
            const history = this.getHistorySync();
            const entry = history.find(e => e.id === id);

            // Delete the image file if it exists
            if (entry?.data.localPath) {
                try {
                    const fileName = entry.data.localPath.split('/').pop();
                    if (fileName) {
                        await Filesystem.deleteFile({
                            path: fileName,
                            directory: Directory.Documents,
                        });
                    }
                } catch (e) {
                    console.warn('[History] Failed to delete image file:', e);
                }
            }

            // Remove from localStorage
            const updatedHistory = history.filter(e => e.id !== id);
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));

            console.log(`[History] Entry ${id} deleted`);
        } catch (e) {
            console.error('[History] Failed to delete entry:', e);
        }
    },

    /**
     * Clears all history
     */
    async clearAll(): Promise<void> {
        try {
            // Note: We don't delete all images to avoid accidentally deleting user files
            // Just clear the metadata
            localStorage.removeItem(HISTORY_STORAGE_KEY);
            console.log('[History] All history cleared');
        } catch (e) {
            console.error('[History] Failed to clear history:', e);
        }
    }
};
