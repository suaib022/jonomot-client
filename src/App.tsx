import { useEffect } from 'react';
import MainLayout from './components/layout/MainLayout';
import Lenis from 'lenis';

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <MainLayout />
  );
}

export default App;
