import ProductTypeCard from "./ProductTypeCard";

export default function TypesGrid({ types, onCardClick }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8 justify-items-center">
      {types.map(type => (
        <ProductTypeCard key={type.id} type={type} onClick={() => onCardClick(type.id)} />
      ))}
    </div>
  );
}
