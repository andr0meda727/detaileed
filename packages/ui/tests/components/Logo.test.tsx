import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo, LogoMark } from '../../src/components/Logo';
import { logoMarkSvg } from '../../src/components/logoMark';

describe('Logo', () => {
  it('shows the mark and the wordmark under one accessible name', () => {
    render(<Logo />);
    const logo = screen.getByRole('img', { name: 'Detaileed' });
    expect(logo).toHaveTextContent('detaileed');
    expect(logo.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('draws the mark in currentColor with the "d" cut out', () => {
    const { container } = render(<Logo variant="mark" size={32} />);
    const svg = screen.getByRole('img', { name: 'Detaileed' });
    expect(svg).toHaveAttribute('width', '32');
    const fill = container.querySelector('svg > rect');
    expect(fill).toHaveAttribute('fill', 'currentColor');
    const maskId = container.querySelector('mask')?.id;
    expect(fill).toHaveAttribute('mask', `url(#${maskId})`);
  });

  it('gives each mark its own mask id', () => {
    const { container } = render(
      <>
        <LogoMark />
        <LogoMark />
      </>,
    );
    const ids = [...container.querySelectorAll('mask')].map((m) => m.id);
    expect(new Set(ids).size).toBe(2);
  });

  it('exports the mark as a standalone svg for favicons', () => {
    const svg = logoMarkSvg('currentColor');
    expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    expect(svg).toContain('fill="currentColor"');
    expect(new DOMParser().parseFromString(svg, 'image/svg+xml').querySelector('parsererror')).toBeNull();
  });
});
