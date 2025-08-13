import React, { useState } from 'react';
import { 
  TrendingUp, Package, CreditCard, Smartphone, 
  Store, Truck, UtensilsCrossed, Calendar,
  IndianRupee, ShoppingBag, ChevronDown, RefreshCw
} from 'lucide-react';

const DailyReportSection = ({ dailyData, onDateChange, isLoading, selectedDate }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  if (!dailyData && !isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Data Available</h3>
        <p className="text-gray-500">Select a date to view daily sales report</p>
        <DateSelector onDateChange={onDateChange} selectedDate={selectedDate} />
      </div>
    );
  }

  const formatCurrency = (amount) => `₹${amount?.toLocaleString() || 0}`;
  
  const stats = dailyData ? [
    {
      title: "Total Sales",
      value: formatCurrency(dailyData.summary.totalSales),
      icon: IndianRupee,
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700"
    },
    {
      title: "Total Orders",
      value: dailyData.summary.totalOrders,
      icon: ShoppingBag,
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700"
    },
    {
      title: "COD Sales",
      value: formatCurrency(dailyData.summary.codSales),
      icon: CreditCard,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700"
    },
    {
      title: "Online Sales",
      value: formatCurrency(dailyData.summary.onlineSales),
      icon: Smartphone,
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700"
    }
  ] : [];

  const orderTypes = dailyData ? [
    {
      label: "Dine-In",
      count: dailyData.summary.dineInOrders,
      icon: UtensilsCrossed,
      color: "text-rose-600",
      bgColor: "bg-rose-100"
    },
    {
      label: "Parcel",
      count: dailyData.summary.parcelOrders,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      label: "Delivery",
      count: dailyData.summary.deliveryOrders,
      icon: Truck,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    }
  ] : [];

  const DateSelector = ({ onDateChange, selectedDate }) => {
    const [tempDate, setTempDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);

    const handleDateSubmit = () => {
      onDateChange(tempDate);
      setShowDatePicker(false);
    };

    const getQuickDateOptions = () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      return [
        { label: 'Today', date: today.toISOString().split('T')[0] },
        { label: 'Yesterday', date: yesterday.toISOString().split('T')[0] },
        { label: '1 Week Ago', date: weekAgo.toISOString().split('T')[0] }
      ];
    };

    return (
      <div className="mt-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {getQuickDateOptions().map((option) => (
            <button
              key={option.label}
              onClick={() => {
                setTempDate(option.date);
                onDateChange(option.date);
              }}
              className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm hover:bg-teal-200 transition-colors"
            >
              {option.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={tempDate}
            onChange={(e) => setTempDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <button
            onClick={handleDateSubmit}
            disabled={isLoading}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Calendar className="w-4 h-4" />
            )}
            <span>{isLoading ? 'Loading...' : 'Get Report'}</span>
          </button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-8 w-1/3 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 h-24 rounded-xl"></div>
            ))}
          </div>
          <div className="bg-gray-100 h-32 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Daily Sales Report</h3>
              <div className="flex items-center space-x-2 text-teal-100">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">{dailyData?.date}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 px-3 py-1 rounded-full">
              <span className="text-white text-sm font-medium">Live Data</span>
            </div>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg transition-colors flex items-center space-x-1"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Change Date</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* Date Picker Dropdown */}
        {showDatePicker && (
          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <DateSelector onDateChange={onDateChange} selectedDate={selectedDate} />
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="relative group">
              <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 group-hover:scale-105">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} rounded-b-xl`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Types Section */}
        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
          <div className="flex items-center mb-4">
            <Store className="w-5 h-5 text-gray-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-900">Order Distribution</h4>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {orderTypes.map((type, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${type.bgColor}`}>
                    <type.icon className={`w-4 h-4 ${type.color}`} />
                  </div>
                  <span className="font-medium text-gray-700">{type.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-gray-900">{type.count}</span>
                  <p className="text-xs text-gray-500">orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Insights */}
        {dailyData && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Average Order Value</p>
                  <p className="text-2xl font-bold text-green-800">
                    {formatCurrency(Math.round(dailyData.summary.totalSales / dailyData.summary.totalOrders) || 0)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Payment Split</p>
                  <div className="flex space-x-4 mt-1">
                    <span className="text-sm text-blue-800">
                      COD: {Math.round((dailyData.summary.codSales / dailyData.summary.totalSales) * 100) || 0}%
                    </span>
                    <span className="text-sm text-blue-800">
                      Online: {Math.round((dailyData.summary.onlineSales / dailyData.summary.totalSales) * 100) || 0}%
                    </span>
                  </div>
                </div>
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyReportSection;