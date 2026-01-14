import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { createClient } from '@supabase/supabase-js';
import { Wallpaper } from '../types';

const APP_ID = 'vibepaper';

// Initialize Supabase (using standard Vite environment variables)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Only create the client if we have a URL, otherwise the app will crash at startup
export const supabase = supabaseUrl ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * Saves a base64 image to the local filesystem and returns the normalized URL.
 */
export const saveImageToLocal = async (id: string, base64Data: string): Promise<string> => {
    try {
        const fileName = `${APP_ID}_${id}.png`;

        // Strip the data:image/png;base64, prefix for binary saving
        const rawData = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

        // Save image as binary (no encoding specified for base64)
        await Filesystem.writeFile({
            path: fileName,
            data: rawData,
            directory: Directory.Data,
        });

        const fileResult = await Filesystem.getUri({
            directory: Directory.Data,
            path: fileName,
        });

        return fileResult.uri;
    } catch (error) {
        console.error('Error saving image locally:', error);
        throw error;
    }
};

/**
 * Syncs wallpaper metadata to Supabase.
 */
export const syncMetadataToCloud = async (wallpaper: Wallpaper) => {
    try {
        if (!supabase) return;

        const { error } = await supabase
            .from('history')
            .upsert({
                id: wallpaper.id,
                app_id: APP_ID,
                created_at: new Date(wallpaper.timestamp).toISOString(),
                data: {
                    prompt: wallpaper.prompt,
                    config: wallpaper.config,
                }
            });

        if (error) throw error;
    } catch (error) {
        console.error('Error syncing metadata to Supabase:', error);
        // Non-blocking error, we still have local data
    }
};

/**
 * Loads the user's gallery from local storage.
 * In a more advanced implementation, this would merge with cloud metadata.
 */
export const loadLocalGallery = async (): Promise<Wallpaper[]> => {
    // For now, we utilize the existing App.tsx state management, 
    // but this service is ready for permanent storage expansion.
    return [];
};

/**
 * Reads a local image file and returns it as a base64 string.
 */
export const readImageAsBase64 = async (uri: string): Promise<string> => {
    try {
        const result = await Filesystem.readFile({
            path: uri,
        });

        return `data:image/png;base64,${result.data}`;
    } catch (error) {
        console.error('Error reading local image:', error);
        throw error;
    }
};
/**
 * Converts internal file:// or capacitor:// URIs to a format suitable for display in the webview.
 */
export const convertInternalSrc = (url: string) => {
    if (!url) return url;
    if (url.startsWith('file://') || url.startsWith('capacitor://')) {
        return Capacitor.convertFileSrc(url);
    }
    return url;
};
