import { useEffect } from 'react';
import { useStoreConfig } from '@/stores/useStoreConfig';
import type { ThemeConfig } from '@/types';

export function useTheme() {
  const themeId = useStoreConfig((state) => state.themeId);
  const getCurrentTheme = useStoreConfig((state) => state.getCurrentTheme);
  const setTheme = useStoreConfig((state) => state.setTheme);

  const currentTheme = getCurrentTheme();

  useEffect(() => {
    if (currentTheme) {
      applyThemeToDOM(currentTheme);
    }
  }, [themeId, currentTheme]);

  return {
    currentTheme,
    setTheme,
  };
}

function applyThemeToDOM(theme: ThemeConfig) {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-primary-hover', theme.colors.primaryHover);
  root.style.setProperty('--color-accent', theme.colors.accent);
  root.style.setProperty('--color-sidebar-bg', theme.colors.sidebarBg);
  root.style.setProperty('--color-sidebar-text', theme.colors.sidebarText);
  root.style.setProperty('--color-header-bg', theme.colors.headerBg);
}
