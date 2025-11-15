import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-semibold mb-4 text-slate-100">Page Not Found</h2>
          <p className="text-slate-400 mb-8">The page you're looking for doesn't exist.</p>
          <Link href="/" className="btn inline-block">
            Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
