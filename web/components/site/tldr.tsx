/**
 * TL;DR block — the most-citable answer on the page. Rendered above the
 * regular summary prose on provider and pair pages so AI answer engines that
 * lift "first sentence under H1" content get the canonical answer.
 */
export function Tldr({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <aside
      className="my-8 border-l-4 border-accent bg-accent-subtle/40 pl-5 pr-4 py-4 max-w-prose"
      aria-label="TL;DR"
    >
      <p className="small-caps text-[11px] text-accent mb-1.5">TL;DR</p>
      <p className="text-base text-ink leading-snug font-medium">{children}</p>
    </aside>
  );
}
