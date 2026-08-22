// src/hooks/useSubmitGuard.ts
import { useRef, useState, useCallback } from 'react';

export function useSubmitGuard<Args extends any[]>(
  fn: (...args: Args) => Promise<void> | void
) {
  const isSubmittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const guardedFn = useCallback(async (...args: Args) => {
    if (isSubmittingRef.current) return; // trava síncrona, bloqueia o 2º clique na hora
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      await fn(...args);
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [fn]);

  return [guardedFn, isSubmitting] as const;
}