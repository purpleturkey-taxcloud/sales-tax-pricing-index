import Link from 'next/link';

export function Header() {
  return (
    <header className="rule-bottom bg-paper sticky top-0 z-50 backdrop-blur-sm bg-opacity-90">
      <div className="mx-auto max-w-6xl px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:py-5">
        <Link href="/" className="no-underline hover:no-underline group whitespace-nowrap flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-paper">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="2" height="2" rx="0.4" />
              <rect x="7.5" y="5" width="13.5" height="2" rx="1" />
              <rect x="3" y="11" width="2" height="2" rx="0.4" />
              <rect x="7.5" y="11" width="10" height="2" rx="1" />
              <rect x="3" y="17" width="2" height="2" rx="0.4" />
              <rect x="7.5" y="17" width="15" height="2" rx="1" />
            </svg>
          </span>
          <span>
            <span className="font-sans text-base sm:text-lg font-bold text-ink group-hover:text-accent transition-colors block leading-tight">
              Sales Tax Pricing Index
            </span>
            <span className="block text-[11px] text-ink-subtle mt-px font-medium">
              A sourced comparison
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-5 sm:gap-6 text-sm font-medium">
          <Link href="/calculator" className="text-ink-muted hover:text-ink no-underline">Calculator</Link>
          <Link href="/methodology" className="text-ink-muted hover:text-ink no-underline">Methodology</Link>
          <Link href="/changelog" className="text-ink-muted hover:text-ink no-underline">Changelog</Link>
        </nav>
      </div>
    </header>
  );
}
