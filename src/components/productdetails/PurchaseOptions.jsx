import { useState } from "react";
import { useCart } from "../../context/EnhancedCartContext";

export default function PurchaseOptions({ purchaseOptions, product }) {
  const { addToCart } = useCart();
  const [selected, setSelected] = useState(purchaseOptions[0].type);
  const [qty, setQty] = useState(1);

  function handleAddToCart() {
    const selectedOption = purchaseOptions.find(opt => opt.type === selected);
    if (!selectedOption) return;

    const item = {
      id: product.id,
      name: product.name,
      image: product.image,
      selectedSizeId: selectedOption.sizeId,
      size: selectedOption.sizeLabel,
      weightPerPiece: selectedOption.weightPerPiece,
      piecesPerCrate: selectedOption.piecesPerCrate,
      pricePerPiece: selectedOption.pricePerPiece,
      crateQty: qty,
      pieceQty: 0 // You can later allow pieceQty selection if needed
    };

    addToCart(item);
  }

  return (
    <div className="mt-6">
      <div className="mb-2 font-medium">Purchase Options:</div>
      <div className="flex gap-4 mb-4">
        {purchaseOptions.map(opt => (
          <label key={opt.type} className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="purchase"
              value={opt.type}
              checked={selected === opt.type}
              onChange={() => setSelected(opt.type)}
              className="accent-black"
            />
            <span className="text-sm">{opt.desc}</span>
          </label>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-3">
        <span>Quantity:</span>
        <button type="button" className="border px-2" onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
        <span>{qty}</span>
        <button type="button" className="border px-2" onClick={() => setQty(q => q + 1)}>+</button>
      </div>
      <button
        onClick={handleAddToCart}
        className="mt-5 w-full bg-black text-white rounded py-3 font-semibold"
      >
        Add to Cart
      </button>
    </div>
  );
}
