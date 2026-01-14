
import React from 'react';
import { GeneratedContent, Platform } from '../types';
import { cn } from '../services/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

interface PlatformCardProps {
  platform: Platform;
  content: GeneratedContent | null;
}

// Inline SVGs to avoid dependency issues in native
const Icons = {
  LinkedIn: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a2.7 2.7 0 0 0-2.7-2.7c-1.1 0-1.9.6-2.3 1.3v-1.1h-2.1v7.8h2.1v-4.1a1.4 1.4 0 0 1 1.4-1.4 1.4 1.4 0 0 1 1.4 1.4v4.1h2.2M7.2 8.7a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6m1.1 9.8v-7.8H6.1v7.8h2.2z" /></svg>
  ),
  Twitter: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.2 4H21l-6.1 7L22 20h-5.6l-4.4-5.8L7.1 20H4.3l6.5-7.4L4 4h5.8l3.9 5.1L18.2 4zm-1 14.5h1.5L8.3 5.5H6.7l10.5 13z" /></svg>
  ),
  Instagram: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
  ),
  Copy: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
  ),
  Download: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
  ),
  Alert: () => (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
  ),
  Loader: () => (
    <svg className="w-8 h-8 animate-spin text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" /></svg>
  ),
  Share: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
  )
};

const PLATFORM_COLORS = {
  'LinkedIn': 'text-blue-600',
  'Twitter/X': 'text-slate-900',
  'Instagram': 'text-pink-600',
};

export const PlatformCard: React.FC<PlatformCardProps> = ({ platform, content }) => {
  const Icon = platform === 'LinkedIn' ? Icons.LinkedIn : platform === 'Twitter/X' ? Icons.Twitter : Icons.Instagram;
  const colorClass = PLATFORM_COLORS[platform];

  const handleCopy = () => {
    if (content?.text) {
      navigator.clipboard.writeText(content.text);
    }
  };

  const handleShare = async () => {
    if (!content?.text || !content?.imageUrl) return;

    try {
      // Convert base64 image to temporary file for sharing
      const base64Data = content.imageUrl.replace(/^data:image\/\w+;base64,/, '');
      const fileName = `share_${platform.toLowerCase().replace(/\//g, '_')}_${Date.now()}.png`;

      // Save to Data directory (more reliable than Cache)
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Data,
        recursive: true, // Create parent directories if needed
      });

      console.log(`[Share] Temporary file created: ${savedFile.uri}`);

      // Share using the file URI
      await Share.share({
        title: `${platform} Post`,
        text: content.text,
        url: savedFile.uri,
        dialogTitle: `Share to ${platform}`,
      });
    } catch (error) {
      console.error('[Share] Failed:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="aero-panel overflow-hidden flex flex-col h-full min-h-[400px]"
    >
      {/* Header */}
      <div className="p-4 border-b border-black/5 flex items-center justify-between bg-slate-50/50">
        <div className={cn("flex items-center gap-2", colorClass)}>
          <Icon />
          <span className="font-bold text-xs tracking-widest uppercase opacity-80">{platform}</span>
        </div>
        {content?.status === 'success' && (
          <div className="flex gap-2">
            <button onClick={handleCopy} className="p-2 hover:bg-black/5 rounded-full transition-colors text-slate-400 hover:text-indigo-600">
              <Icons.Copy />
            </button>
            <button onClick={handleShare} className="p-2 hover:bg-black/5 rounded-full transition-colors text-slate-400 hover:text-indigo-600">
              <Icons.Share />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col p-4">
        <AnimatePresence mode="wait">
          {!content ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-center opacity-20"
            >
              <div className={colorClass}><Icon /></div>
              <p className="text-xs font-bold uppercase tracking-widest mt-4">Drafting Mode</p>
            </motion.div>
          ) : content.status === 'loading' ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-4"
            >
              <div className="relative">
                <Icons.Loader />
                <div className="absolute inset-0 blur-lg bg-indigo-500/10 animate-pulse" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600/60 animate-pulse text-center">Creating Content</p>
            </motion.div>
          ) : content.status === 'error' ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-6 text-center text-red-500"
            >
              <Icons.Alert />
              <p className="text-xs font-bold uppercase tracking-widest mb-1 mt-2">Generation Failed</p>
              <p className="text-xs text-slate-600 leading-relaxed max-w-[220px]">{content.errorMessage || 'An error occurred. Please try again.'}</p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              {/* Image Preview */}
              {content.imageUrl && (
                <div className="relative group aspect-square rounded-2xl overflow-hidden border border-black/5 shadow-lg">
                  <img
                    src={content.imageUrl}
                    alt={`${platform} generate asset`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                    <button className="glass-pill px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform text-indigo-600 bg-white shadow-xl">
                      <Icons.Download /> Export Asset
                    </button>
                  </div>
                </div>
              )}

              {/* Text Content */}
              <div className="bg-slate-50/50 rounded-2xl p-4 border border-black/5">
                <p className="text-sm leading-relaxed text-slate-600 font-medium whitespace-pre-wrap">
                  {content.text}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
