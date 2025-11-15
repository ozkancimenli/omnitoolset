'use client';

import Link from 'next/link';

interface ToolHeroProps {
  breadcrumbs: { label: string; href?: string }[];
  title: string;
  subtitle: string;
  primaryCTA: {
    label: string;
    onClick: () => void;
  };
  secondaryText?: string;
  badges?: string[];
  visualElement?: React.ReactNode;
}

export default function ToolHero({
  breadcrumbs,
  title,
  subtitle,
  primaryCTA,
  secondaryText,
  badges = [],
  visualElement,
}: ToolHeroProps) {
  return (
    <div className="relative bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        {/* Breadcrumbs */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && <span className="mx-2">/</span>}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-900 dark:text-slate-200 font-medium">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Hero Content */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Text Content */}
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              {title}
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              {subtitle}
            </p>

            {/* CTA Button */}
            <div className="mb-6">
              <button
                onClick={primaryCTA.onClick}
                className="inline-flex items-center justify-center px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-lg"
              >
                {primaryCTA.label}
              </button>
            </div>

            {/* Secondary Text */}
            {secondaryText && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                {secondaryText}
              </p>
            )}

            {/* Badges */}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {badges.map((badge, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-700 dark:text-slate-300 shadow-sm"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right: Visual Element */}
          {visualElement && (
            <div className="hidden lg:block">
              {visualElement}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

