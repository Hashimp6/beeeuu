import React, { useState } from 'react';
import { MapPin, MessageCircle, ChevronDown, Search, Filter } from 'lucide-react';

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
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar with Improved Dropdowns - Increased width */}
                <div className="w-80 bg-gray-50 border-r border-gray-200 p-6 flex flex-col gap-6">
                    {/* Filter Header */}
                    <div className="flex items-center gap-2 pb-4 border-b border-gray-200">
                        <Filter size={20} className="text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                    </div>

                    {/* Distance Filter Dropdown */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Distance</label>
                        <button
                            onClick={() => toggleDropdown('distance')}
                            className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-3 text-left hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                        >
                            <span className="text-gray-700">{selectedFilters.distance}</span>
                            <ChevronDown 
                                size={16} 
                                className={`text-gray-500 transition-transform ${dropdowns.distance ? 'rotate-180' : ''}`} 
                            />
                        </button>
                        
                        {dropdowns.distance && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {[5, 10, 20, 50, 100, 250, 500].map((dist) => (
                                    <button
                                        key={dist}
                                        onClick={() => selectFilter('distance', `${dist} km`)}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors ${selectedFilters.distance === `${dist} km` ? 'bg-teal-50 text-teal-700' : 'text-gray-700'}`}
                                    >
                                        {dist} km
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Nearby/Sort Filter Dropdown */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                        <button
                            onClick={() => toggleDropdown('nearby')}
                            className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-3 text-left hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                        >
                            <span className="text-gray-700">{selectedFilters.nearby}</span>
                            <ChevronDown 
                                size={16} 
                                className={`text-gray-500 transition-transform ${dropdowns.nearby ? 'rotate-180' : ''}`} 
                            />
                        </button>
                        
                        {dropdowns.nearby && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                                {['Default', 'Rating', 'Distance', 'Newest', 'Most Popular'].map((item) => (
                                    <button
                                        key={item}
                                        onClick={() => selectFilter('nearby', item)}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors ${selectedFilters.nearby === item ? 'bg-teal-50 text-teal-700' : 'text-gray-700'}`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Category Filter Dropdown */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <button
                            onClick={() => toggleDropdown('category')}
                            className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-3 text-left hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                        >
                            <span className="text-gray-700">{selectedFilters.category}</span>
                            <ChevronDown 
                                size={16} 
                                className={`text-gray-500 transition-transform ${dropdowns.category ? 'rotate-180' : ''}`} 
                            />
                        </button>
                        
                        {dropdowns.category && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                                {['All Categories', 'Beauty', 'Food', 'Gift', 'Shopping', 'Health', 'Services'].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => selectFilter('category', cat)}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors ${selectedFilters.category === cat ? 'bg-teal-50 text-teal-700' : 'text-gray-700'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Clear Filters Button */}
                    <button 
                        onClick={() => setSelectedFilters({distance: '20 km', nearby: 'Default', category: 'All Categories'})}
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Clear All Filters
                    </button>
                </div>

                {/* Center Content */}
                <div className="flex-1 p-6 overflow-auto bg-gray-50">
                    {/* Search Bar */}
                    <div className="mb-6 flex justify-center">
    <div className="relative max-w-2xl w-full">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
            type="text"
            placeholder="Search for services, restaurants, shops..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
        />
    </div>
</div>


                    {/* Grid of Cards & Pills */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {/* Card 1 - Rectangle */}
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                            <div className="h-32 bg-gray-200 rounded-t-lg flex items-center justify-center">
                                <span className="text-gray-600 font-medium">Card 1</span>
                            </div>
                            <div className="p-4">
                                <h3 className="font-medium text-gray-800">Service Title</h3>
                                <p className="text-sm text-gray-600 mt-1">Brief description</p>
                            </div>
                        </div>

                        {/* Card 2 - Pill */}
                        <div className="bg-white border border-gray-200 rounded-full px-6 py-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-center">
                            <span className="text-gray-700 font-medium">Card 2</span>
                        </div>

                        {/* Card 3 - Pill */}
                        <div className="bg-white border border-gray-200 rounded-full px-6 py-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-center">
                            <span className="text-gray-700 font-medium">Card 3</span>
                        </div>

                        {/* Card 4 - Pill */}
                        <div className="bg-white border border-gray-200 rounded-full px-6 py-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-center">
                            <span className="text-gray-700 font-medium">Card 4</span>
                        </div>

                        {/* Card 5 - Rectangle */}
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                            <div className="h-32 bg-gray-200 rounded-t-lg flex items-center justify-center">
                                <span className="text-gray-600 font-medium">Card 5</span>
                            </div>
                            <div className="p-4">
                                <h3 className="font-medium text-gray-800">Service Title</h3>
                                <p className="text-sm text-gray-600 mt-1">Brief description</p>
                            </div>
                        </div>

                        {/* Additional Cards */}
                        <div className="bg-white border border-gray-200 rounded-full px-6 py-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-center">
                            <span className="text-gray-700 font-medium">Card 6</span>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="w-32 bg-gray-50 border-l border-gray-200 p-4 flex flex-col items-center gap-4">
                    <div className="w-16 h-24 bg-gray-300 rounded-lg flex items-center justify-center text-gray-600 text-sm font-medium">
                        Ad
                    </div>
                    <button className="w-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                        Apply
                    </button>
                    <button className="w-full bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                        Open
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomeLayout;