import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';
import { tools } from '@/data/tools';
import ToolCard from '@/components/ToolCard';

export const metadata: Metadata = {
  title: 'Tool Categories - OmniToolset',
  description: 'Browse all free online tools by category: PDF, Image, Text, Developer tools and more.',
  keywords: 'tool categories, pdf tools, image tools, text tools, developer tools',
  openGraph: {
    title: 'Tool Categories - OmniToolset',
    description: 'Browse all free online tools by category',
    url: 'https://omnitoolset.com/categories',
  },
};

export default function CategoriesPage() {
  // Group tools by category
  const toolsByCategory = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, typeof tools>);

  const categories = Object.keys(toolsByCategory).sort();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Tool Categories - OmniToolset',
    description: 'Browse all free online tools by category',
    url: 'https://omnitoolset.com/categories',
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-12">
        <Breadcrumbs 
          items={[
            { label: 'Home', href: '/' },
            { label: 'Categories' },
          ]} 
        />

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Browse Tools by Category
          </h1>
          <p className="text-xl text-slate-400">
            Find the perfect tool for your needs
          </p>
        </div>

        <div className="space-y-16">
          {categories.map((category) => (
            <section key={category} id={category.toLowerCase()} className="scroll-mt-8">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-3xl font-bold text-slate-100">{category}</h2>
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg text-sm">
                  {toolsByCategory[category].length} {toolsByCategory[category].length === 1 ? 'tool' : 'tools'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {toolsByCategory[category].map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link 
            href="/"
            className="btn inline-block"
          >
            View All Tools
          </Link>
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

