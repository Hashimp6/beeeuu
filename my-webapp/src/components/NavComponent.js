import React, { useState } from 'react';
import {
  Home,
  Search,
  User,
  MapPin,
  MessageCircle,
  ChevronDown,
} from 'lucide-react';

const Nav = () => {
  const [userLocation, setUserLocation] = useState('Set location');

  const openLocationModal = () => {
    console.log('Open location modal');
  };

  const openChat = () => {
    console.log('Open chat');
  };

  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-12 w-auto object-contain"
          />
        </div>

        {/* Right Section: Location & Chat */}
        <div className="flex items-center gap-4">
          {/* Location Selector */}
          <button
            onClick={openLocationModal}
            className="flex items-center bg-gray-100 hover:bg-gray-200 px-4 py-1.5 rounded-full transition"
          >
            <MapPin size={18} className="text-gray-600" />
            <span className="mx-2 text-sm text-gray-700 max-w-[120px] truncate">
              {userLocation}
            </span>
            <ChevronDown size={14} className="text-gray-500" />
          </button>

          {/* Chat Icon */}
          <button
            onClick={openChat}
            className="relative p-2 rounded-full hover:bg-gray-100 transition"
          >
            <MessageCircle size={22} className="text-gray-700" />
            {/* Optional Notification Badge */}
            {/* 
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
              2
            </span> 
            */}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Nav;
