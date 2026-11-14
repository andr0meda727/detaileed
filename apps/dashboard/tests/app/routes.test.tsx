import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';

const session = { user: { email: 'a@b.pl', user_metadata: {} } };
const auth = vi.hoisted(() => ({ session: null as unknown }));
const studios = [
  { studioId: 'owned', name: 'Owned', role: 'Owner', address: null },
  { studioId: 'staff', name: 'Staff', role: 'Employee', address: null },
];

vi.mock('@/utils/supabase', () => ({
  default: {
    auth: {
      getSession: async () => ({ data: { session: auth.session } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    },
  },
}));
vi.mock('@/apiClient', () => ({ apiGet: async () => studios }));

const { routeTree } = await import('@/routeTree.gen');
const { forgetActiveStudio } = await import('@/app/activeStudio');

function makeRouter(path: string) {
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    context: { queryClient: new QueryClient() },
  });
}

async function resolve(path: string) {
  const router = makeRouter(path);
  await router.load();
  return router.state.location;
}

describe('route guards', () => {
  beforeEach(() => {
    auth.session = null;
    forgetActiveStudio();
  });

  it('sends signed-out users to login and remembers where they were going', async () => {
    const location = await resolve('/s/owned/clients');
    expect(location.pathname).toBe('/login');
    expect(location.search).toEqual({ redirect: '/s/owned/clients' });
  });

  it('sends signed-in users from / to the studio list, then to their last studio', async () => {
    auth.session = session;
    expect((await resolve('/')).pathname).toBe('/studios');

    await resolve('/s/owned/clients');
    expect((await resolve('/')).pathname).toBe('/s/owned');
  });

  it('redirects away from studios the user does not belong to', async () => {
    auth.session = session;
    expect((await resolve('/s/unknown/clients')).pathname).toBe('/studios');
  });

  it('keeps employees out of the team screen', async () => {
    auth.session = session;
    expect((await resolve('/s/owned/team')).pathname).toBe('/s/owned/team');
    expect((await resolve('/s/staff/team')).pathname).toMatch(/^\/s\/staff\/?$/);
  });
});

describe('search params', () => {
  it('keeps valid report dates and drops malformed ones', async () => {
    auth.session = session;
    const router = makeRouter('/s/owned/reports?from=yesterday&to=2026-01-31');
    await router.load();
    // location.search is the raw query; the match holds what validateSearch returned.
    expect(router.state.matches.at(-1)?.search).toEqual({ to: '2026-01-31' });
  });
});

describe('rendering', () => {
  it('renders the login screen at /login', async () => {
    auth.session = null;
    render(<RouterProvider router={makeRouter('/login')} />);
    expect(await screen.findByRole('heading', { name: 'Detaileed' })).toBeInTheDocument();
  });
});
