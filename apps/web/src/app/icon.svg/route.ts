import { logoMarkSvg } from '@detaileed/ui';

export const dynamic = 'force-static';

// System colours follow the tab's colour scheme: a dark mark on light browser chrome, a light one on dark.
const THEME_STYLE = '<style>:root{color-scheme:light dark;color:CanvasText}</style>';

/** The favicon: the logo mark in the text colour of the browser's theme. */
export function GET() {
  const svg = logoMarkSvg('currentColor').replace('<mask', `${THEME_STYLE}<mask`);
  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' },
  });
}
