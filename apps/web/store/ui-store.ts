import { create } from 'zustand';

interface UiState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
  nodePaletteOpen: boolean;
  configPanelOpen: boolean;
  commandPaletteOpen: boolean;

  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleNodePalette: () => void;
  setConfigPanelOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  theme: 'dark',
  nodePaletteOpen: true,
  configPanelOpen: false,
  commandPaletteOpen: false,

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setTheme: (theme) => set({ theme }),
  toggleNodePalette: () => set((state) => ({ nodePaletteOpen: !state.nodePaletteOpen })),
  setConfigPanelOpen: (open) => set({ configPanelOpen: open }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
}));
