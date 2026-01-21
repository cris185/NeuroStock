import { useState, useEffect } from 'react';

/**
 * Custom hook for detecting scroll position and direction
 * Optimized with requestAnimationFrame for 60fps performance
 *
 * @param {number} threshold - Scroll position in pixels to trigger isScrolled state
 * @returns {{ isScrolled: boolean, scrollDirection: 'up' | 'down' }}
 */
export const useScrollBehavior = (threshold = 20) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState('up');
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Determine scroll direction
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up');
      }

      // Trigger scrolled state after threshold
      setIsScrolled(currentScrollY > threshold);
      setLastScrollY(currentScrollY);
    };

    // Throttle with requestAnimationFrame for performance
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Use passive listener for better scroll performance
    window.addEventListener('scroll', scrollListener, { passive: true });

    // Cleanup
    return () => window.removeEventListener('scroll', scrollListener);
  }, [lastScrollY, threshold]);

  return { isScrolled, scrollDirection };
};
