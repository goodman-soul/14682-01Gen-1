import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoreConfig, QuickAction, ThemeConfig } from '@/types';
import { defaultStoreConfig, themes, storeList } from '@/data/mockData';

function buildInitialStoreConfigs(): Record<string, StoreConfig> {
  const configs: Record<string, StoreConfig> = {};
  const themeMapping: Record<string, string> = {
    'store-001': 'classic-blue',
    'store-002': 'warm-orange',
    'store-003': 'fresh-green',
    'store-004': 'elegant-dark',
  };
  storeList.forEach((store) => {
    configs[store.storeId] = {
      storeId: store.storeId,
      storeName: store.storeName,
      themeId: themeMapping[store.storeId] || 'classic-blue',
      quickActions: defaultStoreConfig.quickActions.map((qa) => ({ ...qa })),
      defaultHomepage: store.storeId === 'store-002' ? '/dashboard' : '/cashier',
    };
  });
  return configs;
}

interface StoreConfigState {
  currentStoreId: string;
  storeConfigs: Record<string, StoreConfig>;
  switchStore: (storeId: string) => void;
  setTheme: (themeId: string) => void;
  setQuickActions: (actions: QuickAction[]) => void;
  setDefaultHomepage: (route: string) => void;
  setStoreName: (name: string) => void;
  getCurrentConfig: () => StoreConfig;
  getCurrentTheme: () => ThemeConfig | undefined;
}

export const useStoreConfig = create<StoreConfigState>()(
  persist(
    (set, get) => ({
      currentStoreId: defaultStoreConfig.storeId,
      storeConfigs: buildInitialStoreConfigs(),
      switchStore: (storeId: string) => set({ currentStoreId: storeId }),
      setTheme: (themeId: string) => {
        const { currentStoreId, storeConfigs } = get();
        const current = storeConfigs[currentStoreId];
        if (!current) return;
        set({
          storeConfigs: {
            ...storeConfigs,
            [currentStoreId]: { ...current, themeId },
          },
        });
      },
      setQuickActions: (quickActions: QuickAction[]) => {
        const { currentStoreId, storeConfigs } = get();
        const current = storeConfigs[currentStoreId];
        if (!current) return;
        set({
          storeConfigs: {
            ...storeConfigs,
            [currentStoreId]: { ...current, quickActions },
          },
        });
      },
      setDefaultHomepage: (defaultHomepage: string) => {
        const { currentStoreId, storeConfigs } = get();
        const current = storeConfigs[currentStoreId];
        if (!current) return;
        set({
          storeConfigs: {
            ...storeConfigs,
            [currentStoreId]: { ...current, defaultHomepage },
          },
        });
      },
      setStoreName: (storeName: string) => {
        const { currentStoreId, storeConfigs } = get();
        const current = storeConfigs[currentStoreId];
        if (!current) return;
        set({
          storeConfigs: {
            ...storeConfigs,
            [currentStoreId]: { ...current, storeName },
          },
        });
      },
      getCurrentConfig: () => {
        const { currentStoreId, storeConfigs } = get();
        return (
          storeConfigs[currentStoreId] || {
            ...defaultStoreConfig,
            storeId: currentStoreId,
          }
        );
      },
      getCurrentTheme: () => {
        const config = get().getCurrentConfig();
        return themes.find((t) => t.id === config.themeId);
      },
    }),
    {
      name: 'store-config',
      version: 1,
      migrate: (persistedState: any, version) => {
        if (version === 0 || !persistedState?.storeConfigs) {
          const freshStoreConfigs = buildInitialStoreConfigs();
          if (persistedState?.themeId && persistedState?.storeId) {
            freshStoreConfigs[persistedState.storeId] = {
              storeId: persistedState.storeId,
              storeName: persistedState.storeName || freshStoreConfigs[persistedState.storeId].storeName,
              themeId: persistedState.themeId || freshStoreConfigs[persistedState.storeId].themeId,
              quickActions: persistedState.quickActions || freshStoreConfigs[persistedState.storeId].quickActions,
              defaultHomepage: persistedState.defaultHomepage || freshStoreConfigs[persistedState.storeId].defaultHomepage,
            };
          }
          return {
            currentStoreId: persistedState?.currentStoreId || persistedState?.storeId || defaultStoreConfig.storeId,
            storeConfigs: freshStoreConfigs,
          };
        }
        const merged = { ...persistedState };
        if (!merged.storeConfigs) {
          merged.storeConfigs = buildInitialStoreConfigs();
        } else {
          const fresh = buildInitialStoreConfigs();
          Object.keys(fresh).forEach((sid) => {
            if (!merged.storeConfigs[sid]) {
              merged.storeConfigs[sid] = fresh[sid];
            } else {
              if (!merged.storeConfigs[sid].quickActions?.length) {
                merged.storeConfigs[sid].quickActions = fresh[sid].quickActions;
              }
              if (!merged.storeConfigs[sid].defaultHomepage) {
                merged.storeConfigs[sid].defaultHomepage = fresh[sid].defaultHomepage;
              }
              if (!merged.storeConfigs[sid].themeId) {
                merged.storeConfigs[sid].themeId = fresh[sid].themeId;
              }
            }
          });
        }
        if (!merged.currentStoreId) {
          merged.currentStoreId = defaultStoreConfig.storeId;
        }
        return merged;
      },
    }
  )
);
