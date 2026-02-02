import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, VolumeX } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { cn } from '@/lib/utils';
import type { NarrateSpeakResponse } from '@/lib/api';

interface NarratorPanelProps {
  narration: NarrateSpeakResponse | null;
  isLoading: boolean;
  actionCount: number;
}

// ── Audio playback ──────────────────────────────────────────
let currentAudio: HTMLAudioElement | null = null;

function playBase64Audio(base64: string) {
  stopSpeaking();
  if (!base64) return;
  const blob = new Blob(
    [Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))],
    { type: 'audio/mpeg' }
  );
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  currentAudio = audio;
  audio.onended = () => {
    URL.revokeObjectURL(url);
    if (currentAudio === audio) currentAudio = null;
  };
  audio.play();
}

function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

// ── Typewriter component ────────────────────────────────────
function TypewriterText({ text, speed = 18 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    indexRef.current = 0;

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current += 1;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {!done && (
        <motion.span
          className="inline-block w-0.5 h-3.5 bg-primary ml-0.5 align-middle rounded-full"
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
        />
      )}
    </span>
  );
}

// ── Main panel ──────────────────────────────────────────────
export function NarratorPanel({
  narration,
  isLoading,
  actionCount,
}: NarratorPanelProps) {
  const [displayedNarration, setDisplayedNarration] = useState<NarrateSpeakResponse | null>(null);
  const [displayKey, setDisplayKey] = useState(0);
  const [muted, setMuted] = useState(false);
  const prevCountRef = useRef(actionCount);
  const mutedRef = useRef(muted);

  useEffect(() => { mutedRef.current = muted; }, [muted]);

  // Narration arrives with audio already embedded — play both instantly
  useEffect(() => {
    if (!narration || actionCount === prevCountRef.current) return;
    prevCountRef.current = actionCount;

    // Audio + text arrive together — start both NOW
    if (!mutedRef.current && narration.audio_base64) {
      playBase64Audio(narration.audio_base64);
    }
    setDisplayedNarration(narration);
    setDisplayKey((k) => k + 1);
  }, [narration, actionCount]);

  useEffect(() => {
    if (actionCount === 0) {
      setDisplayedNarration(null);
      stopSpeaking();
    }
  }, [actionCount]);

  useEffect(() => () => stopSpeaking(), []);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMuted((prev) => {
      const next = !prev;
      if (next) stopSpeaking();
      return next;
    });
  }, []);

  if (actionCount === 0) return null;

  const toneColors: Record<string, string> = {
    analytical: 'from-primary/15 to-primary/5 border-primary/30',
    excited: 'from-warning/15 to-warning/5 border-warning/30',
    cautious: 'from-secondary/15 to-secondary/5 border-secondary/30',
  };

  const toneIcons: Record<string, string> = {
    analytical: '🔍',
    excited: '⚡',
    cautious: '🛡️',
  };

  const gradientClass = displayedNarration
    ? toneColors[displayedNarration.tone] || toneColors.analytical
    : 'from-primary/10 to-transparent border-primary/20';

  return (
    <div
      className={cn(
        'rounded-xl border overflow-hidden bg-gradient-to-r backdrop-blur-sm',
        gradientClass
      )}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Live indicator */}
        <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
          <div className="relative">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
              <Mic className="w-4 h-4 text-primary" />
            </div>
            <motion.div
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-background"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
              AI Commentator
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 font-bold uppercase tracking-wider">
              Live
            </span>

            <button
              onClick={toggleMute}
              className="ml-auto p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-card-hover transition-colors"
              title={muted ? 'Unmute commentator' : 'Mute commentator'}
            >
              {muted ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Loading — waiting for combined narrate+TTS response */}
          {isLoading && !displayedNarration && (
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              >
                <Logo className="w-4 h-4" />
              </motion.div>
              <span className="text-sm text-muted-foreground animate-pulse">
                Analyzing draft...
              </span>
            </div>
          )}

          {/* Narration text — typewriter + audio start at the same instant */}
          {displayedNarration && (
            <AnimatePresence mode="wait">
              <motion.p
                key={displayKey}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-foreground/90 leading-relaxed"
              >
                <span className="mr-1.5 text-base">
                  {toneIcons[displayedNarration.tone] || '🔍'}
                </span>
                <TypewriterText text={displayedNarration.narrative} />
              </motion.p>
            </AnimatePresence>
          )}

          {!displayedNarration && !isLoading && (
            <span className="text-sm text-muted-foreground italic">
              Commentary will appear as the draft progresses...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
