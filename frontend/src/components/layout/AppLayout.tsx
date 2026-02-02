import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="h-screen flex w-full overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-16 h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
