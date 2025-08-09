import React, { useState, useEffect } from 'react';
import { MapPin, MessageCircle, ChevronDown, Search, Filter, X, Grid, Home, Phone, Menu, Layers, Info, BookOpen, User } from 'lucide-react';
import MainAreaComponent from '../components/user/UserMainContent';
import LocationSelectionModal from '../components/LocationSelection';
import { useAuth } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import OfferReelPage from './user/Offers';

const HomeLayout = () => {
    const navigate = useNavigate();
    const { user, location,setLocation, isAuthenticated } = useAuth(); // Add isAuthenticated check
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [showProfileMobile, setShowProfileMobile] = useState(false);
    const [userLocation, setUserLocation] = useState('Current Location');
    const [chat, setChat] = useState(false);
    const [showOffers, setShowOffers] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isGuest, setIsGuest] = useState(false);
    const [locationPromptShown, setLocationPromptShown] = useState(false);

    // Initialize location and guest status
    useEffect(() => {
        if (user?.place) {
            setUserLocation(user.place);
            setIsGuest(false);
        } else if (location?.place) {
            setUserLocation(location.place);
            setIsGuest(!isAuthenticated);
        } else {
            setIsGuest(!isAuthenticated);
            // Only show location prompt once for guests, and don't make it mandatory
            if (!isAuthenticated && !locationPromptShown) {
                setLocationPromptShown(true);
                // Optional: Show a gentler prompt instead of error
                toast('Select your location to see nearby stores', {
                    duration: 3000,
                    icon: '📍'
                });
            }
        }
    }, [user, location, isAuthenticated, locationPromptShown]);

    // Show offers by default on initial load
    useEffect(() => {
        setShowOffers(true);
    }, []);

    const handleSetSelect = () => {
        // Redirect to login if not authenticated
        if (!isAuthenticated) {
            toast.error('Please login to access your profile');
            navigate('/login');
            return;
        }
        setShowProfileMobile(true);
        setIsDrawerOpen(false);
    };

    const handleShowOffers = () => {
        setShowOffers(true);
        setIsDrawerOpen(false);
    };

    const handleBackToMain = () => {
        setShowOffers(false);
    };

    const handleLocationUpdate = (locationData) => {
        // For guest users, locationData is already in correct format from modal
        if (!isAuthenticated && locationData.place) {
          setLocation(locationData);
          setUserLocation(locationData.place);
        } else if (locationData.locationName) {
          // For logged-in users (if needed)
          const locationObj = {
            place: locationData.locationName,
            location: locationData.location
          };
          setLocation(locationObj);  // ✅ Update context
          setUserLocation(locationObj.place);  // ✅ Update display name
        }
        
        setShowModal(false);
      };
      

    const openLocationModal = () => {

        
        setShowModal(true);
    };

    const closeModal = (locationData) => {
        if (locationData) {
            handleLocationUpdate(locationData);
        } else {
            setShowModal(false);
        }
    };

    const navigateToHome = () => {

        setIsDrawerOpen(false);
    };

    const navigateToCategory = () => {

        setIsDrawerOpen(false);
    };

    const navigateToContact = () => {
      
        setIsDrawerOpen(false);
    };

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    const openChat = () => {
        // Redirect to login if not authenticated
        if (!isAuthenticated) {
            toast.error('Please login to access chat');
            navigate('/login');
            return;
        }
        navigate('/chat');
    };

    const handleLoginRedirect = () => {
        navigate('/login');
        setIsDrawerOpen(false);
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Top Navbar */}
            <header className="w-full bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
                    {/* Left Corner: Logo */}
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="h-8 w-auto object-contain sm:h-10"
                    />
  {/* Home / Offers Tabs */}
  <div className="flex justify-center border-b border-gray-200 bg-white">
                <div className="flex space-x-6 sm:space-x-8 px-4 py-2 sm:px-6 sm:py-3">
                    <button
                        onClick={handleBackToMain}
                        className={`text-sm font-medium ${
                            !showOffers ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-teal-600'
                        } transition-colors`}
                    >
                        Stores
                    </button>
                    <button
                        onClick={handleShowOffers}
                        className={`text-sm font-medium ${
                            showOffers ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-teal-600'
                        } transition-colors`}
                    >
                        Offers
                    </button>
                </div>
            </div>
                    {/* Right Corner: Location, Message & Mobile Menu */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Location Button - Hidden on small screens */}
                        <button
                            onClick={openLocationModal}
                            className="hidden sm:flex items-center bg-gray-100 hover:bg-gray-200 px-2 py-1.5 sm:px-4 sm:py-2 rounded-full transition-colors touch-manipulation"
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
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={toggleDrawer}
                            className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
                        >
                            <Menu size={20} className="text-gray-700" />
                        </button>
                    </div>
                </div>
            </header>

          

            {/* Guest User Notice */}
            {isGuest && (
                <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
                    <div className="flex items-center justify-between max-w-4xl mx-auto">
                        <div className="flex items-center gap-2">
                            <User size={16} className="text-blue-600" />
                            <span className="text-sm text-blue-800">
                                You're browsing as a guest. Login for full access.
                            </span>
                        </div>
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors"
                        >
                            Login
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col">
                <div className="flex-1 overflow-auto">
                    {showOffers ? (
                        <OfferReelPage />
                    ) : (
                        <MainAreaComponent
                            select={showProfileMobile}
                            onOpenOffers={handleShowOffers}
                            isGuest={isGuest}
                        />
                    )}
                </div>
            </main>

            {/* Location Selection Modal */}
            <LocationSelectionModal
                visible={showModal}
                onClose={closeModal}
            />

            {/* Mobile Drawer Overlay */}
            {isDrawerOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
                    onClick={toggleDrawer}
                />
            )}

            {/* Mobile Drawer */}
            <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
                isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
                {/* Drawer Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                    <button
                        onClick={toggleDrawer}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} className="text-gray-700" />
                    </button>
                </div>

                {/* Drawer Content */}
                <div className="p-4 space-y-4">
                    {/* Location in Mobile */}
                    <button
                        onClick={openLocationModal}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <MapPin size={18} className="text-gray-600" />
                            <span className="text-gray-700">{userLocation}</span>
                        </div>
                        <ChevronDown size={14} className="text-gray-500" />
                    </button>

                    {/* Navigation Items */}
                    <div className="space-y-2">
                        <button
                            onClick={navigateToHome}
                            className="group w-full flex items-center gap-3 p-3 rounded-lg bg-white hover:bg-teal-700 transition-colors text-left"
                        >
                            <Home size={18} className="text-gray-600 group-hover:text-white" />
                            <span className="text-gray-700 font-medium group-hover:text-white">Home</span>
                        </button>

                        <button
                            onClick={handleShowOffers}
                            className="group w-full flex items-center gap-3 p-3 rounded-lg bg-white hover:bg-teal-700 transition-colors text-left"
                        >
                            <Grid size={18} className="text-gray-600 group-hover:text-white" />
                            <span className="text-gray-700 font-medium group-hover:text-white">Offers</span>
                        </button>

                        {/* Profile or Login Button */}
                        {isAuthenticated ? (
                            <button
                                onClick={handleSetSelect}
                                className="group w-full flex items-center gap-3 p-3 rounded-lg bg-white hover:bg-teal-700 transition-colors text-left"
                            >
                                <User size={18} className="text-gray-600 group-hover:text-white" />
                                <span className="text-gray-700 font-medium group-hover:text-white">Profile</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleLoginRedirect}
                                className="group w-full flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-left border border-blue-200"
                            >
                                <User size={18} className="text-blue-600" />
                                <span className="text-blue-700 font-medium">Login / Register</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeLayout;