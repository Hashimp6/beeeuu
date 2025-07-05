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
      className="bg-white rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
    >
      {/* Image Section */}
      <div className="relative h-32 sm:h-44 bg-gray-200">
        {profileImage ? (
          <img
            src={profileImage}
            alt={storeName}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-xs sm:text-sm font-semibold">
            {category}
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/90 px-2 py-1 rounded-xl shadow text-sm flex items-center gap-1">
          <Star className="text-yellow-400 fill-yellow-400" size={12} />
          <span className="text-gray-800 font-semibold text-xs">
            {averageRating || 0}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-4 pb-4 sm:pb-5">
        {/* Title & Category */}
        <div className="flex items-start justify-between mb-2 gap-2">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-1 flex-1">
            {storeName}
          </h3>
          <span className="bg-teal-600 text-white text-xs font-medium px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
            {category}
          </span>
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
            {description}
          </p>
        )}

        {/* Place and Distance */}
        <div className="flex items-center text-xs sm:text-sm text-gray-500 gap-2">
          <MapPin size={12} className="sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="line-clamp-1 flex-1">{place || "Unknown location"}</span>
          {distance && (
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {distance.toFixed(1)} km
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreCard;