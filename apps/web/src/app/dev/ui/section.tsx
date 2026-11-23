import type { ReactNode } from 'react';

/** One section of the gallery: a heading and the examples under it. */
export function GallerySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-medium text-faint">{title}</h2>
      {children}
    </section>
  );
}

/** A row of examples that wraps. */
export function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}
