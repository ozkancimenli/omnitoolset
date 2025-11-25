import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getBlogPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog - Free PDF Tools Guides & Tutorials | OmniToolset',
  description: 'Learn how to use PDF tools, convert files, and more. Free guides, tutorials, and tips for PDF editing, conversion, and file management.',
  keywords: 'pdf blog, pdf tutorials, how to merge pdf, pdf guides, free pdf tips, pdf converter guide, pdf editor tutorial',
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            📝 Blog & Guides
          </h1>
          <p className="text-xl text-slate-400">
            Learn how to use our tools effectively. Free guides, tutorials, and tips.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="text-3xl mb-3">{post.icon}</div>
              <h2 className="text-xl font-semibold mb-2 text-slate-100">{post.title}</h2>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{post.date}</span>
                <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded">
                  {post.category}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">Blog posts coming soon!</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

