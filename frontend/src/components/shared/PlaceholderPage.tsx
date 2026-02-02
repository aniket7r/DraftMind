import { motion } from 'framer-motion';
import { Swords, BarChart3, Trophy, Search, Info, Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: 'champions' | 'teams' | 'scouting' | 'about';
}

const icons = {
  champions: BarChart3,
  teams: Trophy,
  scouting: Search,
  about: Info,
};

export function PlaceholderPage({ title, description, icon }: PlaceholderPageProps) {
  const Icon = icons[icon];

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="relative inline-block mb-6">
          <div className="w-20 h-20 rounded-2xl bg-card border border-card-border flex items-center justify-center">
            <Icon className="w-10 h-10 text-primary" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-warning flex items-center justify-center">
            <Construction className="w-4 h-4 text-warning-foreground" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-3">{title}</h1>
        <p className="text-muted-foreground mb-8">{description}</p>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-card-border">
          <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
          <span className="text-sm text-muted-foreground">Coming in Phase 2</span>
        </div>
      </motion.div>
    </div>
  );
}
