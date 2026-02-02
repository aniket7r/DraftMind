import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LockInAnimationProps {
  lockIn: {
    champion: string;
    side: 'blue' | 'red';
    type: 'ban' | 'pick';
  } | null;
}

const DURATION = 2.0;

const sideText = (side: 'blue' | 'red') =>
  side === 'blue' ? 'text-blue-side' : 'text-red-side';
const sideBorder = (side: 'blue' | 'red') =>
  side === 'blue' ? 'border-blue-side' : 'border-red-side';
const sideBg = (side: 'blue' | 'red') =>
  side === 'blue' ? 'bg-blue-side' : 'bg-red-side';

// ── Variant 1: Shockwave — radial flash + expanding ring + slash lines ───
function ShockwaveVariant({ champion, side, type }: { champion: string; side: 'blue' | 'red'; type: 'ban' | 'pick' }) {
  return (
    <>
      {/* Radial flash */}
      <motion.div
        className={cn(
          'absolute inset-0 bg-gradient-radial',
          side === 'blue'
            ? 'from-blue-side/40 via-blue-side/10 to-transparent'
            : 'from-red-side/40 via-red-side/10 to-transparent'
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.6, 0] }}
        transition={{ duration: DURATION, times: [0, 0.12, 0.5, 1] }}
      />

      {/* Double expanding rings */}
      <motion.div
        className={cn('absolute w-40 h-40 rounded-full border-4', sideBorder(side))}
        initial={{ scale: 0.3, opacity: 1 }}
        animate={{ scale: 5, opacity: 0 }}
        transition={{ duration: DURATION * 0.7, ease: 'easeOut' }}
      />
      <motion.div
        className={cn(
          'absolute w-24 h-24 rounded-full border-2',
          side === 'blue' ? 'border-blue-side/60' : 'border-red-side/60'
        )}
        initial={{ scale: 0.5, opacity: 0.8 }}
        animate={{ scale: 6, opacity: 0 }}
        transition={{ duration: DURATION * 0.8, ease: 'easeOut', delay: 0.1 }}
      />

      {/* Champion name */}
      <div className="relative text-center z-10">
        <motion.p
          className={cn(
            'text-5xl font-black uppercase tracking-wider drop-shadow-2xl',
            sideText(side)
          )}
          initial={{ scale: 2.5, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: [0, 1, 1, 0], y: 0 }}
          transition={{ duration: DURATION, times: [0, 0.12, 0.65, 1] }}
        >
          {champion}
        </motion.p>
        <motion.p
          className="text-sm font-bold uppercase tracking-[0.4em] text-white/80 mt-1"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: [0, 1, 1, 0], y: 0 }}
          transition={{ duration: DURATION, delay: 0.06, times: [0, 0.15, 0.65, 1] }}
        >
          {type === 'ban' ? 'BANNED' : 'LOCKED IN'}
        </motion.p>
      </div>

      {/* Horizontal slash lines */}
      <motion.div
        className={cn('absolute left-0 right-0 h-[2px]', sideBg(side))}
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: [0, 1, 1], opacity: [1, 1, 0] }}
        transition={{ duration: DURATION * 0.6, times: [0, 0.3, 1] }}
        style={{ top: '48%' }}
      />
      <motion.div
        className={cn('absolute left-0 right-0 h-[2px]', sideBg(side))}
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: [0, 1, 1], opacity: [1, 1, 0] }}
        transition={{ duration: DURATION * 0.6, times: [0, 0.3, 1], delay: 0.05 }}
        style={{ top: '52%' }}
      />
    </>
  );
}

// ── Variant 2: Vortex — spinning diamond + vertical split ───
function VortexVariant({ champion, side, type }: { champion: string; side: 'blue' | 'red'; type: 'ban' | 'pick' }) {
  return (
    <>
      {/* Full-screen tint */}
      <motion.div
        className={cn(
          'absolute inset-0',
          side === 'blue' ? 'bg-blue-side/15' : 'bg-red-side/15'
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.5, 0] }}
        transition={{ duration: DURATION, times: [0, 0.1, 0.6, 1] }}
      />

      {/* Spinning diamond */}
      <motion.div
        className={cn('absolute w-48 h-48 border-2 rotate-45', sideBorder(side))}
        initial={{ scale: 0, opacity: 1, rotate: 45 }}
        animate={{ scale: [0, 2.5, 3], opacity: [1, 0.8, 0], rotate: [45, 135, 225] }}
        transition={{ duration: DURATION * 0.85, times: [0, 0.5, 1], ease: 'easeOut' }}
      />

      {/* Inner spinning diamond */}
      <motion.div
        className="absolute w-32 h-32 border border-white/30 rotate-45"
        initial={{ scale: 0, opacity: 0.6, rotate: 45 }}
        animate={{ scale: [0, 2, 2.5], opacity: [0.6, 0.4, 0], rotate: [45, -15, -75] }}
        transition={{ duration: DURATION * 0.85, delay: 0.08, times: [0, 0.5, 1], ease: 'easeOut' }}
      />

      {/* Vertical split lines */}
      <motion.div
        className={cn('absolute top-0 bottom-0 w-[2px]', sideBg(side))}
        initial={{ scaleY: 0, opacity: 1 }}
        animate={{ scaleY: [0, 1, 1], opacity: [1, 1, 0] }}
        transition={{ duration: DURATION * 0.5, times: [0, 0.4, 1] }}
        style={{ left: '49%' }}
      />
      <motion.div
        className={cn('absolute top-0 bottom-0 w-[2px]', sideBg(side))}
        initial={{ scaleY: 0, opacity: 1 }}
        animate={{ scaleY: [0, 1, 1], opacity: [1, 1, 0] }}
        transition={{ duration: DURATION * 0.5, times: [0, 0.4, 1], delay: 0.04 }}
        style={{ left: '51%' }}
      />

      {/* Champion name — slides in from left */}
      <div className="relative text-center z-10">
        <motion.p
          className={cn(
            'text-5xl font-black uppercase tracking-wider drop-shadow-2xl',
            sideText(side)
          )}
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: [0, 1, 1, 0] }}
          transition={{ duration: DURATION, times: [0, 0.12, 0.65, 1] }}
        >
          {champion}
        </motion.p>
        <motion.p
          className="text-sm font-bold uppercase tracking-[0.4em] text-white/80 mt-1"
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: [0, 1, 1, 0] }}
          transition={{ duration: DURATION, delay: 0.06, times: [0, 0.15, 0.65, 1] }}
        >
          {type === 'ban' ? 'BANNED' : 'LOCKED IN'}
        </motion.p>
      </div>
    </>
  );
}

// ── Variant 3: Glitch — digital glitch with staggered text ───
function GlitchVariant({ champion, side, type }: { champion: string; side: 'blue' | 'red'; type: 'ban' | 'pick' }) {
  return (
    <>
      {/* Scanline sweep */}
      <motion.div
        className={cn(
          'absolute left-0 right-0 h-[3px]',
          side === 'blue' ? 'bg-blue-side/80' : 'bg-red-side/80',
          'shadow-[0_0_20px_4px]',
          side === 'blue' ? 'shadow-blue-side/50' : 'shadow-red-side/50'
        )}
        initial={{ top: '-5%', opacity: 1 }}
        animate={{ top: ['-5%', '105%'], opacity: [1, 0.3] }}
        transition={{ duration: DURATION * 0.4, ease: 'easeIn' }}
      />

      {/* Horizontal glitch bars */}
      {[20, 35, 60, 75].map((top, i) => (
        <motion.div
          key={top}
          className={cn(
            'absolute left-0 right-0',
            side === 'blue' ? 'bg-blue-side/20' : 'bg-red-side/20'
          )}
          style={{ top: `${top}%`, height: `${3 + i * 2}px` }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: [0, 1.2, 1, 0], opacity: [0, 0.8, 0.6, 0], x: [0, i % 2 ? 10 : -10, 0, 0] }}
          transition={{ duration: DURATION * 0.6, delay: 0.05 + i * 0.04, times: [0, 0.2, 0.6, 1] }}
        />
      ))}

      {/* Background pulse */}
      <motion.div
        className={cn('absolute inset-0', side === 'blue' ? 'bg-blue-side/10' : 'bg-red-side/10')}
        animate={{ opacity: [0, 0.3, 0, 0.15, 0] }}
        transition={{ duration: DURATION * 0.5, times: [0, 0.2, 0.4, 0.6, 1] }}
      />

      {/* Outer frame box */}
      <motion.div
        className={cn(
          'absolute border',
          side === 'blue' ? 'border-blue-side/50' : 'border-red-side/50'
        )}
        style={{ inset: '30% 20%' }}
        initial={{ opacity: 0, scale: 1.5 }}
        animate={{ opacity: [0, 0.6, 0.6, 0], scale: [1.5, 1, 1, 0.95] }}
        transition={{ duration: DURATION, times: [0, 0.1, 0.65, 1] }}
      />

      {/* Champion name — glitch offset effect */}
      <div className="relative text-center z-10">
        {/* Glitch shadow copy */}
        <motion.p
          className={cn(
            'text-5xl font-black uppercase tracking-wider absolute inset-0 flex items-center justify-center',
            side === 'blue' ? 'text-red-side/30' : 'text-blue-side/30'
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0, 0.3, 0], x: [0, 4, -3, 2, 0] }}
          transition={{ duration: DURATION * 0.5, times: [0, 0.2, 0.4, 0.6, 1] }}
        >
          {champion}
        </motion.p>
        {/* Main text */}
        <motion.p
          className={cn(
            'text-5xl font-black uppercase tracking-wider drop-shadow-2xl',
            sideText(side)
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0], x: [0, -2, 1, 0] }}
          transition={{ duration: DURATION, times: [0, 0.1, 0.65, 1] }}
        >
          {champion}
        </motion.p>
        <motion.p
          className="text-sm font-bold uppercase tracking-[0.4em] text-white/80 mt-1"
          initial={{ opacity: 0, letterSpacing: '0.8em' }}
          animate={{ opacity: [0, 1, 1, 0], letterSpacing: ['0.8em', '0.4em', '0.4em', '0.4em'] }}
          transition={{ duration: DURATION, delay: 0.08, times: [0, 0.15, 0.65, 1] }}
        >
          {type === 'ban' ? 'BANNED' : 'LOCKED IN'}
        </motion.p>
      </div>
    </>
  );
}

// ── Variant 4: Eruption — bottom-up energy burst ───
function EruptionVariant({ champion, side, type }: { champion: string; side: 'blue' | 'red'; type: 'ban' | 'pick' }) {
  return (
    <>
      {/* Rising energy column */}
      <motion.div
        className={cn(
          'absolute left-[35%] right-[35%] bottom-0',
          side === 'blue'
            ? 'bg-gradient-to-t from-blue-side/50 via-blue-side/20 to-transparent'
            : 'bg-gradient-to-t from-red-side/50 via-red-side/20 to-transparent'
        )}
        initial={{ height: '0%', opacity: 0 }}
        animate={{ height: ['0%', '120%'], opacity: [0, 1, 0.7, 0] }}
        transition={{ duration: DURATION * 0.6, times: [0, 0.4, 0.7, 1] }}
      />

      {/* Expanding horizontal bars from center */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn(
            'absolute left-0 right-0 h-[1px]',
            side === 'blue' ? 'bg-blue-side/60' : 'bg-red-side/60'
          )}
          style={{ top: `${46 + i * 4}%` }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: [0, 1], opacity: [0, 0.8, 0.8, 0] }}
          transition={{ duration: DURATION * 0.7, delay: 0.15 + i * 0.06, times: [0, 0.3, 0.6, 1] }}
        />
      ))}

      {/* Corner accents */}
      {([
        { pos: 'top-4 left-4', bt: 'border-t-2', bl: 'border-l-2' },
        { pos: 'top-4 right-4', bt: 'border-t-2', bl: 'border-r-2' },
        { pos: 'bottom-4 left-4', bt: 'border-b-2', bl: 'border-l-2' },
        { pos: 'bottom-4 right-4', bt: 'border-b-2', bl: 'border-r-2' },
      ]).map(({ pos, bt, bl }) => (
        <motion.div
          key={pos}
          className={cn(
            'absolute w-8 h-8', pos, bt, bl,
            side === 'blue' ? 'border-blue-side/50' : 'border-red-side/50'
          )}
          initial={{ opacity: 0, scale: 2 }}
          animate={{ opacity: [0, 0.7, 0.7, 0], scale: [2, 1, 1, 0.8] }}
          transition={{ duration: DURATION, delay: 0.08, times: [0, 0.15, 0.65, 1] }}
        />
      ))}

      {/* Champion name — rises up */}
      <div className="relative text-center z-10">
        <motion.p
          className={cn(
            'text-5xl font-black uppercase tracking-wider drop-shadow-2xl',
            sideText(side)
          )}
          initial={{ y: 60, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: [0, 1, 1, 0], scale: [0.8, 1.1, 1, 1] }}
          transition={{ duration: DURATION, times: [0, 0.15, 0.65, 1] }}
        >
          {champion}
        </motion.p>
        <motion.p
          className="text-sm font-bold uppercase tracking-[0.4em] text-white/80 mt-1"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: [0, 1, 1, 0] }}
          transition={{ duration: DURATION, delay: 0.1, times: [0, 0.18, 0.65, 1] }}
        >
          {type === 'ban' ? 'BANNED' : 'LOCKED IN'}
        </motion.p>
      </div>
    </>
  );
}

// ── Variant 5: X-Strike — diagonal cross slash ───
function XStrikeVariant({ champion, side, type }: { champion: string; side: 'blue' | 'red'; type: 'ban' | 'pick' }) {
  return (
    <>
      {/* Diagonal slashes forming X */}
      <motion.div
        className={cn('absolute h-[2px] origin-center', sideBg(side))}
        style={{ width: '150%', left: '-25%', top: '50%', rotate: '25deg' }}
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: [0, 1, 1], opacity: [1, 1, 0] }}
        transition={{ duration: DURATION * 0.5, times: [0, 0.4, 1] }}
      />
      <motion.div
        className={cn('absolute h-[2px] origin-center', sideBg(side))}
        style={{ width: '150%', left: '-25%', top: '50%', rotate: '-25deg' }}
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: [0, 1, 1], opacity: [1, 1, 0] }}
        transition={{ duration: DURATION * 0.5, delay: 0.06, times: [0, 0.4, 1] }}
      />

      {/* Flash at intersection */}
      <motion.div
        className={cn(
          'absolute w-20 h-20 rounded-full blur-xl',
          side === 'blue' ? 'bg-blue-side/60' : 'bg-red-side/60'
        )}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 2, 3], opacity: [0, 1, 0] }}
        transition={{ duration: DURATION * 0.6, delay: 0.15 }}
      />

      {/* Four particles flying out */}
      {[
        { x: -120, y: -80, r: -15 },
        { x: 120, y: -80, r: 15 },
        { x: -120, y: 80, r: 15 },
        { x: 120, y: 80, r: -15 },
      ].map((dir, i) => (
        <motion.div
          key={i}
          className={cn('absolute w-3 h-1 rounded-full', sideBg(side))}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{ x: dir.x, y: dir.y, opacity: 0, rotate: dir.r }}
          transition={{ duration: DURATION * 0.5, delay: 0.2, ease: 'easeOut' }}
        />
      ))}

      {/* Champion name — scales in with punch */}
      <div className="relative text-center z-10">
        <motion.p
          className={cn(
            'text-5xl font-black uppercase tracking-wider drop-shadow-2xl',
            sideText(side)
          )}
          initial={{ scale: 3, opacity: 0 }}
          animate={{ scale: [3, 0.95, 1, 1], opacity: [0, 1, 1, 0] }}
          transition={{ duration: DURATION, times: [0, 0.15, 0.65, 1], ease: 'easeOut' }}
        >
          {champion}
        </motion.p>
        <motion.p
          className="text-sm font-bold uppercase tracking-[0.4em] text-white/80 mt-1"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1, 1, 1] }}
          transition={{ duration: DURATION, delay: 0.1, times: [0, 0.18, 0.65, 1] }}
        >
          {type === 'ban' ? 'BANNED' : 'LOCKED IN'}
        </motion.p>
      </div>
    </>
  );
}

const VARIANTS = [ShockwaveVariant, VortexVariant, GlitchVariant, EruptionVariant, XStrikeVariant];

export function LockInAnimation({ lockIn }: LockInAnimationProps) {
  const variantIndexRef = useRef(Math.floor(Math.random() * VARIANTS.length));

  // Pick a new random variant each time lockIn changes to non-null
  const prevLockInRef = useRef(lockIn);
  if (lockIn && !prevLockInRef.current) {
    variantIndexRef.current = Math.floor(Math.random() * VARIANTS.length);
  }
  prevLockInRef.current = lockIn;

  const Variant = VARIANTS[variantIndexRef.current];

  return (
    <AnimatePresence>
      {lockIn && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12, exit: { duration: 0.25 } }}
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
        >
          <Variant champion={lockIn.champion} side={lockIn.side} type={lockIn.type} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
