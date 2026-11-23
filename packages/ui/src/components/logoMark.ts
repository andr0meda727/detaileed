/**
 * The Detaileed mark, a rounded square with a "d" cut out of it, as one SVG drawing on a 24×24 grid. The square is
 * filled with the given colour and the "d" is a hole, so the mark works on any background.
 */
const MARK_SHAPES = {
  ring: { cx: 10.75, cy: 13.75, r: 3.6, strokeWidth: 2.2 },
  stem: { x: 13.25, y: 5, width: 2.2, height: 13.45, rx: 1.1 },
} as const;

export { MARK_SHAPES };

/**
 * The mark as a standalone SVG document, e.g. for a favicon (`data:image/svg+xml,…` or a file in `public/`).
 * `color` is any CSS colour; `currentColor` (the default) is black in most favicon renderers.
 */
export function logoMarkSvg(color = 'currentColor'): string {
  const { ring, stem } = MARK_SHAPES;
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
    '<mask id="detaileed-d"><rect width="24" height="24" fill="white"/>' +
    `<circle cx="${ring.cx}" cy="${ring.cy}" r="${ring.r}" fill="none" stroke="black" stroke-width="${ring.strokeWidth}"/>` +
    `<rect x="${stem.x}" y="${stem.y}" width="${stem.width}" height="${stem.height}" rx="${stem.rx}" fill="black"/>` +
    '</mask>' +
    `<rect width="24" height="24" rx="6" fill="${color}" mask="url(#detaileed-d)"/>` +
    '</svg>'
  );
}
