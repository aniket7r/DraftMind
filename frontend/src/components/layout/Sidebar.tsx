import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, BarChart3, Trophy, Search, Info, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { cn } from '@/lib/utils';
import { useMeta } from '@/hooks/useMeta';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Swords, label: 'Draft Board', path: '/' },
  { icon: BarChart3, label: 'Champions', path: '/champions' },
  { icon: Trophy, label: 'Teams', path: '/teams' },
  { icon: Search, label: 'Scouting', path: '/scouting' },
  { icon: Info, label: 'About', path: '/about' },
];

const TABLET_BREAKPOINT = 1024;

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const location = useLocation();
  const { data: meta } = useMeta();

  // Handle responsive behavior
  useEffect(() => {
    const checkTablet = () => {
      setIsTablet(window.innerWidth < TABLET_BREAKPOINT);
    };
    
    checkTablet();
    window.addEventListener('resize', checkTablet);
    return () => window.removeEventListener('resize', checkTablet);
  }, []);

  // Force collapsed on tablet, allow expand on desktop
  const shouldExpand = isTablet ? false : isExpanded;

  return (
    <motion.aside
      className="fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-50 flex flex-col"
      initial={false}
      animate={{ width: shouldExpand ? 240 : 64 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      onMouseEnter={() => !isTablet && setIsExpanded(true)}
      onMouseLeave={() => !isTablet && setIsExpanded(false)}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border min-h-[64px]">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
          <Logo className="w-8 h-8" />
        </div>
        <AnimatePresence>
          {shouldExpand && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="font-bold text-lg text-foreground whitespace-nowrap"
            >
              DraftMind
              <span className="text-primary ml-1">AI</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    'hover:bg-sidebar-accent',
                    isActive
                      ? 'bg-sidebar-accent text-primary'
                      : 'text-sidebar-foreground hover:text-sidebar-accent-foreground'
                  )}
                  title={isTablet ? item.label : undefined}
                >
                  <item.icon className={cn(
                    'w-5 h-5 flex-shrink-0',
                    isActive ? 'text-primary' : ''
                  )} />
                  <AnimatePresence>
                    {shouldExpand && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                          'font-medium whitespace-nowrap',
                          isActive ? 'text-foreground' : ''
                        )}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer - GRID Stats */}
      <div className="p-3 border-t border-sidebar-border">
        <AnimatePresence>
          {shouldExpand ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-2"
            >
              <p className="text-xs text-muted-foreground">
                Powered by <span className="text-primary font-medium">GRID</span> Esports Data
              </p>
              {meta && (
                <p className="text-xs text-muted-foreground font-mono">
                  {meta.series_count.toLocaleString()} series • {meta.games_count.toLocaleString()} games
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                <span className="text-[8px] font-bold text-primary">G</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expand indicator - only on desktop */}
      {!isTablet && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
          <motion.div
            className="w-5 h-5 rounded-full bg-sidebar-accent border border-sidebar-border flex items-center justify-center cursor-pointer"
            whileHover={{ scale: 1.1 }}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronLeft className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            )}
          </motion.div>
        </div>
      )}
    </motion.aside>
  );
}
