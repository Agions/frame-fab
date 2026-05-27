import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const applyTheme = useCallback((dark: boolean) => {
    const rootElement = document.documentElement;

    if (dark) {
      rootElement.classList.add('dark-theme', 'dark');
      document.body.style.backgroundColor = '#141414';
      document.body.style.color = 'rgba(255, 255, 255, 0.85)';

      rootElement.style.setProperty('--text-color-primary', 'rgba(255, 255, 255, 0.85)');
      rootElement.style.setProperty('--text-color-secondary', 'rgba(255, 255, 255, 0.65)');
      rootElement.style.setProperty('--text-color-disabled', 'rgba(255, 255, 255, 0.35)');
      rootElement.style.setProperty('--bg-color-primary', '#141414');
      rootElement.style.setProperty('--bg-color-secondary', '#1f1f1f');
      rootElement.style.setProperty('--bg-color-component', '#1f1f1f');
      rootElement.style.setProperty('--border-color', '#303030');
      rootElement.style.setProperty('--form-label-color', 'rgba(255, 255, 255, 0.85)');

      // Fix form label color in dark mode (antd legacy)
      document.body
        .querySelectorAll('.ant-form-item-label > label')
        .forEach((el) => ((el as HTMLElement).style.color = 'rgba(255, 255, 255, 0.85)'));
    } else {
      rootElement.classList.remove('dark-theme', 'dark');
      document.body.style.backgroundColor = '#fff';
      document.body.style.color = 'rgba(0, 0, 0, 0.85)';

      rootElement.style.setProperty('--text-color-primary', 'rgba(0, 0, 0, 0.85)');
      rootElement.style.setProperty('--text-color-secondary', 'rgba(0, 0, 0, 0.65)');
      rootElement.style.setProperty('--text-color-disabled', 'rgba(0, 0, 0, 0.35)');
      rootElement.style.setProperty('--bg-color-primary', '#ffffff');
      rootElement.style.setProperty('--bg-color-secondary', '#f0f2f5');
      rootElement.style.setProperty('--bg-color-component', '#ffffff');
      rootElement.style.setProperty('--border-color', '#d9d9d9');
      rootElement.style.setProperty('--form-label-color', 'rgba(0, 0, 0, 0.85)');

      // Reset form label color (antd legacy)
      document.body
        .querySelectorAll('.ant-form-item-label > label')
        .forEach((el) => ((el as HTMLElement).style.color = ''));
    }
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDarkMode = savedTheme ? savedTheme === 'dark' : prefersDark;

    const id = setTimeout(() => {
      setIsDarkMode(initialDarkMode);
      applyTheme(initialDarkMode);
    }, 0);
    void id;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (savedTheme === null) {
        setIsDarkMode(e.matches);
        applyTheme(e.matches);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    applyTheme(newDarkMode);
  }, [isDarkMode, applyTheme]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;