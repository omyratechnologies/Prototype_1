import { useState } from "react";

/**
 * Reusable component for displaying truncated text with read more/less functionality
 * @param {string} description - The full text to display
 * @param {number} maxLength - Maximum number of characters before truncation
 * @param {string} fallbackText - Default text when description is empty
 * @param {string} className - Additional CSS classes
 */
export default function TruncatedDescription({ 
  description, 
  maxLength = 80, 
  fallbackText = "Premium granite products designed for commercial and residential applications.",
  className = "text-slate-600 text-sm leading-relaxed mb-4"
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const text = description || fallbackText;
  const shouldTruncate = text.length > maxLength;
  const displayText = isExpanded || !shouldTruncate 
    ? text 
    : `${text.slice(0, maxLength)}...`;

  const handleToggle = (e) => {
    e.stopPropagation(); // Prevent card click when clicking read more
    setIsExpanded(!isExpanded);
  };

  return (
    <p className={className}>
      {displayText}
      {shouldTruncate && (
        <button
          onClick={handleToggle}
          className="ml-1 text-blue-600 hover:text-blue-800 font-medium transition-colors underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
        >
          {isExpanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </p>
  );
}