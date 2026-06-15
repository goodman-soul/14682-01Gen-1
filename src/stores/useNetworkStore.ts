import { create } from 'zustand';
import type { NetworkState } from '@/types';

interface NetworkStoreState extends NetworkState {
  toggleOnline: () => void;
  setOnline: (online: boolean) => void;
  incrementPendingSync: () => void;
  decrementPendingSync: () => void;
  resetPendingSync: () => void;
}

export const useNetworkStore = create<NetworkStoreState>((set, get) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  lastOnlineTime: Date.now(),
  pendingSyncCount: 0,
  toggleOnline: () => {
    const { isOnline } = get();
    set({
      isOnline: !isOnline,
      lastOnlineTime: !isOnline ? Date.now() : get().lastOnlineTime,
    });
  },
  setOnline: (online: boolean) => {
    const { isOnline } = get();
    if (isOnline !== online) {
      set({
        isOnline: online,
        lastOnlineTime: online ? Date.now() : get().lastOnlineTime,
      });
    }
  },
  incrementPendingSync: () =>
    set((state) => ({ pendingSyncCount: state.pendingSyncCount + 1 })),
  decrementPendingSync: () =>
    set((state) => ({
      pendingSyncCount: Math.max(0, state.pendingSyncCount - 1),
    })),
  resetPendingSync: () => set({ pendingSyncCount: 0 }),
}));
