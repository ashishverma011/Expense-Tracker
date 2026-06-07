import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');
    const toggle = () => {
        setDark(p => {
            localStorage.setItem('theme', !p ? 'dark' : 'light');
            return !p;
        });
    };
    return <ThemeContext.Provider value={{ dark, toggle }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
