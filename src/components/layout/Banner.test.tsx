import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Banner from './Banner';

const mockStorage: Record<string, string> = {};

const localStorageMock = {
    getItem: vi.fn((key: string) => mockStorage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
    }),
    clear: vi.fn(() => {
        for (const key in mockStorage) {
            delete mockStorage[key];
        }
    }),
    length: 0,
    key: vi.fn(() => null),
};

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
});

describe('Banner component', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders banner when valid and not expired', () => {
        vi.setSystemTime(new Date('2026-09-01T12:00:00Z'));

        render(
            <Banner
                banner={{
                    id: 'test-banner',
                    text: 'Test Announcement',
                    link: '/posts/scoutcastle',
                    until: '2026-09-13T23:59:59+02:00',
                    badge: 'Aktion',
                }}
            />
        );

        expect(screen.getByText('Test Announcement')).toBeInTheDocument();
        expect(screen.getByText('Aktion')).toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', '/posts/scoutcastle');
    });

    it('does not render banner when expired', () => {
        vi.setSystemTime(new Date('2026-09-14T00:00:01Z'));

        const { container } = render(
            <Banner
                banner={{
                    id: 'test-banner',
                    text: 'Test Announcement',
                    link: '/posts/scoutcastle',
                    until: '2026-09-13T23:59:59+02:00',
                }}
            />
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('hides banner when dismissed and persists to localStorage', () => {
        vi.setSystemTime(new Date('2026-09-01T12:00:00Z'));

        render(
            <Banner
                banner={{
                    id: 'test-banner-1',
                    text: 'Test Announcement',
                    link: '/posts/scoutcastle',
                    until: '2026-09-13T23:59:59+02:00',
                }}
            />
        );

        const closeButton = screen.getByRole('button', { name: /hinweis schließen/i });
        fireEvent.click(closeButton);

        expect(screen.queryByText('Test Announcement')).not.toBeInTheDocument();
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            'dpsg-banner-dismissed-test-banner-1',
            'true'
        );
    });
});
