import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { themeInitScript } from '@detaileed/ui';

const html = readFileSync(path.join(import.meta.dirname, '../../index.html'), 'utf8');

/** Whitespace-insensitive, since Prettier re-indents the copy inside index.html. */
const normalise = (code: string) => code.replace(/\s+/g, ' ').trim();

describe('index.html', () => {
  it('applies the saved theme with a copy of themeInitScript before anything else loads', () => {
    const head = html.slice(0, html.indexOf('</head>'));
    const inlineScripts = [...head.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => normalise(match[1]));
    expect(inlineScripts).toContain(normalise(themeInitScript));
  });
});
