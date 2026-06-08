import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  getEffectiveTheme: () => 'light' | 'dark'
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: (localStorage.getItem('flowblock-theme') as Theme) || 'system',

  setTheme: (theme) => {
    localStorage.setItem('flowblock-theme', theme)
    set({ theme })
    applyTheme(theme)
  },

  getEffectiveTheme: () => {
    const { theme } = get()
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme
  }
}))

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', isDark)
  } else {
    root.classList.toggle('dark', theme === 'dark')
  }
}

export function initTheme() {
  const theme = (localStorage.getItem('flowblock-theme') as Theme) || 'system'
  applyTheme(theme)

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const current = useThemeStore.getState().theme
    if (current === 'system') {
      applyTheme('system')
    }
  })
}
