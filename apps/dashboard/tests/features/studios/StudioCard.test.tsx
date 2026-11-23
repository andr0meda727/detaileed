import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { NewStudioCard, StudioCard } from '@/features/studios/components/select/StudioCard';
import type { Studio } from '@/features/studios/model/types';

const studio = { studioId: 's1', name: 'Auto Spa', address: 'ul. Długa 1, Kraków', role: 'Manager' } as Studio;

const renderCard = (props: Partial<React.ComponentProps<typeof StudioCard>> = {}) => {
  const onSelect = vi.fn();
  render(
    <StudioCard studio={studio} isActive={false} isSelecting={false} isDimmed={false} onSelect={onSelect} {...props} />,
  );
  return onSelect;
};

describe('StudioCard', () => {
  it('shows the role, name and address and picks the studio', () => {
    const onSelect = renderCard();
    expect(screen.getByText('Menedżer')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Auto Spa' })).toBeInTheDocument();
    expect(screen.getByText('ul. Długa 1, Kraków')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalled();
  });

  it('marks the last used studio and falls back to the raw role name', () => {
    renderCard({ isActive: true, studio: { ...studio, role: 'Detailer', address: null } as Studio });
    expect(screen.getByRole('button')).toHaveAttribute('aria-current', 'true');
    expect(screen.getByText('Aktualnie wybrane')).toBeInTheDocument();
    expect(screen.getByText('Detailer')).toBeInTheDocument();
    expect(screen.getByText('Brak adresu')).toBeInTheDocument();
  });

  it('cannot be picked while another studio opens', () => {
    renderCard({ isDimmed: true });
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

describe('NewStudioCard', () => {
  it('opens the new studio form', () => {
    const onClick = vi.fn();
    render(<NewStudioCard onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: /Nowe studio/ }));
    expect(onClick).toHaveBeenCalled();
  });
});
