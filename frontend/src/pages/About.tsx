import { motion } from 'framer-motion';
import {
  Database,
  Trophy,
  Layers,
  Search,
  BarChart3,
  Shield,
  Zap,
  Target,
  Github,
  ExternalLink,
  Sparkles,
  Server,
  Code2,
  Cloud,
  Cpu,
  Mic,
  Eye,
  Crosshair,
  Flame,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/Logo';

// ── Animation Variants ────────────────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

// ── Animated Grid BG (reusable) ───────────────────────────────
function GridBG() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background))_70%)]" />
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
        initial={{ top: '0%' }}
        animate={{ top: '100%' }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
}

// ── Stat Counter ──────────────────────────────────────────────
function StatBlock({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4, type: 'spring' }}
      className="text-center"
    >
      <p className="text-3xl md:text-4xl font-black font-mono text-primary drop-shadow-[0_0_15px_hsl(var(--primary)/0.4)]">
        {value}
      </p>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1">{label}</p>
    </motion.div>
  );
}

// ── Feature Card ──────────────────────────────────────────────
function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative"
    >
      {/* Glow border on hover */}
      <div className="absolute -inset-px rounded-xl bg-gradient-to-b from-primary/0 to-primary/0 group-hover:from-primary/30 group-hover:to-transparent transition-all duration-300 opacity-0 group-hover:opacity-100" />

      <div className="relative bg-card border border-card-border rounded-xl p-5 h-full group-hover:border-primary/40 transition-colors">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/25 transition-colors">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Pipeline Step ─────────────────────────────────────────────
function PipelineStep({
  step,
  icon: Icon,
  title,
  items,
  color,
  delay,
}: {
  step: string;
  icon: React.ElementType;
  title: string;
  items: string[];
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="relative"
    >
      {/* Step number */}
      <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center z-10">
        <span className="text-[10px] font-mono font-bold text-primary">{step}</span>
      </div>

      <div className="ml-6 bg-card border border-card-border rounded-xl p-5 hover:border-primary/30 transition-colors">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-4.5 h-4.5" />
          </div>
          <h3 className="font-bold text-foreground">{title}</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {items.map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Tech Badge ────────────────────────────────────────────────
function TechBadge({
  icon: Icon,
  label,
  desc,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  desc: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.05 }}
      className="group bg-card border border-card-border rounded-xl p-4 text-center hover:border-primary/40 transition-all cursor-default"
    >
      <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 group-hover:shadow-[0_0_15px_hsl(var(--primary)/0.2)] transition-all">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <p className="font-bold text-foreground text-sm">{label}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
    </motion.div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────
export default function About() {
  return (
    <div className="min-h-screen">
      {/* ═══════ HERO ═══════ */}
      <section className="relative py-24 px-6 overflow-hidden">
        <GridBG />

        {/* Ambient glows */}
        <div className="absolute top-10 left-1/4 w-80 h-80 bg-primary/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-blue-side/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 right-10 w-48 h-48 bg-red-side/8 rounded-full blur-[80px]" />

        <motion.div
          className="relative max-w-4xl mx-auto text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="relative inline-block mb-6"
          >
            <Logo className="w-24 h-24 mx-auto drop-shadow-[0_0_30px_hsl(var(--primary)/0.4)]" />
            {/* Pulsing ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/20"
              animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/30 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-primary">AI-Powered Draft Intelligence</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-5xl md:text-7xl font-black text-foreground mb-4 tracking-tight"
          >
            DraftMind{' '}
            <span className="text-primary drop-shadow-[0_0_20px_hsl(var(--primary)/0.5)]">AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto"
          >
            Dominate the draft phase with machine learning trained on professional esports data
          </motion.p>

          {/* Accent line */}
          <motion.div
            className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-8"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          />
        </motion.div>
      </section>

      {/* ═══════ STATS BAR ═══════ */}
      <section className="py-8 px-6 border-y border-card-border bg-card/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex justify-around items-center">
          <StatBlock value="2,282" label="Games Analyzed" delay={0} />
          <div className="w-px h-10 bg-card-border" />
          <StatBlock value="941" label="Pro Series" delay={0.1} />
          <div className="w-px h-10 bg-card-border" />
          <StatBlock value="56" label="Teams" delay={0.2} />
          <div className="w-px h-10 bg-card-border" />
          <StatBlock value="168" label="Champions" delay={0.3} />
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section className="py-20 px-6">
        <motion.div
          className="max-w-5xl mx-auto"
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-black text-foreground mb-2">
              Weapons in Your <span className="text-primary">Arsenal</span>
            </h2>
            <p className="text-muted-foreground">Every tool you need to outplay the opponent before the game even starts</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard index={0} icon={Crosshair} title="AI Recommendations" description="Top 5 champion picks/bans per step, scored across 4 intelligence signals with confidence ratings" />
            <FeatureCard index={1} icon={Activity} title="Win Prediction" description="XGBoost ML model with temperature-scaled probability calibration for real-time win forecasting" />
            <FeatureCard index={2} icon={Layers} title="Composition Analysis" description="Damage profiles, CC scoring, scaling curves, and team archetype classification in real time" />
            <FeatureCard index={3} icon={Eye} title="Scouting Reports" description="Pre-game intel on any matchup — ban targets, danger picks, one-trick alerts, draft tendencies" />
            <FeatureCard index={4} icon={Mic} title="AI Narrator" description="Live draft commentary powered by Google Gemini with Edge TTS voice synthesis" />
            <FeatureCard index={5} icon={Shield} title="Pattern Detection" description="Team draft DNA, comfort picks, adaptation patterns — know what they'll do before they do it" />
          </div>
        </motion.div>
      </section>

      {/* ═══════ ARCHITECTURE PIPELINE ═══════ */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-card/40" />
        <GridBG />

        <div className="relative max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-black text-foreground mb-2">
              Intelligence <span className="text-primary">Pipeline</span>
            </h2>
            <p className="text-muted-foreground">From raw data to actionable draft intelligence</p>
          </motion.div>

          {/* Timeline line */}
          <div className="absolute left-[calc(50%-1.5rem)] md:left-[calc(2rem)] top-[12rem] bottom-[4rem] w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent hidden md:block" />

          <div className="space-y-6">
            <PipelineStep
              step="1"
              icon={Database}
              title="Data Ingestion"
              color="bg-orange-500/20 text-orange-400"
              delay={0}
              items={['GRID Esports API', 'Riot Data Dragon', '941 series processed', 'Champion metadata']}
            />
            <PipelineStep
              step="2"
              icon={BarChart3}
              title="Statistical Analysis"
              color="bg-green-500/20 text-green-400"
              delay={0.1}
              items={['Win rates & presence', 'Side analysis', 'Synergy matrices', 'Counter matchups']}
            />
            <PipelineStep
              step="3"
              icon={Search}
              title="Pattern Detection"
              color="bg-amber-500/20 text-amber-400"
              delay={0.2}
              items={['Team draft DNA', 'Comfort picks', 'One-trick alerts', 'Adaptation patterns']}
            />
            <PipelineStep
              step="4"
              icon={Cpu}
              title="ML Prediction"
              color="bg-purple-500/20 text-purple-400"
              delay={0.3}
              items={['XGBoost classifier', 'Feature extraction', 'Temperature scaling', 'Win probability']}
            />
            <PipelineStep
              step="5"
              icon={Zap}
              title="Recommendation Engine"
              color="bg-primary/20 text-primary"
              delay={0.4}
              items={['Multi-signal scoring', 'Confidence ratings', 'Top 5 per action', 'Real-time updates']}
            />
          </div>
        </div>
      </section>

      {/* ═══════ DATA SOURCES ═══════ */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-black text-foreground mb-2">
              Data <span className="text-primary">Sources</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-card-border rounded-xl p-6 hover:border-orange-500/30 transition-colors"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/20 flex items-center justify-center">
                  <Database className="w-7 h-7 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">GRID Esports Data</h3>
                  <p className="text-sm text-muted-foreground">Professional match data provider</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {['Central Data API', 'File Download API', 'Real-time feeds', 'Match timelines'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Flame className="w-3 h-3 text-orange-400 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-card-border rounded-xl p-6 hover:border-blue-500/30 transition-colors"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center">
                  <Target className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Riot Data Dragon</h3>
                  <p className="text-sm text-muted-foreground">Champion assets & metadata</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {['Champion portraits', 'Splash art', 'Ability icons', 'Patch data'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="w-3 h-3 text-blue-400 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 flex justify-center"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-card border border-card-border">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm text-muted-foreground">
                Covering pro play <span className="text-foreground font-semibold">Jan 2024</span> — <span className="text-foreground font-semibold">Sep 2025</span>
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ TECH STACK ═══════ */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-card/40" />

        <div className="relative max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-black text-foreground mb-2">
              Tech <span className="text-primary">Stack</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <TechBadge icon={Server} label="FastAPI" desc="Backend" delay={0} />
            <TechBadge icon={Code2} label="React + TS" desc="Frontend" delay={0.05} />
            <TechBadge icon={Cpu} label="XGBoost" desc="ML Model" delay={0.1} />
            <TechBadge icon={Sparkles} label="Gemini" desc="AI Narrator" delay={0.15} />
            <TechBadge icon={Mic} label="Edge TTS" desc="Voice" delay={0.2} />
            <TechBadge icon={Cloud} label="Vite" desc="Build" delay={0.25} />
          </div>
        </div>
      </section>

      {/* ═══════ CREDITS / FOOTER ═══════ */}
      <section className="relative py-24 px-6 overflow-hidden">
        <GridBG />

        {/* Central glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />

        <motion.div
          className="relative max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/15 border border-primary/30 mb-6"
          >
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold uppercase tracking-[0.15em] text-primary">Hackathon Project</span>
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-3">
            Built for <span className="text-primary">Sky's the Limit</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Cloud9 x JetBrains Hackathon
          </p>

          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-card-border hover:border-primary/50 hover:shadow-[0_0_15px_hsl(var(--primary)/0.15)] transition-all"
              onClick={() => window.open('https://github.com/aniket7r/DraftMind', '_blank')}
            >
              <Github className="w-5 h-5" />
              View on GitHub
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>

          {/* Bottom accent */}
          <motion.div
            className="mt-16 w-32 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mx-auto"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
          />
          <p className="mt-4 text-xs text-muted-foreground/50 uppercase tracking-[0.3em]">
            DraftMind AI v1.0
          </p>
        </motion.div>
      </section>
    </div>
  );
}
