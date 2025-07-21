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
    const { user } = useAuth(); // assuming this gives you the logged-in user
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
      const [showProfileMobile, setShowProfileMobile] = useState(false);
    const [userLocation, setUserLocation] = useState(user?.place || 'Current Location');
    const [chat, setChat] = useState(false);
    const [showOffers, setShowOffers] = useState(false);
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
    useEffect(() => {
        if (user?.place) {
            setUserLocation(user.place);
        }
        else{
            toast.error('Please select your location');
            setShowModal(true); 
        }
    }, [user]);
const handleSetSelect= () => {
  setShowProfileMobile(true);
  setIsDrawerOpen(false); 
};
const handleShowOffers = () => {
    setShowOffers(true);
    setIsDrawerOpen(false); // close drawer if opened
};
const handleBackToMain = () => {
    setShowOffers(false);
};

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
    const navigateToHome = () => {
        // In a real app, you'd use router.push('/home') or navigate('/home')
        console.log("Navigating to /home");
        setIsDrawerOpen(false);
    };

    const navigateToCategory = () => {
        console.log("Navigating to category");
        setIsDrawerOpen(false);
    };

    const navigateToContact = () => {
        console.log("Navigating to contact");
        setIsDrawerOpen(false);
    };

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
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

                    {/* Center: Desktop Navigation */}
             {/* Desktop Tabs */}
<div className="hidden md:flex justify-center border-b border-gray-200 bg-white">
  <div className="flex space-x-8 px-6 py-3">
    <button
      onClick={handleBackToMain}
      className={`text-sm font-medium ${
        !showOffers ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-teal-600'
      } transition-colors`}
    >
      Home
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
      onClick={() => navigate('/chat')}
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

            {/* Main Content Area */}
          {/* Main Content Area */}
<main className="flex-1 flex flex-col">

<div className="flex-1 overflow-auto">
  {showOffers ? (
  
        <OfferReelPage />
   
  ) : (
    <MainAreaComponent
      select={showProfileMobile}
      onOpenOffers={handleShowOffers}
    />
  )}
</div>
</main>


            {/* Location Selection Modal */}
            <LocationSelectionModal
                visible={showModal}
                onClose={closeModal}
            />
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

     {/* <button
                            onClick={navigateToCategory}
                            className="group w-full flex items-center gap-3 p-3 rounded-lg bg-white hover:bg-teal-700 transition-colors text-left"
                            >
                              <Layers size={18} className="text-gray-600 group-hover:text-white" />
                              <span className="text-gray-700 font-medium group-hover:text-white">Category</span>
                            
                        </button> */}
                        
                        {/* <button
                            onClick={navigateToContact}
                            className="group w-full flex items-center gap-3 p-3 rounded-lg bg-white hover:bg-teal-700 transition-colors text-left"
                            >
                              <BookOpen size={18} className="text-gray-600 group-hover:text-white" />
                              <span className="text-gray-700 font-medium group-hover:text-white">Contact Us</span>                            
                        </button> */}
                        <button
                            onClick={handleSetSelect}
                            className="group w-full flex items-center gap-3 p-3 rounded-lg bg-white hover:bg-teal-700 transition-colors text-left"
                            >
                              <User size={18} className="text-gray-600 group-hover:text-white" />
                              <span className="text-gray-700 font-medium group-hover:text-white">Profile</span>                            
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeLayout;