import { notFound } from 'next/navigation';
import { tools } from '@/data/tools';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import RelatedTools from '@/components/RelatedTools';
import SocialShare from '@/components/SocialShare';
import AdSense from '@/components/AdSense';
import { Metadata } from 'next';
import ToolWrapper from '@/components/ToolWrapper';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return tools.map((tool) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = tools.find((t) => t.slug === slug);
  
  if (!tool) {
  return {
    title: 'Tool Not Found',
  };
  }

  const url = `https://omnitoolset.com/tools/${tool.slug}`;
  
  return {
    title: `${tool.title} - Free Online Tool | OmniToolset`,
    description: tool.description,
    keywords: tool.keywords,
    openGraph: {
      title: `${tool.title} - OmniToolset`,
      description: tool.description,
      url,
      type: 'website',
      siteName: 'OmniToolset',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tool.title} - OmniToolset`,
      description: tool.description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = tools.find((t) => t.slug === slug);

  if (!tool) {
    notFound();
  }

  const url = `https://omnitoolset.com/tools/${tool.slug}`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.title,
    description: tool.description,
    url,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs 
            items={[
              { label: 'Home', href: '/' },
              { label: 'Tools', href: '/#tools' },
              { label: tool.category, href: `/categories#${tool.category.toLowerCase()}` },
              { label: tool.title },
            ]} 
          />

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-6xl mb-4">{tool.icon}</div>
                <h1 className="text-3xl font-bold mb-2 text-slate-100">{tool.title}</h1>
                <p className="text-slate-400 mb-4">{tool.description}</p>
                <div className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg text-sm">
                  {tool.category}
                </div>
              </div>
            </div>
            
            <ToolWrapper toolId={tool.id} />
            
            {/* AdSense - Bottom of Tool (Single ad, less intrusive) */}
            <div className="mt-8">
              <AdSense
                adFormat="auto"
                fullWidthResponsive={true}
                className="min-h-[100px] bg-slate-900 rounded-xl"
              />
            </div>
            
            <SocialShare 
              title={tool.title}
              description={tool.description}
              url={url}
            />
          </div>

          <RelatedTools currentTool={tool} />
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
