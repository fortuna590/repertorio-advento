import { useCallback, useRef, useState } from "react";
import type React from "react";

interface UseCompositionOptions<T extends HTMLElement> {
  onKeyDown?: (e: React.KeyboardEvent<T>) => void;
  onCompositionStart?: (e: React.CompositionEvent<T>) => void;
  onCompositionEnd?: (e: React.CompositionEvent<T>) => void;
}

export function useComposition<T extends HTMLElement = HTMLElement>(
  options?: UseCompositionOptions<T>
) {
  const [isComposing, setIsComposing] = useState(false);
  const composingRef = useRef(false);

  const handleCompositionStart = useCallback(
    (e: React.CompositionEvent<T>) => {
      composingRef.current = true;
      setIsComposing(true);
      options?.onCompositionStart?.(e);
    },
    [options]
  );

  const handleCompositionEnd = useCallback(
    (e: React.CompositionEvent<T>) => {
      composingRef.current = false;
      setIsComposing(false);
      options?.onCompositionEnd?.(e);
    },
    [options]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<T>) => {
      options?.onKeyDown?.(e);
    },
    [options]
  );

  return {
    isComposing,
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
    onKeyDown: handleKeyDown,
  };
}
