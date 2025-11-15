import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-slate-800/80 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-50">
      <div className="container py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex flex-col items-start">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              🛠️ OmniToolset
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">All the tools you need in one place</p>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link 
              href="/categories" 
              className="text-slate-300 hover:text-slate-100 transition-colors font-medium"
            >
              Categories
            </Link>
            <Link 
              href="/#tools" 
              className="text-slate-300 hover:text-slate-100 transition-colors font-medium"
            >
              All Tools
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
