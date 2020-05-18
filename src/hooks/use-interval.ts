import { useEffect } from "react";

export const useInterval = (callback: Function, delay?: number | null) => {
  useEffect(() => {
    if (delay !== null) {
      const interval = setInterval(() => callback(), delay || 0);
      return () => clearInterval(interval);
    }

    return undefined;
  }, [delay, callback]);
};
