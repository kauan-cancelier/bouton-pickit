import { useState, useEffect, useRef } from 'react';

export function useTimer(initialTime: number = 0, persistKey?: string) {
  const [time, setTime] = useState(() => {
    if (persistKey) {
      const stored = localStorage.getItem(persistKey);
      return stored ? Number(stored) : initialTime;
    }
    return initialTime;
  });
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number>();

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime + 1;
          if (persistKey) {
            localStorage.setItem(persistKey, String(newTime));
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, persistKey]);

  const start = () => setIsRunning(true);
  const stop = () => setIsRunning(false);
  const reset = () => {
    setTime(0);
    if (persistKey) localStorage.setItem(persistKey, "0");
    setIsRunning(false);
  };

  return { time, isRunning, start, stop, reset };
}
