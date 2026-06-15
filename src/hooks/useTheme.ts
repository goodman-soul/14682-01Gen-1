import { useEffect } from 'react';
import { useStoreConfig } from '@/stores/useStoreConfig';
import { themes } from '@/data/mockData';
import type { ThemeConfig } from '@/types';

export function useTheme() {
  const currentStoreId = useStoreConfig((state) => state.currentStoreId);
  const storeConfigs = useStoreConfig((state) => state.storeConfigs);
  const setTheme = useStoreConfig((state) => state.setTheme);

  const currentConfig = storeConfigs[currentStoreId];
  const themeId = currentConfig?.themeId || 'classic-blue';
  const currentTheme: ThemeConfig | undefined = themes.find((t) => t.id === themeId);

  useEffect(() => {
    if (currentTheme) {
      applyThemeToDOM(currentTheme);
    }
  }, [currentStoreId, themeId, currentTheme]);

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
