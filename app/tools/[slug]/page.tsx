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
import ToolTracker from '@/components/ToolTracker';

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
  
  // Enhanced descriptions with keywords for better SEO - MAXIMUM OPTIMIZATION
  const isPDFTool = tool.category === 'PDF';
  const isImageTool = tool.category === 'Image';
  const isTextTool = tool.category === 'Text';
  const isDeveloperTool = tool.category === 'Developer';
  
  // Build comprehensive long-tail keywords - MAXIMUM SEO COVERAGE
  const baseKeywords = tool.keywords || '';
  const toolNameLower = tool.title.toLowerCase();
  
  // High-volume search terms
  const freeKeywords = `free ${toolNameLower}, free online ${toolNameLower}, ${toolNameLower} free, ${toolNameLower} online free, free ${toolNameLower} tool, ${toolNameLower} free online`;
  const instantKeywords = `instant ${toolNameLower}, ${toolNameLower} instantly, quick ${toolNameLower}, fast ${toolNameLower}, ${toolNameLower} online instant`;
  const noRegKeywords = `${toolNameLower} no registration, ${toolNameLower} no signup, ${toolNameLower} no account, ${toolNameLower} without registration`;
  const howToKeywords = `how to ${toolNameLower}, how to use ${toolNameLower}, ${toolNameLower} tutorial, ${toolNameLower} guide`;
  const bestKeywords = `best ${toolNameLower}, best ${toolNameLower} tool, best free ${toolNameLower}, best online ${toolNameLower}, top ${toolNameLower} tool`;
  const onlineKeywords = `${toolNameLower} online, online ${toolNameLower}, ${toolNameLower} online tool, ${toolNameLower} web, web ${toolNameLower}`;
  
  let categorySpecificKeywords = '';
  if (isPDFTool) {
    categorySpecificKeywords = `pdf converter, free pdf converter, online pdf converter, pdf converter tool, ${toolNameLower} pdf converter, pdf converter free, pdf converter online, pdf converter no registration, best pdf converter, pdf converter instant, pdf converter secure, pdf converter unlimited, how to convert pdf, pdf tools, pdf utilities`;
  } else if (isImageTool) {
    categorySpecificKeywords = `image converter, free image converter, online image converter, image converter tool, ${toolNameLower} image converter, image converter free, image converter online, best image converter, image tools, image utilities, photo tools`;
  } else if (isTextTool) {
    categorySpecificKeywords = `text tool, free text tool, online text tool, text converter, ${toolNameLower} tool, text tool free, text tool online, best text tool, text utilities, text editor online`;
  } else if (isDeveloperTool) {
    categorySpecificKeywords = `developer tool, free developer tool, online developer tool, ${toolNameLower} tool, developer tool free, developer tool online, best developer tool, coding tools, programming tools, dev utilities`;
  } else {
    categorySpecificKeywords = `${tool.category.toLowerCase()} tool, free ${tool.category.toLowerCase()} tool, online ${tool.category.toLowerCase()} tool, ${toolNameLower} tool, best ${tool.category.toLowerCase()} tool`;
  }
  
  const enhancedKeywords = `${baseKeywords}, ${freeKeywords}, ${instantKeywords}, ${noRegKeywords}, ${howToKeywords}, ${bestKeywords}, ${onlineKeywords}, ${categorySpecificKeywords}, online tool, free tool, no registration, instant, secure, 100% free, unlimited, no watermark, no signup required`;
  
  const enhancedDescription = isPDFTool
    ? `${tool.description}. FREE online PDF converter tool to ${tool.title.toLowerCase()} PDF files instantly. No registration required, no watermarks, 100% secure and completely free. Works on all devices - desktop, mobile, tablet. Convert unlimited PDF files online for free. Best ${tool.title.toLowerCase()} tool available. How to ${tool.title.toLowerCase()} PDF files online.`
    : `${tool.description}. FREE online ${tool.category.toLowerCase()} tool to ${tool.title.toLowerCase()} files instantly. No registration required, no watermarks, 100% secure and completely free. Works on all devices - desktop, mobile, tablet. Use unlimited times for free. Best ${tool.title.toLowerCase()} tool available. How to ${tool.title.toLowerCase()} files online.`;
  
  const enhancedTitle = isPDFTool
    ? `FREE ${tool.title} Converter Online - No Registration | Best PDF Converter Tool 2024`
    : `FREE ${tool.title} Online Tool - No Registration | Best ${tool.category} Tool 2024`;
  
  return {
    title: enhancedTitle,
    description: enhancedDescription,
    keywords: enhancedKeywords,
    openGraph: {
      title: enhancedTitle,
      description: enhancedDescription,
      url,
      type: 'website',
      siteName: 'OmniToolset',
    },
    twitter: {
      card: 'summary_large_image',
      title: enhancedTitle,
      description: enhancedDescription,
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
  const isPDFTool = tool.category === 'PDF';
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: isPDFTool ? `FREE ${tool.title} - PDF Converter Online` : `FREE ${tool.title} - Online Tool`,
    description: isPDFTool 
      ? `100% FREE online PDF converter tool to ${tool.title.toLowerCase()}. ${tool.description}. No registration required, no watermarks, 100% secure, unlimited use.`
      : `100% FREE online ${tool.category.toLowerCase()} tool. ${tool.description}. No registration required, no watermarks, 100% secure, unlimited use.`,
    url,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web',
    keywords: isPDFTool 
      ? `${tool.keywords || ''}, pdf converter, free pdf converter, online pdf converter, pdf converter free, pdf converter no registration, free online pdf converter, instant pdf converter`
      : `${tool.keywords || ''}, free online tool, ${tool.category.toLowerCase()} tool free, online tool no registration, free ${tool.category.toLowerCase()} tool`,
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

          <ToolTracker tool={tool} />
          
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-6xl mb-4">{tool.icon}</div>
                <h1 className="text-3xl font-bold mb-2 text-slate-100">
                  {tool.category === 'PDF' ? `FREE ${tool.title} Converter Online - No Registration Required` : `FREE ${tool.title} Online Tool - No Registration Required`}
                </h1>
                <p className="text-slate-400 mb-4 text-lg font-semibold">{tool.description}</p>
                <p className="text-slate-300 mb-4 text-base leading-relaxed">
                  {tool.category === 'PDF' 
                    ? `Use our 100% FREE online PDF converter to ${tool.title.toLowerCase()} your PDF files instantly. No registration required, no watermarks, 100% secure, and works on all devices - desktop, mobile, tablet. ${tool.title.includes('Convert') || tool.title.includes('to') ? 'Convert your files in seconds with our fast and reliable PDF converter tool. Use unlimited times for free - no limits, no hidden fees. This is the best PDF converter tool available online in 2024. Learn how to convert PDF files easily with our step-by-step guide.' : 'Process your PDF files quickly and easily with our professional PDF tool. Use unlimited times for free - no limits, no hidden fees. This is the best PDF tool available online in 2024. Learn how to use our PDF tool with our easy tutorial.'}`
                    : `Use our 100% FREE online ${tool.category.toLowerCase()} tool to ${tool.title.toLowerCase()} files instantly. No registration required, no watermarks, 100% secure, and works on all devices - desktop, mobile, tablet. Use unlimited times for free - no limits, no hidden fees. This is the best ${tool.title.toLowerCase()} tool available online in 2024. Learn how to use our ${tool.title.toLowerCase()} tool with our easy tutorial.`}
                </p>
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
