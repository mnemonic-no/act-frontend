import { useEffect, useRef } from 'react';

export const useOnResize = (onResizeFn: () => void) => {
  useEffect(() => {
    onResizeFn();

    window.addEventListener('resize', onResizeFn);
    // Cleanup, called when component unmounts
    return () => {
      window.removeEventListener('resize', onResizeFn);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export const usePrevious = <T>(value: T) => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
};
