import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdSense from '@/components/AdSense';
import { BlogTopAd, BlogMiddleAd, BlogBottomAd } from '@/components/OptimizedAd';
import { getBlogPost, getBlogPosts } from '@/lib/blog';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// ISR: Revalidate every hour
export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} | OmniToolset Blog`,
    description: post.excerpt,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://omnitoolset.com/blog/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
    alternates: {
      canonical: `https://omnitoolset.com/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  // Enhanced markdown to HTML conversion
  let contentHtml = post.content;
  
  // Process code blocks first (to avoid interfering with other patterns)
  contentHtml = contentHtml.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  
  // Process inline code
  contentHtml = contentHtml.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Process headers (must be before other replacements)
  contentHtml = contentHtml.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  contentHtml = contentHtml.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  contentHtml = contentHtml.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Process links (before bold/italic to avoid conflicts)
  contentHtml = contentHtml.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-indigo-400 hover:text-indigo-300">$1</a>');
  
  // Process bold text (anywhere in the text, not just line start)
  // Must be before italic to avoid conflicts
  contentHtml = contentHtml.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  
  // Process italic text (single asterisk, not part of bold)
  // Match single * that's not preceded or followed by another *
  // Use a workaround: replace remaining single asterisks that aren't part of **
  contentHtml = contentHtml.replace(/([^*]|^)\*([^*\n]+?)\*([^*]|$)/gim, '$1<em>$2</em>$3');
  
  // Process lists
  contentHtml = contentHtml.replace(/^\- (.*$)/gim, '<li>$1</li>');
  contentHtml = contentHtml.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
  
  // Wrap consecutive list items in <ul>
  contentHtml = contentHtml.replace(/(<li>.*?<\/li>(\s*<li>.*?<\/li>)*)/gim, '<ul>$1</ul>');
  
  // Split into paragraphs (double newlines)
  const paragraphs = contentHtml.split(/\n\n+/);
  contentHtml = paragraphs
    .map(p => {
      const trimmed = p.trim();
      // Don't wrap headers, lists, or code blocks in <p>
      if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<pre') || trimmed.startsWith('<ol')) {
        return trimmed;
      }
      return trimmed ? `<p>${trimmed}</p>` : '';
    })
    .join('\n\n');
  
  // Replace single newlines with <br> (but not in code blocks)
  contentHtml = contentHtml.replace(/(?<!<\/code>)\n(?!<pre>)/g, '<br>');

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      '@type': 'Organization',
      name: 'OmniToolset',
    },
    publisher: {
      '@type': 'Organization',
      name: 'OmniToolset',
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumbs */}
          <div className="mb-6 text-sm text-slate-400">
            <Link href="/" className="hover:text-slate-200">Home</Link>
            {' / '}
            <Link href="/blog" className="hover:text-slate-200">Blog</Link>
            {' / '}
            <span className="text-slate-200">{post.title}</span>
          </div>

          {/* Post Header */}
          <article className="bg-slate-800 border border-slate-700 rounded-2xl p-8 mb-8">
            <div className="text-5xl mb-4">{post.icon}</div>
            <h1 className="text-4xl font-bold mb-4 text-slate-100">{post.title}</h1>
            <div className="flex items-center gap-4 mb-6 text-sm text-slate-400">
              <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span>•</span>
              <span>{post.readingTime} min read</span>
              <span>•</span>
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full">
                {post.category}
              </span>
            </div>

            {/* Blog Top Ad */}
            <div className="mb-8">
              <BlogTopAd />
            </div>

            {/* Post Content with In-Article Ad */}
            <div
              className="prose prose-invert prose-indigo max-w-none
                prose-headings:text-slate-100
                prose-p:text-slate-300
                prose-a:text-indigo-400 hover:prose-a:text-indigo-300
                prose-strong:text-slate-100
                prose-code:text-indigo-300
                prose-pre:bg-slate-900
                prose-blockquote:border-indigo-500
                prose-ul:text-slate-300
                prose-ol:text-slate-300
                prose-li:text-slate-300"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />

            {/* Blog Middle Ad (In-Article) */}
            <div className="my-8">
              <BlogMiddleAd />
            </div>
            
            {/* Blog Bottom Ad */}
            <div className="my-8">
              <BlogBottomAd />
            </div>

            {/* Related Tools CTA with Smartlink */}
            <div className="mt-8 p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <h3 className="text-xl font-semibold mb-3 text-indigo-300">Try Our Tools</h3>
              <p className="text-slate-300 mb-4 text-sm">
                Use our free online tools to {post.title.toLowerCase()}. No registration required!
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/#tools"
                  className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Explore All Tools →
                </Link>
                {/* Smart Direct Link Button - Kishwar Strategy */}
                <a
                  href="https://www.effectivegatecpm.com/mm191s15?key=6e97a3f80c904696c8f019e4b77d7bbd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                >
                  🎁 Get Exclusive Offers →
                </a>
              </div>
            </div>
          </article>

          {/* Back to Blog */}
          <div className="text-center">
            <Link
              href="/blog"
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              ← Back to Blog
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </div>
  );
}

