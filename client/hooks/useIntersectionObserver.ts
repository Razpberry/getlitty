import { useEffect, useState, useRef } from 'react';

const useIntersectionObserver = (options: IntersectionObserverInit) => {
  const [element, setElement] = useState<Element | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    if (element) {
      observer.current.observe(element);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [element, options]);

  return [setElement, isVisible] as const;
};

export default useIntersectionObserver;
