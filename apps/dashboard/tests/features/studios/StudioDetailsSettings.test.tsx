import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ToastProvider } from '@detaileed/ui';
import { StudioScope } from '@/features/studios/model/StudioContext';
import type { StudioDetails } from '@/features/studios/model/studioDetailsForm';

const state = vi.hoisted(() => ({ details: null as StudioDetails | null }));
const mutate = vi.fn();

// No network: the api hooks are replaced, and the map is a button that drops a pin.
vi.mock('@/features/studios/api/studios', () => ({
  useStudioDetails: () => ({ data: state.details, isLoading: false }),
  useSaveStudioDetails: () => ({ mutate, isPending: false }),
}));
vi.mock('@detaileed/ui/map', () => ({
  MapPicker: ({ onChange, readOnly }: { onChange: (p: { lat: number; lng: number }) => void; readOnly?: boolean }) => (
    <button type="button" disabled={readOnly} onClick={() => onChange({ lat: 50.06, lng: 19.94 })}>
      mapa
    </button>
  ),
}));

const { StudioDetailsSettings } = await import('@/features/studios/components/StudioDetailsSettings');

const details: StudioDetails = {
  studioId: 's1',
  name: 'Detail Kraków',
  phone: null,
  email: null,
  address: 'ul. Długa 1',
  city: null,
  latitude: null,
  longitude: null,
  timeZone: 'Europe/Warsaw',
};

const renderAs = (role: string) =>
  render(<StudioDetailsSettings />, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <ToastProvider>
        <StudioScope
          studio={{ studioId: 's1', name: 'Detail Kraków', role, address: 'ul. Długa 1', timeZone: 'Europe/Warsaw' }}
        >
          {children}
        </StudioScope>
      </ToastProvider>
    ),
  });

describe('StudioDetailsSettings', () => {
  beforeEach(() => {
    state.details = details;
    mutate.mockClear();
  });

  it('lets the owner fill in the city and pin and saves the whole set', async () => {
    renderAs('Owner');
    expect(screen.getByDisplayValue('Detail Kraków')).toBeInTheDocument();
    const save = screen.getByRole('button', { name: 'Zapisz dane studia' });
    expect(save).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText('Kraków'), { target: { value: ' Kraków ' } });
    fireEvent.click(await screen.findByRole('button', { name: 'mapa' }));
    fireEvent.click(save);

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        {
          name: 'Detail Kraków',
          phone: null,
          email: null,
          address: 'ul. Długa 1',
          city: 'Kraków',
          latitude: 50.06,
          longitude: 19.94,
        },
        expect.anything(),
      ),
    );
  });

  it('checks the phone before saving', async () => {
    renderAs('Owner');

    fireEvent.change(screen.getByPlaceholderText('500 600 700'), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz dane studia' }));

    expect(await screen.findByText('Podaj poprawny numer, np. 500 600 700')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('lets the owner remove the pin', async () => {
    state.details = { ...details, city: 'Kraków', latitude: 50.06, longitude: 19.94 };
    renderAs('Owner');

    fireEvent.click(screen.getByRole('button', { name: 'Usuń pinezkę' }));
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz dane studia' }));

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        expect.objectContaining({ latitude: null, longitude: null }),
        expect.anything(),
      ),
    );
  });

  it('is read-only for other members', () => {
    renderAs('Employee');
    expect(screen.queryByRole('button', { name: 'Zapisz dane studia' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Usuń pinezkę' })).toBeNull();
    expect(screen.getByDisplayValue('Detail Kraków')).toBeDisabled();
  });
});
