import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ToastProvider } from '@detaileed/ui';

const mutateAsync = vi.fn();

// No network: only the mutation hook is replaced.
vi.mock('@/features/studios/api/studios', () => ({
  useCreateStudio: () => ({ mutateAsync, isPending: false }),
}));

const { CreateStudioModal } = await import('@/features/studios/components/CreateStudioModal');

const renderModal = (canClose: boolean) => {
  const onClose = vi.fn();
  const onSuccess = vi.fn();
  render(
    <ToastProvider>
      <CreateStudioModal isOpen onClose={onClose} onSuccess={onSuccess} canClose={canClose} />
    </ToastProvider>,
  );
  return { onClose, onSuccess };
};

describe('CreateStudioModal', () => {
  afterEach(() => vi.clearAllMocks());

  it('creates the studio with trimmed details', async () => {
    const studio = { studioId: 's2', name: 'Auto Spa', role: 'Owner' };
    mutateAsync.mockResolvedValue(studio);
    const { onSuccess } = renderModal(true);

    fireEvent.change(screen.getByLabelText('Nazwa studia'), { target: { value: ' Auto Spa ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Utwórz studio' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(studio));
    expect(mutateAsync).toHaveBeenCalledWith({ name: 'Auto Spa', address: null, phone: null, email: null });
  });

  it('requires a name', async () => {
    renderModal(true);
    fireEvent.click(screen.getByRole('button', { name: 'Utwórz studio' }));
    expect(await screen.findByText('Nazwa studia jest wymagana')).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('can be closed when the user already has a studio', () => {
    const { onClose } = renderModal(true);
    fireEvent.click(screen.getByRole('button', { name: 'Anuluj' }));
    fireEvent.click(screen.getByRole('button', { name: 'Zamknij' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('cannot be closed during onboarding', () => {
    const { onClose } = renderModal(false);
    expect(screen.getByText(/skonfiguruj swoje pierwsze studio/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Zamknij' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Anuluj' })).not.toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });
});
