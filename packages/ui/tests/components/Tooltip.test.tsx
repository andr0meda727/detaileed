import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { Tooltip } from '../../src/components/Tooltip';
import { stubResizeObserver } from './resizeObserverStub';

beforeEach(stubResizeObserver);

describe('Tooltip', () => {
  it('shows on focus, describes the trigger and hides on Escape', async () => {
    render(
      <Tooltip content="Kopiuj link do profilu">
        <button aria-label="Kopiuj">⧉</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'Kopiuj' });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    fireEvent.focus(trigger);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Kopiuj link do profilu');
    expect(trigger).toHaveAccessibleDescription('Kopiuj link do profilu');

    fireEvent.keyDown(trigger, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });
});
