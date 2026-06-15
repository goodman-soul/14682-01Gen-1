import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoreConfig, QuickAction, ThemeConfig } from '@/types';
import { defaultStoreConfig, themes } from '@/data/mockData';

interface StoreConfigState extends StoreConfig {
  setTheme: (themeId: string) => void;
  setQuickActions: (actions: QuickAction[]) => void;
  setDefaultHomepage: (route: string) => void;
  setStoreName: (name: string) => void;
  getCurrentTheme: () => ThemeConfig | undefined;
}

export const useStoreConfig = create<StoreConfigState>()(
  persist(
    (set, get) => ({
      ...defaultStoreConfig,
      setTheme: (themeId: string) => set({ themeId }),
      setQuickActions: (quickActions: QuickAction[]) => set({ quickActions }),
      setDefaultHomepage: (defaultHomepage: string) => set({ defaultHomepage }),
      setStoreName: (storeName: string) => set({ storeName }),
      getCurrentTheme: () => {
        const { themeId } = get();
        return themes.find((t) => t.id === themeId);
      },
    }),
    {
      name: 'store-config',
    }
  )
);
