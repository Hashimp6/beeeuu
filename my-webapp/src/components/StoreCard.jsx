import { MapPin, Star } from "lucide-react";

const StoreCard = ({ store, onCardClick }) => {
  const {
    _id,
    storeName,
    profileImage,
    averageRating,
    category,
    description,
    place,
    distance,
  } = store;

  return (
    <div
      onClick={() => onCardClick(store)}
      className="group relative bg-white rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-gray-200 transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-1"
    >
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-gray-50/30 pointer-events-none z-10 opacity-0 group-hover:opacity-150 transition-opacity duration-500"></div>
      
      {/* Image Section with enhanced styling */}
      <div className="relative h-40 sm:h-52 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {profileImage ? (
          <img
            src={profileImage}
            alt={storeName}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm sm:text-base font-bold bg-gradient-to-br from-teal-50 to-teal-100 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-teal-600/20"></div>
            <span className="relative z-10 text-teal-600">{category}</span>
          </div>
        )}
        
        {/* Enhanced Rating Badge */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-2xl shadow-lg border border-white/50 text-sm flex items-center gap-1.5 transform transition-all duration-300 group-hover:scale-105">
          <Star className="text-amber-400 fill-amber-400" size={14} />
          <span className="text-gray-800 font-bold text-sm">
            {averageRating || 0}
          </span>
        </div>

        {/* Distance Badge */}
        {distance && (
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-xl text-xs font-medium transform transition-all duration-300 group-hover:scale-105">
            {distance.toFixed(1)} km
          </div>
        )}
      </div>

      {/* Compact Content Section */}
      <div className="p-3 sm:p-4 relative z-20">
        {/* Title & Category - tighter layout */}
        <div className="flex items-start justify-between mb-2 gap-2">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-1 flex-1 leading-tight group-hover:text-teal-700 transition-colors duration-300">
            {storeName}
          </h3>
          <span className="bg-gradient-to-r from-teal-500 to-teal-600 text-white text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap shadow-md transform transition-all duration-300 group-hover:from-teal-600 group-hover:to-teal-700">
            {category}
          </span>
        </div>

        {/* Description - compact */}
        {description && (
          <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-1 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
            {description}
          </p>
        )}

        {/* Compact Place section */}
        <div className="flex items-center text-xs sm:text-sm text-gray-600 gap-1.5">
          <MapPin size={12} className="text-teal-600 flex-shrink-0" />
          <span className="line-clamp-1 font-medium flex-1 group-hover:text-gray-800 transition-colors duration-300">
            {place || "Unknown location"}
          </span>
        </div>
      </div>

      {/* Subtle bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-teal-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
    </div>
  );
};

export default StoreCard;