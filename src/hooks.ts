import { useEffect, useRef } from 'react';

export const useOnResize = (onResizeFn: () => void) => {
  useEffect(() => {
    onResizeFn();

    window.addEventListener('resize', onResizeFn);
    // Cleanup, called when component unmounts
    return () => {
      window.removeEventListener('resize', onResizeFn);
    };
  });

  return null;
};

export const usePrevious = (value: any) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
};
