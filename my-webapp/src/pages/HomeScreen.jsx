import React, { useState } from 'react';
import { MapPin, MessageCircle, ChevronDown, Search, Filter } from 'lucide-react';
import MainAreaComponent from '../components/user/UserMainContent';

const HomeLayout = () => {
    const [userLocation, setUserLocation] = useState('Set location');
    const [dropdowns, setDropdowns] = useState({
        distance: false,
        nearby: false,
        category: false
    });
    const [selectedFilters, setSelectedFilters] = useState({
        distance: '20 km',
        nearby: 'Default',
        category: 'All Categories'
    });

    const openLocationModal = () => {
        console.log('Open location modal');
    };

    const openChat = () => {
        console.log('Open chat');
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
        <div className="flex flex-col h-screen bg-white">
            {/* Top Navbar */}
            <header className="w-full bg-white shadow-sm border-b border-gray-200">
                <div className="flex items-center justify-between px-6 py-4">
                    {/* Left Corner: Logo */}
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="h-10 w-auto object-contain"
                    />

                    {/* Right Corner: Location & Message */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={openLocationModal}
                            className="flex items-center bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition-colors"
                        >
                            <MapPin size={18} className="text-gray-600" />
                            <span className="mx-2 text-base text-gray-700 max-w-[120px] truncate">
                                {userLocation}
                            </span>
                            <ChevronDown size={14} className="text-gray-500" />
                        </button>

                        <button
                            onClick={openChat}
                            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <MessageCircle size={22} className="text-gray-700" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <MainAreaComponent/>
        </div>
    );
};

export default HomeLayout;