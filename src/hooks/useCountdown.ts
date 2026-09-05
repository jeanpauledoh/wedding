import { useEffect, useState } from 'react';

export type TimeRemaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getRemaining(target: number): TimeRemaining {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000)
  };
}

export function useCountdown(targetDate: string | Date): TimeRemaining {
  const target = new Date(targetDate).getTime();
  const [remaining, setRemaining] = useState<TimeRemaining>(() => getRemaining(target));

  useEffect(() => {
    const id = window.setInterval(() => setRemaining(getRemaining(target)), 1000);
    return () => window.clearInterval(id);
  }, [target]);

  return remaining;
}