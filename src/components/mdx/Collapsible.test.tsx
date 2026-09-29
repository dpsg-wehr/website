import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Collapsible from './Collapsible';

describe('Collapsible component', () => {
    const label = 'Klick mich';
    const content = 'Geheimer Inhalt';

    it('is closed by default and does not show children', () => {
        render(
            <Collapsible label={label}>
                <div>{content}</div>
            </Collapsible>
        );

        expect(screen.queryByText(content)).not.toBeInTheDocument();
    });

    it('opens and shows children when clicked', async () => {
        const user = userEvent.setup();
        render(
            <Collapsible label={label}>
                <div>{content}</div>
            </Collapsible>
        );

        const toggle = screen.getByText(label);
        await user.click(toggle);

        expect(screen.getByText(content)).toBeInTheDocument();
    });

    it('closes when clicked again', async () => {
        const user = userEvent.setup();
        render(
            <Collapsible label={label}>
                <div>{content}</div>
            </Collapsible>
        );

        const toggle = screen.getByText(label);

        // Open
        await user.click(toggle);
        expect(screen.getByText(content)).toBeInTheDocument();

        // Close
        await user.click(toggle);
        expect(screen.queryByText(content)).not.toBeInTheDocument();
    });
});
