import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSpecificVariants } from "../hooks/useProducts";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner, ErrorMessage, ProductGridSkeleton } from "../components/ui/Loading";
import TypesGrid from "../components/productsType/TypesGrid";
import NavBar from "../components/Navbar";

export default function ProductTypesPage() {
  const { slug } = useParams(); // category slug from URL
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // Get variant data from navigation state (passed from HomeProductSection)
  const { variantId, variantName } = location.state || {};
  
  // Fetch specific variants for this variant
  const { specificVariants, loading, error } = useSpecificVariants(variantId);

  function handleTypeClick(specificVariantId, specificVariantName) {
    // Navigate to varieties page with specific variant info
    const typeSlug = specificVariantName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    navigate(`/products/${slug}/${typeSlug}`, { 
      state: { 
        variantId, 
        variantName, 
        specificVariantId, 
        specificVariantName 
      } 
    });
  }

  // If no variant data from navigation, show error
  if (!variantId || !variantName) {
    return (
      <section>
        <NavBar user={user} onLogout={logout} />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <p className="text-gray-600">Invalid product category. Please navigate from the home page.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
            >
              Go Home
            </button>
          </div>
        </main>
      </section>
    );
  }

  if (loading) {
    return (
      <section>
        <NavBar user={user} onLogout={logout} />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">{variantName}</h1>
          <ProductGridSkeleton count={6} />
        </main>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <NavBar user={user} onLogout={logout} />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">{variantName}</h1>
          <ErrorMessage 
            error={error} 
            onRetry={() => window.location.reload()} 
          />
        </main>
      </section>
    );
  }

  if (!specificVariants || specificVariants.length === 0) {
    return (
      <section>
        <NavBar user={user} onLogout={logout} />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">{variantName}</h1>
          <div className="text-center py-8">
            <p className="text-gray-600">No product types available for this category.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
            >
              Browse Other Categories
            </button>
          </div>
        </main>
      </section>
    );
  }

  // Transform API data to match TypesGrid expected format
  const types = specificVariants.map(variant => ({
    id: variant._id,
    name: variant.name,
    image: variant.image || '/patterns.png', // fallback image
    description: variant.description || 'Premium granite variety'
  }));

  return (
    <section className="min-h-screen bg-slate-50">
      <NavBar user={user} onLogout={logout} />
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Breadcrumb Navigation */}
        <nav className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-slate-600 hover:text-blue-600 transition-colors duration-200 font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Products
          </button>
        </nav>
        
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">{variantName}</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Choose from our premium {variantName.toLowerCase()} varieties crafted with excellence and precision
          </p>
        </div>
        
        {/* Products Grid */}
        <TypesGrid 
          types={types} 
          onCardClick={(typeId) => {
            const selectedVariant = specificVariants.find(v => v._id === typeId);
            if (selectedVariant) {
              handleTypeClick(typeId, selectedVariant.name);
            }
          }} 
        />
      </main>
    </section>
  );
}
