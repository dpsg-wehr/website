import { useState, useEffect } from 'react';
import { IoMdBonfire } from 'react-icons/io';
import { IoSunny } from 'react-icons/io5';

export default function ToggleThemeButton() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark');
        void Promise.resolve().then(() => {
            setTheme(isDark ? 'dark' : 'light');
            setMounted(true);
        });
    }, []);

    const onToggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.setAttribute('data-color-scheme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.setAttribute('data-color-scheme', 'light');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <button
            onClick={onToggleTheme}
            aria-label="Toggle dark mode"
            className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded text-xl text-gray-800 transition-colors duration-200 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-600 ${
                !mounted ? 'invisible' : ''
            }`}
        >
            {mounted && theme === 'dark' ? <IoMdBonfire /> : <IoSunny />}
        </button>
    );
}
