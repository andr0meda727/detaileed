import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import Turnstile from '../../src/captcha/Turnstile';
import { useTurnstile } from '../../src/captcha/useTurnstile';

type Options = Record<string, (...args: unknown[]) => void> & { sitekey: string };

const api = {
  render: vi.fn<(container: HTMLElement, options: Record<string, unknown>) => string>(() => 'widget-1'),
  reset: vi.fn(),
  remove: vi.fn(),
};

const lastOptions = () => api.render.mock.calls.at(-1)![1] as Options;

function Form({ siteKey }: { siteKey?: string }) {
  const captcha = useTurnstile(siteKey, 'login');
  return (
    <div>
      {captcha.widgetProps && <Turnstile {...captcha.widgetProps} />}
      <p data-testid="state">{`${captcha.ready ? 'ready' : 'waiting'}:${captcha.token ?? '-'}:${captcha.failed}`}</p>
      <button onClick={captcha.reset}>reset</button>
    </div>
  );
}

const state = () => screen.getByTestId('state').textContent;

describe('Turnstile', () => {
  beforeEach(() => {
    window.turnstile = api;
  });
  afterEach(() => {
    vi.clearAllMocks();
    delete window.turnstile;
  });

  it('is off without a site key: no widget, and the form may be sent', () => {
    render(<Form />);
    expect(api.render).not.toHaveBeenCalled();
    expect(state()).toBe('ready:-:false');
  });

  it('waits for a token, then hands it to the form', async () => {
    render(<Form siteKey="site-key" />);
    await waitFor(() => expect(api.render).toHaveBeenCalledOnce());
    expect(lastOptions()).toMatchObject({ sitekey: 'site-key', action: 'login' });
    expect(state()).toBe('waiting:-:false');

    act(() => lastOptions().callback('token-1'));
    expect(state()).toBe('ready:token-1:false');

    act(() => lastOptions()['expired-callback']());
    expect(state()).toBe('waiting:-:false');
  });

  it('drops the used token and asks Cloudflare for a new one on reset', async () => {
    render(<Form siteKey="site-key" />);
    await waitFor(() => expect(api.render).toHaveBeenCalled());
    act(() => lastOptions().callback('token-1'));

    act(() => screen.getByRole('button', { name: 'reset' }).click());
    expect(api.reset).toHaveBeenCalledWith('widget-1');
    expect(state()).toBe('waiting:-:false');
  });

  it('reports a failed challenge', async () => {
    render(<Form siteKey="site-key" />);
    await waitFor(() => expect(api.render).toHaveBeenCalled());
    act(() => lastOptions()['error-callback']());
    expect(state()).toBe('waiting:-:true');
  });

  it('removes the widget when it unmounts', async () => {
    const { unmount } = render(<Form siteKey="site-key" />);
    await waitFor(() => expect(api.render).toHaveBeenCalled());
    unmount();
    expect(api.remove).toHaveBeenCalledWith('widget-1');
  });
});
