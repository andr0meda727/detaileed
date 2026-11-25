import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MAP_STYLES, roundBounds, roundCoord } from '../../src/map/geo';
import { THEME_STORAGE_KEY } from '../../src/theme/themeScript';

// jsdom has no WebGL: replace the map with a div that exposes its click and load handlers.
const fakeMap = {
  getBounds: () => ({ getSouth: () => 50, getNorth: () => 50.1, getWest: () => 19.8, getEast: () => 20.1 }),
  getCenter: () => ({ lat: 50.05, lng: 19.95 }),
  getZoom: () => 11,
};
vi.mock('react-map-gl/maplibre', () => ({
  default: ({
    children,
    mapStyle,
    onClick,
    onLoad,
  }: {
    children: ReactNode;
    mapStyle?: string;
    onClick?: (e: { lngLat: { lat: number; lng: number } }) => void;
    onLoad?: (e: { target: typeof fakeMap }) => void;
  }) => (
    <div data-testid="map-root" data-style={mapStyle}>
      <button data-testid="map" onClick={() => onClick?.({ lngLat: { lat: 50.0614123456, lng: 19.9372987654 } })} />
      <button data-testid="load" onClick={() => onLoad?.({ target: fakeMap })} />
      {children}
    </div>
  ),
  Marker: ({ children }: { children: ReactNode }) => <div data-testid="marker">{children}</div>,
  NavigationControl: () => null,
  GeolocateControl: () => null,
}));
vi.mock('maplibre-gl/dist/maplibre-gl.css', () => ({}));

const { MapPicker } = await import('../../src/map/MapPicker');
const { MapView } = await import('../../src/map/MapView');

describe('geo helpers', () => {
  it('rounds a coordinate', () => {
    expect(roundCoord(50.0614123456)).toBe(50.061412);
  });

  it('widens bounds when rounding, so the area never shrinks', () => {
    expect(roundBounds({ minLat: 50.0619, maxLat: 50.1001, minLng: 19.8009, maxLng: 20.0991 })).toEqual({
      minLat: 50.061,
      maxLat: 50.101,
      minLng: 19.8,
      maxLng: 20.1,
    });
  });
});

describe('MapPicker', () => {
  it('places the pin where the map is clicked', () => {
    const onChange = vi.fn();
    render(<MapPicker value={null} onChange={onChange} />);
    expect(screen.queryByTestId('marker')).toBeNull();
    fireEvent.click(screen.getByTestId('map'));
    expect(onChange).toHaveBeenCalledWith({ lat: 50.061412, lng: 19.937299 });
  });

  it('ignores clicks when read-only', () => {
    const onChange = vi.fn();
    render(<MapPicker value={{ lat: 50, lng: 20 }} onChange={onChange} readOnly />);
    expect(screen.getByTestId('marker')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('map'));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('MapView', () => {
  it('shows labelled pins and reports clicks and the visible area', () => {
    const onPinClick = vi.fn();
    const onBoundsChange = vi.fn();
    render(
      <MapView
        pins={[{ id: 's1', lat: 50.06, lng: 19.94, label: 'od 89 zł' }]}
        selectedId="s1"
        onPinClick={onPinClick}
        onBoundsChange={onBoundsChange}
      />,
    );
    fireEvent.click(screen.getByText('od 89 zł'));
    expect(onPinClick).toHaveBeenCalledWith('s1');
    expect(screen.getByText('od 89 zł')).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByTestId('load'));
    expect(onBoundsChange).toHaveBeenCalledWith(
      { minLat: 50, maxLat: 50.1, minLng: 19.8, maxLng: 20.1 },
      { lat: 50.05, lng: 19.95, zoom: 11 },
    );
  });
});

describe('map styles', () => {
  afterEach(() => window.localStorage.clear());

  it('uses positron in the light theme', () => {
    render(<MapView pins={[]} />);
    expect(screen.getByTestId('map-root')).toHaveAttribute('data-style', MAP_STYLES.light);
  });

  it('uses the dark style in the dark theme', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    render(<MapPicker value={null} onChange={() => {}} />);
    expect(screen.getByTestId('map-root')).toHaveAttribute('data-style', MAP_STYLES.dark);
  });

  it('keeps an app style over both', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    render(<MapView pins={[]} styleUrl="https://maps.example.com/style.json" />);
    expect(screen.getByTestId('map-root')).toHaveAttribute('data-style', 'https://maps.example.com/style.json');
  });

  it('marks the selected pin with the inverted primary', () => {
    render(
      <MapView
        pins={[
          { id: 'a', lat: 50, lng: 20, label: 'od 89 zł' },
          { id: 'b', lat: 51, lng: 21, label: 'od 120 zł' },
        ]}
        selectedId="b"
      />,
    );
    expect(screen.getByText('od 120 zł')).toHaveClass('bg-primary', 'text-primary-foreground');
    expect(screen.getByText('od 89 zł')).toHaveClass('bg-surface', 'border-border-strong');
  });
});
