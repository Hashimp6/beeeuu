import React, { useState } from 'react';
import { MapPin, MessageCircle, ChevronDown, Search, Filter, X } from 'lucide-react';
import MainAreaComponent from '../components/user/UserMainContent';
import LocationSelectionModal from '../components/LocationSelection';
import { useAuth } from '../context/UserContext';
import ChatApp from '../components/ChatSection';

const HomeLayout = () => {
    const { user } = useAuth(); // assuming this gives you the logged-in user

    const [userLocation, setUserLocation] = useState('Set location');
    const [chat, setChat] = useState(false);
    const [dropdowns, setDropdowns] = useState({
        distance: false,
        nearby: false,
        category: false
    });
    const [showModal, setShowModal] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState({
        distance: '20 km',
        nearby: 'Default',
        category: 'All Categories'
    });
    const [selectedLocation, setSelectedLocation] = useState(null);

    const handleLocationUpdate = (locationData) => {
        setSelectedLocation(locationData);
        setUserLocation(locationData.locationName || 'Current Location');
        setShowModal(false);
        console.log('Location updated:', locationData);
    };

    const openLocationModal = () => {
        console.log('Open location modal');
        setShowModal(true);
    };

    const closeModal = (locationData) => {
        if (locationData) {
            handleLocationUpdate(locationData);
        } else {
            setShowModal(false);
        }
    };

    const openChat = () => {
        setChat(prev => !prev);
        console.log('Toggle chat');
    };

    const toggleDropdown = (type) => {
        setDropdowns(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    const selectFilter = (type, value) => {
        setSelectedFilters(prev => ({
            ...prev,
            [type]: value
        }));
        setDropdowns(prev => ({
            ...prev,
            [type]: false
        }));
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Top Navbar - Mobile First */}
            <header className="w-full bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
                    {/* Left Corner: Logo */}
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="h-8 w-auto object-contain sm:h-10"
                    />

                    {/* Right Corner: Location & Message */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Location Button */}
                        <button
                            onClick={openLocationModal}
                            className="flex items-center bg-gray-100 hover:bg-gray-200 px-2 py-1.5 sm:px-4 sm:py-2 rounded-full transition-colors touch-manipulation"
                        >
                            <MapPin size={16} className="text-gray-600 sm:w-[18px] sm:h-[18px]" />
                            <span className="mx-1 sm:mx-2 text-sm sm:text-base text-gray-700 max-w-[80px] sm:max-w-[120px] truncate">
                                {userLocation}
                            </span>
                            <ChevronDown size={12} className="text-gray-500 sm:w-[14px] sm:h-[14px]" />
                        </button>

                        {/* Message Button */}
                        <button
                            onClick={openChat}
                            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
                        >
                            <MessageCircle size={20} className="text-gray-700 sm:w-[22px] sm:h-[22px]" />
                            {/* Optional: Add notification badge */}
                            {/* <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                3
                            </span> */}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {chat ? (
                    /* Chat Section - Mobile Optimized */
                    <div className="flex-1 flex items-center justify-center bg-gray-50 p-2 sm:p-4">
                        <div className="w-full max-w-4xl h-full sm:h-[80vh] bg-white rounded-none sm:rounded-lg shadow-none sm:shadow-lg overflow-hidden relative">
                            {/* Close button - Mobile optimized */}
                            <button
                                onClick={() => setChat(false)}
                                className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 touch-manipulation"
                                aria-label="Close chat"
                            >
                                <X size={20} className="text-gray-600 hover:text-gray-800" />
                            </button>
                            
                            <ChatApp />
                        </div>
                    </div>
                ) : (
                    /* Main Content - Mobile Optimized */
                    <div className="flex-1 overflow-auto">
                        <MainAreaComponent />
                    </div>
                )}
            </main>

            {/* Location Selection Modal */}
            <LocationSelectionModal
                visible={showModal}
                onClose={closeModal}
            />
        </div>
    );
};

export default HomeLayout;