import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Save, Clock, Loader } from 'lucide-react';
import { SERVER_URL } from '../../Config';

const SlotPicker = ({ isModal = false, onClose = null, store }) => {
    const [slots, setSlots] = useState({
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      });
    
      const [activeDropdown, setActiveDropdown] = useState(null);
      const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
      const [isLoading, setIsLoading] = useState(false);
      const [isSaving, setIsSaving] = useState(false);
      const [loadError, setLoadError] = useState(null);
      const buttonRefs = useRef({});

     
      // Generate time slots from 10:00 AM to 12:00 AM (midnight) with 30-minute intervals
      const generateTimeSlots = () => {
        const timeSlots = [];
        // Start from 10 AM (hour 10) and go through 11 PM (hour 23)
        for (let hour = 10; hour <= 23; hour++) {
          timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
          timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
        // Add midnight (12:00 AM = 00:00)
        timeSlots.push('00:00');
        return timeSlots;
      };

      const availableTimeSlots = generateTimeSlots();
      const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const dayLabels = {
        monday: 'Monday',
        tuesday: 'Tuesday', 
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday'
      };

      // Fetch existing slots when component mounts
      useEffect(() => {
        const fetchSlots = async () => {
          if (!store?._id) {
            console.warn('No store ID provided');
            return;
          }

          setIsLoading(true);
          setLoadError(null);

          try {
            const response = await fetch(`${SERVER_URL}/booking/slots/${store._id}`);
            const result = await response.json();

            if (response.ok && result.success) {
              const { data } = result;
              setSlots({
                monday: data.monday || [],
                tuesday: data.tuesday || [],
                wednesday: data.wednesday || [],
                thursday: data.thursday || [],
                friday: data.friday || [],
                saturday: data.saturday || [],
                sunday: data.sunday || []
              });
            } else if (response.status === 404) {
              // No slots found for this store - this is fine, keep default empty slots
              console.log('No existing slots found for store');
            } else {
              throw new Error(result.message || 'Failed to fetch slots');
            }
          } catch (error) {
            console.error('Error fetching slots:', error);
            setLoadError(error.message);
          } finally {
            setIsLoading(false);
          }
        };

        fetchSlots();
      }, [store?._id, SERVER_URL]);
    
      const formatTime = (time) => {
        const [hours, minutes] = time.split(':');
        const hour24 = parseInt(hours);
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const period = hour24 >= 12 ? 'PM' : 'AM';
        // Special case for midnight
        if (hour24 === 0) {
          return `12:${minutes} AM`;
        }
        return `${hour12}:${minutes} ${period}`;
      };

      const handleDropdownToggle = (day) => {
        if (activeDropdown === day) {
          setActiveDropdown(null);
          return;
        }

        const buttonElement = buttonRefs.current[day];
        if (buttonElement) {
          const rect = buttonElement.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
          
          setDropdownPosition({
            top: rect.bottom - rect.height + 8, // just under the button
            left: rect.right - 200
          });          
        }
        setActiveDropdown(day);
      };
    
      const addSlot = (day, timeSlot) => {
        if (!slots[day].includes(timeSlot)) {
          setSlots(prev => ({
            ...prev,
            [day]: [...prev[day], timeSlot].sort()
          }));
        }
        setActiveDropdown(null);
      };
    
      const removeSlot = (day, timeSlot) => {
        setSlots(prev => ({
          ...prev,
          [day]: prev[day].filter(slot => slot !== timeSlot)
        }));
      };
    
      const handleSave = async () => {
        if (!store?._id) {
          alert('Error: No store ID provided');
          return;
        }

        setIsSaving(true);

        try {
          const response = await fetch(`${SERVER_URL}/booking/slots`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              storeId: store._id,
              ...slots
            }),
          });

          const result = await response.json();

          if (response.ok && result.success) {
            alert('Time slots saved successfully!');
            console.log('Slots saved:', result.data);
            
            // Close modal if it's in modal mode
            if (isModal && onClose) {
              onClose();
            }
          } else {
            throw new Error(result.message || 'Failed to save slots');
          }
        } catch (error) {
          console.error('Error saving slots:', error);
          alert(`Error saving slots: ${error.message}`);
        } finally {
          setIsSaving(false);
        }
      };
    
      const getAvailableSlotsForDay = (day) => {
        return availableTimeSlots.filter(time => !slots[day].includes(time));
      };

      // Close dropdown when clicking outside
      useEffect(() => {
        const handleClickOutside = (event) => {
          // Check if the click is outside the dropdown and not on a dropdown button
          const dropdown = document.querySelector('.dropdown-portal');
          const clickedButton = Object.values(buttonRefs.current).some(ref => ref && ref.contains(event.target));
          
          if (!dropdown?.contains(event.target) && !clickedButton) {
            setActiveDropdown(null);
          }
        };

        if (activeDropdown) {
          document.addEventListener('mousedown', handleClickOutside);
          return () => document.removeEventListener('mousedown', handleClickOutside);
        }
      }, [activeDropdown]);

      // Loading state
      if (isLoading) {
        return (
          <div className={`${isModal ? 'h-full bg-white p-6' : 'min-h-screen bg-gray-50 p-6'} flex items-center justify-center`}>
            <div className="text-center">
              <Loader className="animate-spin mx-auto mb-4 text-teal-500" size={32} />
              <p className="text-gray-600">Loading time slots...</p>
            </div>
          </div>
        );
      }

      // Error state
      if (loadError) {
        return (
          <div className={`${isModal ? 'h-full bg-white p-6' : 'min-h-screen bg-gray-50 p-6'} flex items-center justify-center`}>
            <div className="text-center">
              <X className="mx-auto mb-4 text-red-500" size={32} />
              <p className="text-red-600 mb-4">Error loading slots: {loadError}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
              >
                Retry
              </button>
            </div>
          </div>
        );
      }
    
      return (
        <div className={`${isModal ? 'h-full bg-white p-6' : 'min-h-screen bg-gray-50 p-6'} relative overflow-auto`}>
          {/* Close button for modal */}
          {isModal && onClose && (
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-10 text-gray-500 hover:text-red-500 text-2xl font-bold"
              disabled={isSaving}
            >
              <X size={24} />
            </button>
          )}
          
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className={`text-center ${isModal ? 'mb-4' : 'mb-8'}`}>
              <div className={`inline-flex items-center gap-3 ${isModal ? 'mb-2' : 'mb-4'}`}>
                <div className={`${isModal ? 'p-2' : 'p-3'} bg-teal-500 rounded-full`}>
                  <Clock className="text-white" size={isModal ? 20 : 28} />
                </div>
                <h1 className={`${isModal ? 'text-xl' : 'text-3xl'} font-bold text-gray-900`}>Time Slot Picker</h1>
              </div>
              <p className={`text-gray-600 ${isModal ? 'text-sm' : ''}`}>
                Select available time slots for {store?.name || 'your store'} (10 AM - 12 AM)
              </p>
            </div>
    
            {/* Days Grid */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${isModal ? 'mb-4' : 'mb-8'}`}>
              {daysOfWeek.map(day => (
                <div key={day} className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-visible ${isModal ? '' : 'rounded-2xl'}`}>
                  {/* Day Header */}
                  <div className={`bg-teal-500 ${isModal ? 'px-3 py-2' : 'px-4 py-3'} flex items-center justify-between ${isModal ? '' : 'rounded-t-2xl'}`}>
                    <div>
                      <h3 className={`${isModal ? 'text-base' : 'text-lg'} font-bold text-white`}>{dayLabels[day]}</h3>
                      <p className="text-teal-100 text-xs">
                        {slots[day].length} slot{slots[day].length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {/* Add Slot Button in Header */}
                    <button
                      ref={el => buttonRefs.current[day] = el}
                      onClick={() => handleDropdownToggle(day)}
                      disabled={isSaving}
                      className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-all group disabled:opacity-50"
                    >
                      <Plus size={16} className="group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                  
                  {/* Slots Container */}
                  <div className={`${isModal ? 'p-3 min-h-16' : 'p-4 min-h-24'}`}>
                    {/* Selected Slots - Compact Grid Design */}
                    <div className="grid grid-cols-2 gap-1">
                      {slots[day].length > 0 ? (
                        slots[day].map(slot => (
                          <div 
                            key={slot}
                            className="flex items-center justify-between bg-gray-50 rounded px-2 py-1 border border-gray-200 group hover:bg-teal-50 hover:border-teal-200 transition-all text-xs"
                          >
                            <span className="font-semibold text-gray-800 group-hover:text-teal-700 truncate">
                              {formatTime(slot)}
                            </span>
                            <button
                              onClick={() => removeSlot(day, slot)}
                              disabled={isSaving}
                              className="p-0.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-all ml-1 flex-shrink-0 disabled:opacity-50"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className={`col-span-2 text-center ${isModal ? 'py-3' : 'py-6'}`}>
                          <Clock size={isModal ? 16 : 24} className="mx-auto text-gray-300 mb-1" />
                          <p className="text-gray-400 text-xs">No slots selected</p>
                          <p className="text-gray-400 text-xs opacity-75">Click + to add</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Portal-style Dropdown */}
            {activeDropdown && (
              <div 
                className="dropdown-portal fixed z-50 bg-white border border-gray-200 rounded-xl shadow-2xl w-52"
                style={{
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  maxHeight: '300px'
                }}
              >
                <div className="p-3 bg-gray-50 border-b rounded-t-xl">
                  <p className="text-sm font-semibold text-gray-800">
                    Add Time - {dayLabels[activeDropdown]}
                  </p>
                  <p className="text-xs text-gray-600">
                    {getAvailableSlotsForDay(activeDropdown).length} available
                  </p>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-1 p-2">
                    {getAvailableSlotsForDay(activeDropdown).map(time => (
                      <button
                        key={time}
                        onClick={() => addSlot(activeDropdown, time)}
                        disabled={isSaving}
                        className="text-center px-2 py-2 hover:bg-teal-50 text-gray-700 hover:text-teal-700 font-medium text-xs transition-colors border border-gray-100 rounded hover:border-teal-200 hover:shadow-sm disabled:opacity-50"
                      >
                        {formatTime(time)}
                      </button>
                    ))}
                  </div>
                  {getAvailableSlotsForDay(activeDropdown).length === 0 && (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      <Clock size={16} className="mx-auto mb-1 opacity-50" />
                      All time slots added
                    </div>
                  )}
                </div>
              </div>
            )}
    
            {/* Save Button */}
            <div className="text-center">
              <button
                onClick={handleSave}
                disabled={isSaving || !store?._id}
                className={`inline-flex items-center gap-3 ${isModal ? 'px-6 py-3 text-base' : 'px-8 py-4 text-lg'} bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:bg-teal-500`}
              >
                {isSaving ? (
                  <Loader className="animate-spin" size={isModal ? 20 : 24} />
                ) : (
                  <Save size={isModal ? 20 : 24} />
                )}
                {isSaving ? 'Saving...' : 'Save Time Slots'}
              </button>
              {!store?._id && (
                <p className="text-red-500 text-sm mt-2">Error: Store information missing</p>
              )}
            </div>

            {/* Debug Panel - Only show when not in modal */}
            {!isModal && (
              <div className="mt-8 p-4 bg-white rounded-lg shadow">
                <h3 className="font-bold mb-2">Debug - Current State:</h3>
                <div className="text-xs bg-gray-100 p-2 rounded overflow-auto mb-2">
                  <strong>Store ID:</strong> {store?._id || 'Not provided'}
                </div>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(slots, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    };
    
export default SlotPicker;