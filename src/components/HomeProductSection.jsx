import { useNavigate } from "react-router-dom";
import { useGraniteVariants } from "../hooks/useProducts";
import { LoadingSpinner, ErrorMessage, ProductGridSkeleton } from "./ui/Loading";
import TruncatedDescription from "./ui/TruncatedDescription";

function HomeProductsSection() {
  const navigate = useNavigate();
  const { variants, loading, error } = useGraniteVariants();

  function handleProductClick(variantId, variantName) {
    // Navigate to products page with variant ID
    // We'll use the variant name as slug for clean URLs
    const slug = variantName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    navigate(`/products/${slug}`, { state: { variantId, variantName } });
  }

  if (loading) {
    return (
      <section id="products-section" className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Product Portfolio</h2>
            <p className="text-xl text-slate-600">Professional stone solutions for every business need</p>
          </div>
          <div className="flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="products-section" className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Product Portfolio</h2>
            <p className="text-xl text-slate-600">Professional stone solutions for every business need</p>
          </div>
          <ErrorMessage 
            error={error} 
            onRetry={() => window.location.reload()} 
          />
        </div>
      </section>
    );
  }

  if (!variants || variants.length === 0) {
    return (
      <section id="products-section" className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Product Portfolio</h2>
            <p className="text-xl text-slate-600">Professional stone solutions for every business need</p>
          </div>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-slate-600 text-lg">No products available at the moment.</p>
            <p className="text-slate-500 text-sm mt-2">Please check back later or contact our sales team.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="products-section" className="bg-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
            Product Catalog
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Professional Stone Solutions</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Discover our comprehensive range of premium granite products, carefully selected for 
            commercial projects and architectural excellence.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {variants.map((variant) => (
            <div
              key={variant._id}
              className="business-card group cursor-pointer h-full"
              onClick={() => handleProductClick(variant._id, variant.name)}
            >
              {/* Image Container */}
              <div className="relative overflow-hidden rounded-t-xl bg-slate-100">
                <img
                  src={variant.image || '/granite-landscaping-products.png'}
                  alt={variant.name}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = '/granite-landscaping-products.png';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {variant.name}
                  </h3>
                  <div className="flex items-center text-slate-400 group-hover:text-blue-500 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <TruncatedDescription 
                  description={variant.description} 
                  maxLength={80}
                />

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Premium Quality
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Commercial Grade
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Need Custom Solutions?</h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Our expert team can help you find the perfect stone solution for your specific project requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="business-button-primary">
                Request Consultation
              </button>
              <button className="business-button-secondary">
                Download Catalog
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeProductsSection;
