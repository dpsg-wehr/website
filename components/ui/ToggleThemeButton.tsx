'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

import { IoSunny } from 'react-icons/io5';
import { IoMdBonfire } from 'react-icons/io';

const emptySubscribe = () => () => {};

export default function ToggleThemeButton() {
    const hasMounted = useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false
    );
    const { systemTheme, theme, setTheme } = useTheme();
    const currentTheme = theme === 'system' ? systemTheme : theme;

    const onToggleTheme = () => (currentTheme === 'dark' ? setTheme('light') : setTheme('dark'));

    return (
        <button
            onClick={onToggleTheme}
            aria-label="Toggle dark mode"
            className={`cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 dark:text-white text-gray-800 w-10 h-10 flex items-center justify-center rounded text-xl ${!hasMounted && 'hidden'}`}
        >
            {hasMounted && currentTheme == 'dark' ? <IoMdBonfire /> : <IoSunny />}
        </button>
    );
}
