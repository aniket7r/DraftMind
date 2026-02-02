import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt="DraftMind AI"
      className={cn('object-contain', className)}
    />
  );
}
