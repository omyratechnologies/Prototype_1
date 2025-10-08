import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useProduct, usePricingCalculation } from "../hooks/useEnhancedProducts";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/EnhancedCartContext";
import { LoadingSpinner, ErrorMessage } from "../components/ui/Loading";
import NavBar from "../components/Navbar";

export default function EnhancedProductDetailPage() {
  const { categoryId, typeId, varietyId } = useParams();
  const { user, logout } = useAuth();
  const { addToCart, businessCalculation, shippingValidation } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Get navigation state data
  const { productId, productName } = location.state || {};

  // Fetch product details and business config from API
  const { product, businessConfig, loading, error } = useProduct(productId);

  // Component state
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);
  const [crateQty, setCrateQty] = useState(0);
  const [pieceQty, setPieceQty] = useState(0);
  const [showWarning, setShowWarning] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSizeError, setShowSizeError] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Get real-time pricing calculation
  const { pricing, loading: pricingLoading } = usePricingCalculation(
    productId, 
    crateQty, 
    pieceQty
  );

  // Set initial image when product loads
  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      setSelectedImage(product.images[0]);
    }
  }, [product]);

  // Create size options from product data (enhanced for multiple sizes)
  const sizeOptions = useMemo(() => {
    if (!product) return [];

    // Check if product has multiple size variants
    if (product.has_multiple_sizes && product.size_variants) {
      return product.size_variants.map(variant => ({
        id: variant.size_name,
        size: variant.size_name,
        dimensions: variant.dimensions,
        weightPerPiece: variant.weight_per_piece,
        piecesPerCrate: product.business_config?.pieces_per_crate || 10,
        price: variant.price_per_piece,
        pricePerSqft: variant.price_per_sqft,
        stock: variant.stock,
        sku: variant.sku
      }));
    } else {
      // Legacy single size support
      return [{
        id: 'default',
        size: `${product.dimensions?.length || 0}×${product.dimensions?.width || 0}×${product.dimensions?.thickness || 0}`,
        dimensions: product.dimensions,
        weightPerPiece: product.weight_per_piece || 1,
        piecesPerCrate: product.packaging?.pieces_per_crate || product.business_config?.pieces_per_crate || 10,
        price: product.pricing?.price_per_unit || product.basePrice || 0,
        pricePerSqft: product.pricing?.price_per_sqft,
        stock: product.stock || 0,
        sku: product.sku
      }];
    }
  }, [product]);

  // Enhanced calculations using business logic
  const calculations = useMemo(() => {
    if (!selectedSize || (!crateQty && !pieceQty)) {
      return {
        totalPieces: 0,
        totalCrates: 0,
        fillerPieces: 0,
        totalWeight: 0,
        subtotal: 0,
        fillerCharges: 0,
        finalTotal: 0,
        pricePerSqft: 0
      };
    }

    const piecesPerCrate = selectedSize.piecesPerCrate;
    const piecesFromCrates = crateQty * piecesPerCrate;
    const totalPieces = piecesFromCrates + pieceQty;
    
    // Calculate filler pieces (business logic)
    const remainder = totalPieces % piecesPerCrate;
    const fillerPieces = remainder === 0 ? 0 : piecesPerCrate - remainder;
    const totalCrates = Math.ceil(totalPieces / piecesPerCrate);
    
    // Use pricing calculation if available, otherwise fallback to basic calculation
    if (pricing && !pricingLoading) {
      return {
        totalPieces,
        totalCrates,
        fillerPieces: pricing.fillerPieces || fillerPieces,
        totalWeight: pricing.totalWeight || (totalPieces * selectedSize.weightPerPiece),
        subtotal: pricing.subtotal || (totalPieces * selectedSize.price),
        fillerCharges: pricing.fillerCharges || (fillerPieces * selectedSize.price * 0.5),
        finalTotal: pricing.finalTotal || (totalPieces * selectedSize.price),
        pricePerSqft: selectedSize.pricePerSqft || 0,
        discountPercent: pricing.discountPercent || 0,
        discountAmount: pricing.discountAmount || 0
      };
    }

    // Fallback basic calculation
    const totalWeight = totalPieces * selectedSize.weightPerPiece;
    const subtotal = totalPieces * selectedSize.price;
    const fillerCharges = fillerPieces * selectedSize.price * 0.5;
    const finalTotal = subtotal + fillerCharges;

    return {
      totalPieces,
      totalCrates,
      fillerPieces,
      totalWeight,
      subtotal,
      fillerCharges,
      finalTotal,
      pricePerSqft: selectedSize.pricePerSqft || 0
    };
  }, [selectedSize, crateQty, pieceQty, pricing, pricingLoading]);

  // Enhanced weight validation
  const weightValidation = useMemo(() => {
    const maxWeight = businessConfig?.max_shipping_weight || 48000;
    const { totalWeight } = calculations;
    
    if (totalWeight > maxWeight) {
      return {
        exceedsLimit: true,
        message: `⚠️ Your order weighs ${totalWeight.toLocaleString()} lbs, exceeding the ${maxWeight.toLocaleString()} lbs shipping limit. Pickup will be required.`,
        forcePickup: true,
        allowShipping: false
      };
    }

    if (totalWeight > maxWeight * 0.8) {
      return {
        exceedsLimit: false,
        message: `⚠️ Your order weighs ${totalWeight.toLocaleString()} lbs. Consider pickup for orders over ${maxWeight.toLocaleString()} lbs.`,
        forcePickup: false,
        allowShipping: true,
        warning: true
      };
    }

    return {
      exceedsLimit: false,
      message: '',
      forcePickup: false,
      allowShipping: true
    };
  }, [calculations, businessConfig]);

  // If no navigation state, show error
  if (!productId || !productName) {
    return (
      <div className="bg-white min-h-screen relative">
        <NavBar user={user} onLogout={logout} />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <p className="text-gray-600">Invalid product. Please navigate from the product varieties.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white min-h-screen relative">
        <NavBar user={user} onLogout={logout} />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen relative">
        <NavBar user={user} onLogout={logout} />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <ErrorMessage 
            error={error} 
            onRetry={() => window.location.reload()} 
          />
        </div>
      </div>
    );
  }

  // Handle "product not found" gracefully
  if (!product) {
    return (
      <div className="bg-white min-h-screen relative">
        <NavBar user={user} onLogout={logout} />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <p className="text-gray-600">Product not found.</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!selectedSize) {
      setShowSizeError(true);
      setTimeout(() => setShowSizeError(false), 3000);
      return;
    }

    if (calculations.totalPieces === 0) {
      alert("Please select at least one piece or crate.");
      return;
    }

    // Check stock availability
    if (selectedSize.stock < calculations.totalPieces) {
      alert(`Insufficient stock. Available: ${selectedSize.stock}, Requested: ${calculations.totalPieces}`);
      return;
    }

    // Check weight limits
    if (weightValidation.exceedsLimit) {
      setShowConfirmModal(true);
    } else {
      await actuallyAddToCart();
    }
  };

  const actuallyAddToCart = async () => {
    try {
      setAddingToCart(true);
      
      // Enhanced metadata for business logic
      const metadata = {
        crateQty,
        pieceQty,
        piecesPerCrate: selectedSize.piecesPerCrate,
        selectedSize: selectedSize.id,
        weight: calculations.totalWeight,
        fillerPieces: calculations.fillerPieces,
        fillerCharges: calculations.fillerCharges
      };

      await addToCart(product._id, crateQty, pieceQty, metadata);
      
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.message || 'Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="bg-white min-h-screen relative">
      <NavBar user={user} onLogout={logout} />
      <div className="max-w-6xl mx-auto p-4 pt-8">
        {/* Enhanced Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <span onClick={() => navigate("/")} className="cursor-pointer hover:text-black">
            Home
          </span>
          {" > "}
          <span onClick={() => navigate(-3)} className="cursor-pointer hover:text-black">
            Products
          </span>
          {" > "}
          <span onClick={() => navigate(-2)} className="cursor-pointer hover:text-black">
            {product.variantSpecificId?.variantId?.name || 'Category'}
          </span>
          {" > "}
          <span onClick={() => navigate(-1)} className="cursor-pointer hover:text-black">
            {product.variantSpecificId?.name || 'Variety'}
          </span>
          {" > "}
          <span className="text-black">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Enhanced Images Section */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={selectedImage || "/granite-landscaping-products.png"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className={`flex-shrink-0 w-20 h-20 bg-gray-100 rounded border-2 overflow-hidden
                      ${selectedImage === image ? "border-black" : "border-gray-200"}
                    `}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Enhanced Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-gray-600">
                {product.variantSpecificId?.variantId?.name} • {product.variantSpecificId?.name}
              </p>
              {product.category && (
                <p className="text-sm text-gray-500 mt-1">Category: {product.category}</p>
              )}
            </div>

            {/* Enhanced Size Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                Size (L × W × T)
              </label>
              <div className="grid gap-2">
                {sizeOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSize(option)}
                    className={`p-3 border rounded text-left transition-colors
                      ${selectedSize === option
                        ? "border-black bg-black text-white"
                        : "border-gray-300 bg-white hover:border-gray-400"
                      }
                      ${option.stock === 0 ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                    disabled={option.stock === 0}
                  >
                    <div className="flex justify-between items-center">
                      <span>{option.size} {option.dimensions?.unit || 'in'}</span>
                      <span className="font-semibold">₹{option.price.toLocaleString()}/piece</span>
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {option.weightPerPiece}lbs/piece • {option.piecesPerCrate} pieces/crate
                      {option.pricePerSqft && ` • ₹${option.pricePerSqft}/sqft`}
                    </div>
                    <div className="text-xs opacity-70">
                      Stock: {option.stock === 0 ? 'Out of Stock' : `${option.stock} available`}
                      {option.sku && ` • SKU: ${option.sku}`}
                    </div>
                  </button>
                ))}
              </div>
              {showSizeError && (
                <p className="text-red-500 text-sm">Please select a size first.</p>
              )}
            </div>

            {/* Enhanced Quantity Selection */}
            {selectedSize && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Select Quantity</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Crates ({selectedSize.piecesPerCrate} pieces each)
                    </label>
                    <div className="flex items-center border border-gray-300 rounded">
                      <button
                        onClick={() => setCrateQty(Math.max(0, crateQty - 1))}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                        disabled={addingToCart}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={crateQty}
                        onChange={(e) => setCrateQty(Math.max(0, parseInt(e.target.value) || 0))}
                        className="flex-1 px-3 py-2 text-center border-0 focus:ring-0"
                        min="0"
                        disabled={addingToCart}
                      />
                      <button
                        onClick={() => setCrateQty(crateQty + 1)}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                        disabled={addingToCart}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Individual Pieces
                    </label>
                    <div className="flex items-center border border-gray-300 rounded">
                      <button
                        onClick={() => setPieceQty(Math.max(0, pieceQty - 1))}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                        disabled={addingToCart}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={pieceQty}
                        onChange={(e) => setPieceQty(Math.max(0, parseInt(e.target.value) || 0))}
                        className="flex-1 px-3 py-2 text-center border-0 focus:ring-0"
                        min="0"
                        disabled={addingToCart}
                      />
                      <button
                        onClick={() => setPieceQty(pieceQty + 1)}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                        disabled={addingToCart}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Enhanced Total Summary with Business Logic */}
                {calculations.totalPieces > 0 && (
                  <div className="bg-gray-50 p-4 rounded space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Pieces:</span>
                      <span className="font-medium">{calculations.totalPieces}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Crates:</span>
                      <span className="font-medium">{calculations.totalCrates}</span>
                    </div>
                    {calculations.fillerPieces > 0 && (
                      <>
                        <div className="flex justify-between text-sm text-orange-600">
                          <span>Filler Pieces:</span>
                          <span className="font-medium">{calculations.fillerPieces}</span>
                        </div>
                        <div className="flex justify-between text-sm text-orange-600">
                          <span>Filler Charges (50%):</span>
                          <span className="font-medium">₹{calculations.fillerCharges.toLocaleString()}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Total Weight:</span>
                      <span className="font-medium">{calculations.totalWeight.toLocaleString()} lbs</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span className="font-medium">₹{calculations.subtotal.toLocaleString()}</span>
                    </div>
                    {calculations.discountPercent > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount ({calculations.discountPercent}%):</span>
                        <span className="font-medium">-₹{calculations.discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total Cost:</span>
                      <span>₹{calculations.finalTotal.toLocaleString()}</span>
                    </div>
                    {calculations.pricePerSqft > 0 && (
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Price per sqft:</span>
                        <span>₹{calculations.pricePerSqft}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Enhanced Weight Warning */}
                {weightValidation.message && showWarning && (
                  <div className={`border p-3 rounded ${
                    weightValidation.exceedsLimit 
                      ? 'bg-red-50 border-red-200' 
                      : weightValidation.warning 
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`font-medium ${
                          weightValidation.exceedsLimit ? 'text-red-800' : 'text-yellow-800'
                        }`}>
                          {weightValidation.exceedsLimit ? 'Shipping Not Available' : 'Weight Notice'}
                        </h4>
                        <p className={`text-sm ${
                          weightValidation.exceedsLimit ? 'text-red-700' : 'text-yellow-700'
                        }`}>
                          {weightValidation.message}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowWarning(false)}
                        className={`${
                          weightValidation.exceedsLimit ? 'text-red-500 hover:text-red-700' : 'text-yellow-500 hover:text-yellow-700'
                        }`}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || calculations.totalPieces === 0 || addingToCart || selectedSize?.stock === 0}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2
                ${!selectedSize || calculations.totalPieces === 0 || selectedSize?.stock === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : addedToCart
                  ? "bg-green-600 text-white"
                  : addingToCart
                  ? "bg-gray-600 text-white"
                  : "bg-black text-white hover:bg-gray-800"
                }
              `}
            >
              {addingToCart && <LoadingSpinner size="sm" />}
              {addingToCart ? "Adding to Cart..." : addedToCart ? "✓ Added to Cart!" : "Add to Cart"}
            </button>

            {/* Enhanced Product Specifications */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Product Specifications</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Material:</span>
                  <span className="ml-2 font-medium">{product.material || 'Granite'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Category:</span>
                  <span className="ml-2 font-medium">{product.category || 'Pattern'}</span>
                </div>
                {product.finish && product.finish.length > 0 && (
                  <div>
                    <span className="text-gray-600">Finish:</span>
                    <span className="ml-2 font-medium">{product.finish.join(', ')}</span>
                  </div>
                )}
                {product.applications && product.applications.length > 0 && (
                  <div>
                    <span className="text-gray-600">Applications:</span>
                    <span className="ml-2 font-medium">{product.applications.join(', ')}</span>
                  </div>
                )}
                {selectedSize?.dimensions && (
                  <>
                    <div>
                      <span className="text-gray-600">Dimensions:</span>
                      <span className="ml-2 font-medium">
                        {selectedSize.dimensions.length}×{selectedSize.dimensions.width}×{selectedSize.dimensions.thickness} {selectedSize.dimensions.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Weight/Piece:</span>
                      <span className="ml-2 font-medium">{selectedSize.weightPerPiece} lbs</span>
                    </div>
                  </>
                )}
              </div>
              
              {/* Business Configuration Display */}
              {businessConfig && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <h4 className="text-sm font-medium text-gray-800 mb-2">Business Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>Pieces per crate: {businessConfig.pieces_per_crate}</div>
                    <div>Filler rate: {(businessConfig.filler_rate * 100)}%</div>
                    <div>Max shipping weight: {businessConfig.max_shipping_weight?.toLocaleString()} lbs</div>
                    <div>Weight unit: {businessConfig.weight_unit}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Heavy Order Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Weight Limit Exceeded</h2>
            <p className="text-sm text-gray-600 mb-4">
              {weightValidation.message}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              This order must be picked up from our location. Shipping is not available for orders over the weight limit.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowConfirmModal(false);
                  await actuallyAddToCart();
                }}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-900"
              >
                Add to Cart (Pickup Required)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Required Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold mb-4">Login Required</h2>
            <p className="text-sm text-gray-600 mb-4">
              You must log in to add items to your cart and see personalized pricing.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowLoginModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  navigate("/login", {
                    state: { from: location.pathname },
                  });
                }}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-900"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}