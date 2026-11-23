import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Sidebar } from '@/app/layout/Sidebar';

const studios = [
  {
    studioId: 'owned',
    name: 'Połysk Detailing',
    role: 'Owner',
    address: 'Warszawa, Mokotów',
    timeZone: 'Europe/Warsaw',
  },
  { studioId: 'staff', name: 'Lśnij', role: 'Employee', address: null, timeZone: 'Europe/Warsaw' },
];
const state = vi.hoisted(() => ({ studioIndex: 0, pending: 3 as number | undefined }));

vi.mock('@/features/studios', () => ({
  useStudio: () => ({ selectedStudio: studios[state.studioIndex] }),
  useStudios: () => ({ data: studios }),
}));
vi.mock('@/features/booking-requests', () => ({
  usePendingRequestsCount: () => ({ data: state.pending }),
}));

beforeEach(() => {
  state.studioIndex = 0;
  state.pending = 3;
  // jsdom has no ResizeObserver; Radix menus measure their trigger with one.
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

function renderSidebar(path = '/s/owned/tasks', props: Partial<React.ComponentProps<typeof Sidebar>> = {}) {
  const onLogout = vi.fn();
  const rootRoute = createRootRoute({
    component: () => (
      <Sidebar
        studioId={state.studioIndex === 0 ? 'owned' : 'staff'}
        onLogout={onLogout}
        userEmail="a@b.pl"
        {...props}
      />
    ),
  });
  const router = createRouter({ routeTree: rootRoute, history: createMemoryHistory({ initialEntries: [path] }) });
  render(<RouterProvider router={router} />);
  return { onLogout, router };
}

function openMenu(trigger: HTMLElement) {
  fireEvent.keyDown(trigger, { key: 'Enter' });
  return screen.findByRole('menu');
}

describe('Sidebar', () => {
  it('lists the studio screens and marks the current one', async () => {
    renderSidebar();
    const nav = await screen.findByRole('navigation', { name: 'Studio' });
    const links = within(nav).getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual([
      'Panel główny',
      'Rezerwacje',
      'Zapytania3',
      'Grafik',
      'Klienci',
      'Zespół',
      'Magazyn',
      'Raporty',
    ]);
    expect(within(nav).getByRole('link', { name: 'Rezerwacje' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: /Panel główny/ })).not.toHaveAttribute('aria-current');
    expect(screen.getByLabelText('3 oczekujących')).toBeInTheDocument();
  });

  it('hides the team screen from employees and the badge when nothing is pending', async () => {
    state.studioIndex = 1;
    state.pending = 0;
    renderSidebar('/s/staff');
    const nav = await screen.findByRole('navigation', { name: 'Studio' });
    expect(within(nav).queryByRole('link', { name: 'Zespół' })).not.toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Zapytania' })).toBeInTheDocument();
  });

  it('switches studios and links to the studio list', async () => {
    const { router } = renderSidebar();
    const menu = await openMenu(await screen.findByRole('button', { name: /Studio: Połysk Detailing/ }));
    expect(within(menu).getByRole('menuitem', { name: 'Połysk Detailing' })).toHaveAttribute('aria-current', 'true');
    expect(within(menu).getByRole('menuitem', { name: 'Wszystkie studia' })).toBeInTheDocument();
    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Lśnij' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/s/staff'));
  });

  it('offers the theme, the account and signing out in the user menu', async () => {
    const { onLogout } = renderSidebar();
    const menu = await openMenu(await screen.findByRole('button', { name: 'Menu użytkownika' }));
    expect(within(menu).getByRole('radiogroup', { name: 'Motyw' })).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: 'Moje konto' })).toBeInTheDocument();
    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Wyloguj' }));
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it('closes the phone drawer with Escape', async () => {
    const onClose = vi.fn();
    renderSidebar('/s/owned', { isOpen: true, onClose });
    await screen.findByRole('navigation', { name: 'Studio' });
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
