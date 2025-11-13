import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/lib/constants";

type Theme = "light" | "dark" | "system";

interface Modal {
  isOpen: boolean;
  data?: any;
}

interface UIState {
  // Theme
  theme: Theme;
  isDark: boolean;

  // Layout
  sidebarCollapsed: boolean;
  sidebarWidth: number;

  // Modals
  subscriptionModal: Modal;
  categoryModal: Modal;
  tagModal: Modal;
  profileModal: Modal;
  settingsModal: Modal;
  confirmModal: Modal & {
    title?: string;
    message?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  };

  // Loading states
  globalLoading: boolean;
  pageLoading: boolean;
  actionLoading: Record<string, boolean>;

  // Notifications
  notifications: Array<{
    id: string;
    type: "success" | "error" | "info" | "warning";
    title: string;
    message: string;
    duration?: number;
    timestamp: number;
  }>;

  // Filters and search
  searchQuery: string;
  activeFilters: Record<string, any>;

  // Preferences
  compactMode: boolean;
  showOnboarding: boolean;
  animationsEnabled: boolean;
  soundEnabled: boolean;

  // Actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarWidth: (width: number) => void;

  // Modal actions
  openModal: (
    modalName: keyof Pick<
      UIState,
      | "subscriptionModal"
      | "categoryModal"
      | "tagModal"
      | "profileModal"
      | "settingsModal"
    >,
    data?: any,
  ) => void;
  closeModal: (
    modalName: keyof Pick<
      UIState,
      | "subscriptionModal"
      | "categoryModal"
      | "tagModal"
      | "profileModal"
      | "settingsModal"
    >,
  ) => void;
  openConfirmModal: (config: {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
  closeConfirmModal: () => void;

  // Loading actions
  setGlobalLoading: (loading: boolean) => void;
  setPageLoading: (loading: boolean) => void;
  setActionLoading: (action: string, loading: boolean) => void;

  // Notification actions
  addNotification: (
    notification: Omit<UIState["notifications"][0], "id" | "timestamp">,
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Search and filter actions
  setSearchQuery: (query: string) => void;
  setFilter: (key: string, value: any) => void;
  clearFilters: () => void;

  // Preference actions
  setCompactMode: (compact: boolean) => void;
  setShowOnboarding: (show: boolean) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;

  // Utility actions
  resetUI: () => void;
}

const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const applyTheme = (theme: Theme) => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const actualIsDark =
    theme === "system" ? getSystemTheme() === "dark" : theme === "dark";

  if (actualIsDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  return actualIsDark;
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: "system",
      isDark: false,

      // Layout
      sidebarCollapsed: false,
      sidebarWidth: 256,

      // Modals
      subscriptionModal: { isOpen: false },
      categoryModal: { isOpen: false },
      tagModal: { isOpen: false },
      profileModal: { isOpen: false },
      settingsModal: { isOpen: false },
      confirmModal: { isOpen: false },

      // Loading states
      globalLoading: false,
      pageLoading: false,
      actionLoading: {},

      // Notifications
      notifications: [],

      // Filters and search
      searchQuery: "",
      activeFilters: {},

      // Preferences
      compactMode: false,
      showOnboarding: true,
      animationsEnabled: true,
      soundEnabled: true,

      // Theme actions
      setTheme: (theme: Theme) => {
        const isDark = applyTheme(theme);
        set({ theme, isDark });

        // Listen for system theme changes if theme is 'system'
        if (theme === "system") {
          const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
          const handleChange = () => {
            const newIsDark = applyTheme("system");
            set({ isDark: newIsDark });
          };

          mediaQuery.addEventListener("change", handleChange);

          // Clean up previous listeners if any
          return () => mediaQuery.removeEventListener("change", handleChange);
        }
      },

      toggleTheme: () => {
        const { theme } = get();
        const newTheme =
          theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
        get().setTheme(newTheme);
      },

      // Sidebar actions
      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },

      setSidebarWidth: (width: number) => {
        set({ sidebarWidth: width });
      },

      // Modal actions
      openModal: (modalName, data) => {
        set(() => ({
          [modalName]: { isOpen: true, data },
        }));
      },

      closeModal: (modalName) => {
        set(() => ({
          [modalName]: { isOpen: false, data: undefined },
        }));
      },

      openConfirmModal: (config) => {
        set({
          confirmModal: {
            isOpen: true,
            title: config.title,
            message: config.message,
            onConfirm: config.onConfirm,
            onCancel: config.onCancel,
          },
        });
      },

      closeConfirmModal: () => {
        set({
          confirmModal: {
            isOpen: false,
            title: undefined,
            message: undefined,
            onConfirm: undefined,
            onCancel: undefined,
          },
        });
      },

      // Loading actions
      setGlobalLoading: (loading: boolean) => {
        set({ globalLoading: loading });
      },

      setPageLoading: (loading: boolean) => {
        set({ pageLoading: loading });
      },

      setActionLoading: (action: string, loading: boolean) => {
        set((state) => ({
          actionLoading: {
            ...state.actionLoading,
            [action]: loading,
          },
        }));
      },

      // Notification actions
      addNotification: (notification) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newNotification = {
          ...notification,
          id,
          timestamp: Date.now(),
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 10), // Keep only 10 notifications
        }));

        // Auto-remove notification after duration
        if (notification.duration !== 0) {
          const duration = notification.duration || 5000;
          setTimeout(() => {
            get().removeNotification(id);
          }, duration);
        }
      },

      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      // Search and filter actions
      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      setFilter: (key: string, value: any) => {
        set((state) => ({
          activeFilters: {
            ...state.activeFilters,
            [key]: value,
          },
        }));
      },

      clearFilters: () => {
        set({ activeFilters: {}, searchQuery: "" });
      },

      // Preference actions
      setCompactMode: (compact: boolean) => {
        set({ compactMode: compact });
      },

      setShowOnboarding: (show: boolean) => {
        set({ showOnboarding: show });
      },

      setAnimationsEnabled: (enabled: boolean) => {
        set({ animationsEnabled: enabled });

        // Apply CSS class to control animations
        if (typeof document !== "undefined") {
          if (enabled) {
            document.documentElement.classList.remove("reduce-motion");
          } else {
            document.documentElement.classList.add("reduce-motion");
          }
        }
      },

      setSoundEnabled: (enabled: boolean) => {
        set({ soundEnabled: enabled });
      },

      // Utility actions
      resetUI: () => {
        set({
          searchQuery: "",
          activeFilters: {},
          notifications: [],
          globalLoading: false,
          pageLoading: false,
          actionLoading: {},
          subscriptionModal: { isOpen: false },
          categoryModal: { isOpen: false },
          tagModal: { isOpen: false },
          profileModal: { isOpen: false },
          settingsModal: { isOpen: false },
          confirmModal: { isOpen: false },
        });
      },
    }),
    {
      name: STORAGE_KEYS.preferences,
      partialize: (state) => ({
        // Only persist certain UI preferences
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        sidebarWidth: state.sidebarWidth,
        compactMode: state.compactMode,
        showOnboarding: state.showOnboarding,
        animationsEnabled: state.animationsEnabled,
        soundEnabled: state.soundEnabled,
        activeFilters: state.activeFilters,
      }),
      version: 1,
      onRehydrateStorage: () => (state) => {
        // Apply theme after rehydration
        if (state?.theme) {
          const isDark = applyTheme(state.theme);
          state.isDark = isDark ?? false;
        }

        // Apply animations setting
        if (state && typeof document !== "undefined") {
          if (!state.animationsEnabled) {
            document.documentElement.classList.add("reduce-motion");
          }
        }
      },
    },
  ),
);

// Selectors for easier access to specific state
export const useTheme = () =>
  useUIStore((state) => ({ theme: state.theme, isDark: state.isDark }));
export const useSidebar = () =>
  useUIStore((state) => ({
    collapsed: state.sidebarCollapsed,
    width: state.sidebarWidth,
  }));
export const useModals = () =>
  useUIStore((state) => ({
    subscription: state.subscriptionModal,
    category: state.categoryModal,
    tag: state.tagModal,
    profile: state.profileModal,
    settings: state.settingsModal,
    confirm: state.confirmModal,
  }));
export const useLoading = () =>
  useUIStore((state) => ({
    global: state.globalLoading,
    page: state.pageLoading,
    action: state.actionLoading,
  }));
export const useNotifications = () =>
  useUIStore((state) => state.notifications);
export const useSearch = () =>
  useUIStore((state) => ({
    query: state.searchQuery,
    filters: state.activeFilters,
  }));
export const usePreferences = () =>
  useUIStore((state) => ({
    compact: state.compactMode,
    onboarding: state.showOnboarding,
    animations: state.animationsEnabled,
    sound: state.soundEnabled,
  }));

// Helper hooks for actions
export const useUIActions = () => {
  const store = useUIStore();
  return {
    setTheme: store.setTheme,
    toggleTheme: store.toggleTheme,
    toggleSidebar: store.toggleSidebar,
    openModal: store.openModal,
    closeModal: store.closeModal,
    openConfirmModal: store.openConfirmModal,
    closeConfirmModal: store.closeConfirmModal,
    setGlobalLoading: store.setGlobalLoading,
    setPageLoading: store.setPageLoading,
    setActionLoading: store.setActionLoading,
    addNotification: store.addNotification,
    removeNotification: store.removeNotification,
    clearNotifications: store.clearNotifications,
    setSearchQuery: store.setSearchQuery,
    setFilter: store.setFilter,
    clearFilters: store.clearFilters,
    resetUI: store.resetUI,
  };
};

export default useUIStore;
