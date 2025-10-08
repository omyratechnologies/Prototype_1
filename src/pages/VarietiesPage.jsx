import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useProductsBySpecificVariant } from "../hooks/useProducts";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner, ErrorMessage, ProductGridSkeleton } from "../components/ui/Loading";
import EnhancedVarietiesGrid from "../components/varieties/EnhancedVarietiesGrid";
import Navbar from "../components/Navbar";

export default function VarietiesPage() {
  const { categoryId, typeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Get navigation state data
  const { variantId, variantName, specificVariantId, specificVariantName } = location.state || {};

  // Fetch products for this specific variant
  const { products, loading, error } = useProductsBySpecificVariant(specificVariantId);

  function handleVarietyClick(productId) {
    const selectedProduct = products.find(p => p._id === productId);
    if (selectedProduct) {
      const varietySlug = selectedProduct.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      navigate(`/products/${categoryId}/${typeId}/${varietySlug}`, {
        state: {
          variantId,
          variantName,
          specificVariantId,
          specificVariantName,
          productId,
          productName: selectedProduct.name
        }
      });
    }
  }

  // If no navigation state, show error
  if (!specificVariantId || !specificVariantName) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar user={user} onLogout={logout} />
        <main className="max-w-7xl mx-auto px-4 py-10">
          <div className="text-center py-8">
            <p className="text-gray-600">Invalid product variety. Please navigate from the product categories.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
            >
              Go Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar user={user} onLogout={logout} />
        <main className="max-w-7xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">{specificVariantName}</h1>
          <ProductGridSkeleton count={6} />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar user={user} onLogout={logout} />
        <main className="max-w-7xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">{specificVariantName}</h1>
          <ErrorMessage 
            error={error} 
            onRetry={() => window.location.reload()} 
          />
        </main>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar user={user} onLogout={logout} />
        <main className="max-w-7xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">{specificVariantName}</h1>
          <div className="text-center py-8">
            <p className="text-gray-600">No products available for this variety.</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Transform API data to match VarietiesGrid expected format
  const varieties = products.map(product => ({
    id: product._id,
    name: product.name,
    image: product.images?.[0] || '/patterns-blue-mist.png', // Use first image or fallback
    description: product.category || 'Premium granite product',
    details: {
      sizeOptions: [{
        size: `${product.dimensions?.length}x${product.dimensions?.width}x${product.dimensions?.thickness}`,
        weightPerPiece: product.weight_per_piece || 'N/A',
        piecesPerCrate: product.packaging?.pieces_per_crate || 1,
        price: product.pricing?.price_per_unit || 0,
        stock: product.stock || 0
      }],
      purchaseOptions: [
        { type: "crate", desc: `${product.packaging?.pieces_per_crate || 1} pieces - Recommended` },
        { type: "piece", desc: "Buy by Piece" }
      ]
    }
  }));

  return (
    <div className="bg-white min-h-screen">
      <Navbar user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-2">
          <ol className="flex space-x-2">
            <li>
              <button 
                onClick={() => navigate('/')}
                className="hover:text-black transition"
              >
                Products
              </button>
            </li>
            <li>/</li>
            <li>
              <button 
                onClick={() => navigate(-1)}
                className="hover:text-black transition"
              >
                {variantName}
              </button>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{specificVariantName}</li>
          </ol>
        </nav>

        {/* Heading */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {specificVariantName}
        </h1>

        {/* Description */}
        <p className="text-sm text-gray-600 max-w-2xl mb-10">
          Browse our collection of {specificVariantName.toLowerCase()} products. Each piece is crafted with precision and quality.
        </p>

        {/* Card grid */}
        <EnhancedVarietiesGrid varieties={varieties} onCardClick={handleVarietyClick} />
      </main>
    </div>
  );
}
