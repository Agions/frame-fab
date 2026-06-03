/**
 * App-level Provider — composes all root providers.
 */
import React, { ReactNode } from 'react'
import { ThemeProvider } from './ThemeContext'
import { SettingsProvider } from './SettingsContext'

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <SettingsProvider>{children}</SettingsProvider>
    </ThemeProvider>
  )
}

export default AppProvider
