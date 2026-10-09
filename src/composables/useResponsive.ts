import { ref, onMounted, onUnmounted } from 'vue';

export function useResponsive() {
  const isMobile = ref(false);

  function check(): boolean {
    if (typeof window === 'undefined') return false;
    // Matches portrait mobile (<1024px) AND landscape mobile (e.g. iPhone 16 landscape: 852 x 393px, height <= 560px)
    return window.innerWidth < 1024 || window.innerHeight <= 560;
  }

  function update() {
    isMobile.value = check();
  }

  onMounted(() => {
    update();
    window.addEventListener('resize', update, { passive: true });
    window.addEventListener('orientationchange', update, { passive: true });
  });

  onUnmounted(() => {
    window.removeEventListener('resize', update);
    window.removeEventListener('orientationchange', update);
  });

  return {
    isMobile
  };
}
