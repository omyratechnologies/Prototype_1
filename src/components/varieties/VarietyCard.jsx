import TruncatedDescription from "../ui/TruncatedDescription";

export default function VarietyCard({ variety, onViewProduct }) {
  return (
    <div className="business-card group cursor-pointer w-full max-w-xs">
      <img
        src={variety.image}
        alt={variety.name}
        className="w-full h-48 object-cover rounded-t-xl"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
          {variety.name}
        </h3>
        <TruncatedDescription 
          description={variety.description}
          maxLength={60}
          className="text-slate-600 text-sm leading-relaxed mb-4"
        />
        <button
          onClick={onViewProduct}
          className="business-button-primary w-full text-sm"
        >
          Get Quote
        </button>
      </div>
    </div>
  );
}
