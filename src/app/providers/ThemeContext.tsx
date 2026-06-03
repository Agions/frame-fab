/**
 * Theme Context — canonical implementation
 * Provides theme state (light/dark/system) via React Context.
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
  toggleTheme: () => void
  resolvedTheme: 'light' | 'dark'
  isDarkMode: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export const ThemeProvider: React.FC<{ children: ReactNode; defaultTheme?: Theme }> = ({
  children,
  defaultTheme = 'light',
}) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      setResolvedTheme(mq.matches ? 'dark' : 'light')
    } else {
      setResolvedTheme(theme)
    }
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)
  }, [theme, resolvedTheme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, toggleTheme, resolvedTheme, isDarkMode: resolvedTheme === 'dark' }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return ctx
}

export default ThemeProvider
