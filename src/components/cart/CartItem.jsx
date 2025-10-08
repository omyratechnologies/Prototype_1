import { useCart } from "../../context/EnhancedCartContext";

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  const totalPieces = item.crateQty * item.piecesPerCrate + item.pieceQty;
  const totalPrice = totalPieces * item.pricePerPiece;

  return (
    <div className="flex items-start justify-between border-b py-4">
      {/* Left image */}
      <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded" />

      {/* Middle details */}
      <div className="flex-1 px-4">
        <h3 className="font-bold">{item.name}</h3>
        <p className="text-sm text-gray-500">
          {item.size} | {item.weightPerPiece} lbs/piece | {item.piecesPerCrate} pcs/crate
        </p>

        {/* Quantity controls */}
        <div className="mt-2 flex gap-4">
          <div>
            <label className="block text-xs text-gray-500">Crates</label>
            <input
              type="number"
              value={item.crateQty}
              min="0"
              className="border rounded w-16 px-2"
              onChange={e => updateQuantity(item.id, item.selectedSizeId, parseInt(e.target.value) || 0, item.pieceQty)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Pieces</label>
            <input
              type="number"
              value={item.pieceQty}
              min="0"
              className="border rounded w-16 px-2"
              onChange={e => updateQuantity(item.id, item.selectedSizeId, item.crateQty, parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={() => removeFromCart(item.id, item.selectedSizeId)}
          className="mt-2 text-red-500 text-sm hover:underline"
        >
          Remove
        </button>
      </div>

      {/* Right price */}
      <div className="text-right">
        <p className="font-bold">${totalPrice.toFixed(2)}</p>
        <p className="text-xs text-gray-500">
          ${item.pricePerPiece}/piece × {totalPieces} pcs
        </p>
      </div>
    </div>
  );
}
