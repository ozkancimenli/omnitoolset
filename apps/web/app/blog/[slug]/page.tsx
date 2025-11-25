import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdSense from '@/components/AdSense';
import { BlogTopAd, BlogMiddleAd, BlogBottomAd } from '@/components/OptimizedAd';
import BlogSidebar from '@/components/blog/BlogSidebar';
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
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Breadcrumbs */}
              <div className="mb-6 text-sm text-gray-600 dark:text-slate-400">
                <Link href="/" className="hover:text-gray-900 dark:hover:text-slate-200 transition-colors">Home</Link>
                {' / '}
                <Link href="/blog" className="hover:text-gray-900 dark:hover:text-slate-200 transition-colors">Blog</Link>
                {' / '}
                <span className="text-gray-900 dark:text-slate-200">{post.title}</span>
              </div>

              {/* Post Header */}
              <article className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-8 mb-8 shadow-sm">
                <div className="text-5xl mb-4">{post.icon}</div>
                <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-slate-100 leading-tight">{post.title}</h1>
                <div className="flex items-center gap-4 mb-6 text-sm text-gray-600 dark:text-slate-400">
                  <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span>•</span>
                  <span>{post.readingTime} min read</span>
                  <span>•</span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-full font-medium">
                    {post.category}
                  </span>
                </div>

            {/* Blog Top Ad */}
            <div className="mb-8">
              <BlogTopAd />
            </div>

                {/* Post Content with In-Article Ad */}
                <div
                  className="prose prose-lg max-w-none
                    prose-headings:text-gray-900 dark:prose-headings:text-slate-100
                    prose-p:text-gray-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed
                    prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:text-blue-700 dark:hover:prose-a:text-blue-300
                    prose-strong:text-gray-900 dark:prose-strong:text-slate-100
                    prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-blue-50 dark:prose-code:bg-blue-900/20 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                    prose-pre:bg-gray-900 dark:prose-pre:bg-slate-900 prose-pre:text-gray-100
                    prose-blockquote:border-blue-500 dark:prose-blockquote:border-blue-400 prose-blockquote:text-gray-700 dark:prose-blockquote:text-slate-300
                    prose-ul:text-gray-700 dark:prose-ul:text-slate-300
                    prose-ol:text-gray-700 dark:prose-ol:text-slate-300
                    prose-li:text-gray-700 dark:prose-li:text-slate-300"
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
                <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-blue-300">Try Our Tools</h3>
                  <p className="text-gray-700 dark:text-slate-300 mb-4 text-sm">
                    Use our free online tools to {post.title.toLowerCase()}. No registration required!
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/#tools"
                      className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                    >
                      Explore All Tools →
                    </Link>
                    {/* Smart Direct Link Button */}
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
              <div className="text-center mb-8">
                <Link
                  href="/blog"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
                >
                  ← Back to Blog
                </Link>
              </div>
            </div>

            {/* Sidebar - Desktop Only */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-4">
                <BlogSidebar currentPostSlug={slug} currentCategory={post.category} />
              </div>
            </div>
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

