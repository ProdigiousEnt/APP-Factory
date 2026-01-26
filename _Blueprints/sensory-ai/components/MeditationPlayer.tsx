
import React, { useState, useEffect, useRef } from 'react';
import { MeditationSession } from '../types';
import { decodeBase64, decodeAudioData } from '../services/geminiService';
import { AmbientSoundscape } from './AmbientSound';

interface MeditationPlayerProps {
  session: MeditationSession;
  onClose: () => void;
}

const MeditationPlayer: React.FC<MeditationPlayerProps> = ({ session, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const ambientRef = useRef<AmbientSoundscape | null>(null);

  useEffect(() => {
    // We create the engine instance here but don't call start yet
    // because mobile browsers require a user interaction to start audio.
    ambientRef.current = new AmbientSoundscape();

    return () => {
      stopAudio();
      ambientRef.current?.stop();
    };
  }, []);

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) { }
      sourceNodeRef.current = null;
    }
  };

  const playMeditation = async () => {
    if (!session.audioData) return;

    // 1. Initialize/Resume Global Audio Context
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') await ctx.resume();

    // 2. Start/Resume Ambient Sound Engine (Procedural Viking Horns, etc.)
    if (ambientRef.current) {
      ambientRef.current.start(session.theme);
    }

    // 3. Play Narrative Script
    const rawData = decodeBase64(session.audioData);
    const audioBuffer = await decodeAudioData(rawData, ctx, 24000, 1);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    source.onended = () => setIsPlaying(false);
    source.start();
    sourceNodeRef.current = source;
    setIsPlaying(true);
  };

  const handleToggle = () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      playMeditation();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center animate-in fade-in duration-1000">
      {/* Immersive Background */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={session.imageUrl}
          alt=""
          className={`w-full h-full object-cover transition-all duration-[10000ms] ease-in-out transform ${isPlaying ? 'scale-110 blur-[1px]' : 'scale-100'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-[env(safe-area-inset-top,1.5rem)] right-6 z-20 p-4 bg-white/5 backdrop-blur-xl rounded-full text-white/50 hover:text-white transition-all border border-white/10 active:scale-90"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Subtle Breathing Visualizer */}
      <div className="relative z-10 text-center px-6">
        <div className={`w-64 h-64 sm:w-72 sm:h-72 border border-white/10 rounded-full flex items-center justify-center transition-all duration-[4000ms] ease-in-out transform ${isPlaying ? 'scale-110 sm:scale-125 border-white/20' : 'scale-100'}`}>
          <div className={`w-48 h-48 sm:w-56 sm:h-56 border border-white/5 rounded-full flex items-center justify-center transition-all duration-[4000ms] ease-in-out delay-700 transform ${isPlaying ? 'scale-105 sm:scale-110 border-white/15' : 'scale-100'}`} />

          <button
            onClick={handleToggle}
            className="absolute inset-0 flex items-center justify-center group"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/5 group-hover:bg-white/10 backdrop-blur-3xl rounded-full flex items-center justify-center transition-all border border-white/10 shadow-2xl active:scale-95">
              {isPlaying ? (
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white/80" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              ) : (
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white/80 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              )}
            </div>
          </button>
        </div>

        <div className="mt-12 sm:mt-16 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-serif text-white/90 tracking-wide font-light capitalize">{session.theme}</h2>
          <div className="flex items-center justify-center gap-2">
            <span className={`w-1 h-1 bg-teal-500 rounded-full ${isPlaying ? 'animate-pulse' : 'opacity-20'}`} />
            <p className="text-[10px] text-white/30 uppercase tracking-[0.4em]">
              {isPlaying ? 'Spatial Environment Active' : 'Tap to Start Journey'}
            </p>
          </div>
        </div>
      </div>

      {/* Minimalist Captions */}
      <div className="absolute bottom-[env(safe-area-inset-bottom,3rem)] left-0 right-0 z-10 px-8 sm:px-12 text-center pointer-events-none">
        <button
          onClick={() => setShowCaptions(!showCaptions)}
          className="pointer-events-auto text-[10px] text-white/20 hover:text-white/50 transition-colors uppercase tracking-[0.3em] mb-4 block mx-auto font-bold p-2"
        >
          {showCaptions ? 'Hide Narrative' : 'Show Narrative'}
        </button>

        {showCaptions && (
          <div className="bg-black/40 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-white/5 max-w-2xl mx-auto shadow-2xl">
            <p className="text-base sm:text-xl font-serif text-white/70 italic leading-relaxed animate-in slide-in-from-bottom-2 fade-in duration-700">
              "{session.script}"
            </p>
          </div>
        )}
      </div>

      {/* Decorative Gradient Overlay */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
    </div>
  );
};

export default MeditationPlayer;
