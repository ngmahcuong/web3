import { useEffect, useMemo, useState } from 'react';
import { isPast } from '../utils/times';
import useInterval from './useInterval';

export type RemainingTime = {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
};

export const useCountdown = (to: number) => {
  // if (to === undefined) {
  //   return {
  //     started: true,
  //     remaining: {}
  //   }
  // }
  const [distance, setDistance] = useState(0);
  const [started, setStarted] = useState<boolean>(isPast(to));

  useEffect(() => {
    setStarted(isPast(to))
  }, [to])

  const remaining: RemainingTime = useMemo(() => {
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    return {
      days,
      hours,
      minutes,
      seconds,
    };
  }, [distance]);

  useInterval(
    () => {
      const _distance = to * 1000 - Date.now();
      setDistance(_distance);
      if (_distance <= 0) {
        setStarted(true);
      }
    },
    1000,
    to,
  );

  return useMemo(() => {
    return {
      started,
      remaining,
    };
  }, [remaining, started]);
};
