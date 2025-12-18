import { useEffect } from 'react';

type KeyCombo = {
    key: string;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean; // Command key on Mac
    action: () => void;
};

export const useKeyboardShortcuts = (shortcuts: KeyCombo[]) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Ignore if inside an input or textarea (unless it's a special function key like F1-F12)
            const target = event.target as HTMLElement;
            const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

            // Allow F-keys even in inputs, but block letters/numbers
            if (isInput && event.key && !event.key.startsWith('F') && event.key !== 'Escape') {
                return;
            }

            shortcuts.forEach((shortcut) => {
                if (
                    event.key && event.key.toLowerCase() === shortcut.key.toLowerCase() &&
                    !!event.ctrlKey === !!shortcut.ctrl &&
                    !!event.altKey === !!shortcut.alt &&
                    !!event.shiftKey === !!shortcut.shift &&
                    !!event.metaKey === !!shortcut.meta
                ) {
                    event.preventDefault();
                    shortcut.action();
                }
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
};
