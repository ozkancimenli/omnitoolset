'use client';

import Link from 'next/link';

interface BreadcrumbsProps {
  items: { label: string; href?: string }[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-2 text-sm text-slate-400">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && <span className="text-slate-600">/</span>}
            {item.href ? (
              <Link 
                href={item.href} 
                className="hover:text-slate-200 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-200">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

