'use client';

/**
 * Hero Section for OmniPDF Editor
 * 
 * Calm, professional hero section with clear value proposition.
 * Designed to build trust and encourage engagement.
 */
interface HeroProps {
  onFileSelect: () => void;
}

export default function Hero({ onFileSelect }: HeroProps) {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Edit PDF Online
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 leading-relaxed">
              Reorder, Rotate & Delete Pages
            </p>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              A clean, distraction-free PDF editor in your browser. Quickly reorder, rotate, and remove pages from your PDF. No signup required.
            </p>

            {/* CTA Button */}
            <button
              onClick={onFileSelect}
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Choose PDF file
            </button>

            <p className="text-sm text-gray-500 mb-6">
              or drag & drop your file below
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                Free to use
              </span>
              <span className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                No watermark
              </span>
              <span className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                Secure processing
              </span>
            </div>
          </div>

          {/* Right: Visual Element */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-gray-50 rounded-2xl p-8 shadow-lg border border-gray-200">
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <div
                      key={num}
                      className="aspect-[3/4] bg-white rounded-lg shadow-sm flex items-center justify-center border border-gray-200"
                    >
                      <span className="text-gray-400 text-sm font-medium">
                        {num}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="absolute -bottom-3 -right-3 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md text-sm font-semibold">
                  Edit Pages
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

