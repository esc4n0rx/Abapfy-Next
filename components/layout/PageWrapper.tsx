'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Loading } from './Loading';

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => {
      // Simulate a short delay for visual feedback
      setTimeout(() => setIsLoading(false), 500);
    };

    // We are faking a loading state on route change.
    // In a real app, you'd use router events if available and needed.
    handleStart();
    handleComplete();

  }, [pathname]);

  return (
    <>
      {isLoading && <Loading />}
      {children}
    </>
  );
}
