import TruncatedDescription from "../ui/TruncatedDescription";

export default function ProductTypeCard({ type, onClick }) {
  return (
    <div
      className="group cursor-pointer transition-all duration-300 hover:scale-105 max-w-sm w-full"
      onClick={onClick}
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100">
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <img 
            src={type.image} 
            alt={type.name} 
            className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Title Badge */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center px-6 py-2 bg-slate-100 border border-slate-200 rounded-full group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors duration-300">
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors duration-300">
                {type.name}
              </h2>
            </div>
          </div>
          
          {/* Description */}
          <div className="text-center">
            <TruncatedDescription 
              description={type.description}
              maxLength={80}
              className="text-slate-600 text-sm leading-relaxed"
            />
          </div>
          
          {/* Call to Action */}
          <div className="mt-6 flex justify-center">
            <div className="inline-flex items-center text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors duration-300">
              <span>View Varieties</span>
              <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
