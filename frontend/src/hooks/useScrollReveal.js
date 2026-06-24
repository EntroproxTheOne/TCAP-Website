import { useEffect } from 'react';

export function useScrollReveal() {
  useEffect(() => {
    const faders = document.querySelectorAll('.fade-in-section');
    if (!faders.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    faders.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default useScrollReveal;
