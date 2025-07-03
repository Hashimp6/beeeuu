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
      <div className="relative h-44 bg-gray-200">
        {profileImage ? (
          <img
            src={profileImage}
            alt={storeName}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm font-semibold">
            {category}
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-xl shadow text-sm flex items-center gap-1">
          <Star className="text-yellow-400 fill-yellow-400" size={14} />
          <span className="text-gray-800 font-semibold text-xs">
            {averageRating || 0}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 pb-5">
        {/* Title & Category */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
            {storeName}
          </h3>
          <span className="bg-teal-600 text-white text-xs font-medium px-3 py-1 rounded-full">
            {category}
          </span>
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {description}
          </p>
        )}

        {/* Place and Distance */}
        <div className="flex items-center text-sm text-gray-500 gap-2">
          <MapPin size={14} />
          <span className="line-clamp-1">{place || "Unknown location"}</span>
          <span className="ml-auto text-xs text-gray-500">
            {distance ? `${distance.toFixed(1)} km` : null}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StoreCard;
