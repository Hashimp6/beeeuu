import React, { useState } from 'react';
import { 
  TrendingUp, Package, CreditCard, Smartphone, 
  Store, Truck, UtensilsCrossed, Calendar,
  IndianRupee, ShoppingBag, ChevronDown, RefreshCw,
  BarChart3, PieChart
} from 'lucide-react';

// Weekly Report Component
const WeeklyReportSection = ({ weeklyData, onWeekChange, isLoading, selectedWeek, selectedYear }) => {
  const [showWeekPicker, setShowWeekPicker] = useState(false);

  const WeekSelector = ({ onWeekChange, selectedWeek, selectedYear }) => {
    const [tempWeek, setTempWeek] = useState(selectedWeek || getCurrentWeek());
    const [tempYear, setTempYear] = useState(selectedYear || new Date().getFullYear());

    function getCurrentWeek() {
      const today = new Date();
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
      const pastDaysOfYear = (today - firstDayOfYear) / 86400000;
      return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }

    const handleWeekSubmit = () => {
      onWeekChange(tempWeek, tempYear);
      setShowWeekPicker(false);
    };

    const getQuickWeekOptions = () => {
      const currentWeek = getCurrentWeek();
      const currentYear = new Date().getFullYear();
      
      return [
        { label: 'This Week', week: currentWeek, year: currentYear },
        { label: 'Last Week', week: currentWeek - 1, year: currentYear },
        { label: '2 Weeks Ago', week: currentWeek - 2, year: currentYear }
      ];
    };

    return (
      <div className="mt-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {getQuickWeekOptions().map((option) => (
            <button
              key={option.label}
              onClick={() => {
                setTempWeek(option.week);
                setTempYear(option.year);
                onWeekChange(option.week, option.year);
              }}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
            >
              {option.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={tempYear}
            onChange={(e) => setTempYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            max="53"
            value={tempWeek}
            onChange={(e) => setTempWeek(parseInt(e.target.value))}
            placeholder="Week"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-20"
          />
          <button
            onClick={handleWeekSubmit}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <BarChart3 className="w-4 h-4" />
            )}
            <span>{isLoading ? 'Loading...' : 'Get Report'}</span>
          </button>
        </div>
      </div>
    );
  };

  // Fixed: Check for weeklyData directly, not weeklyData?.data
  if (!weeklyData && !isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Weekly Data Available</h3>
        <p className="text-gray-500">Select a week to view weekly sales report</p>
        <WeekSelector onWeekChange={onWeekChange} selectedWeek={selectedWeek} selectedYear={selectedYear} />
      </div>
    );
  }

  const formatCurrency = (amount) => `₹${amount?.toLocaleString() || 0}`;
  
  // Fixed: Access data directly from weeklyData
  const weeklyTotals = weeklyData?.weeklyTotals || {};
  const weekPeriod = weeklyData?.weekPeriod || '';
  const dailyBreakdown = weeklyData?.dailyBreakdown || [];
  
  const stats = [
    {
      title: "Weekly Sales",
      value: formatCurrency(weeklyTotals.totalSales || 0),
      icon: IndianRupee,
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700"
    },
    {
      title: "Total Orders",
      value: weeklyTotals.totalOrders || 0,
      icon: ShoppingBag,
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700"
    },
    {
      title: "COD Sales",
      value: formatCurrency(weeklyTotals.codSales || 0),
      icon: CreditCard,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700"
    },
    {
      title: "Online Sales",
      value: formatCurrency(weeklyTotals.onlineSales || 0),
      icon: Smartphone,
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700"
    }
  ];

  // Calculate order types from daily breakdown if available
  const calculateOrderTypes = () => {
    // Since the current data structure doesn't have order type breakdown,
    // we'll show placeholder data. You may need to update your API to include this data
    return [
      {
        label: "Dine-In",
        count: 0, // This data is not available in current structure
        icon: UtensilsCrossed,
        color: "text-rose-600",
        bgColor: "bg-rose-100"
      },
      {
        label: "Parcel",
        count: 0, // This data is not available in current structure
        icon: Package,
        color: "text-green-600",
        bgColor: "bg-green-100"
      },
      {
        label: "Delivery",
        count: 0, // This data is not available in current structure
        icon: Truck,
        color: "text-blue-600",
        bgColor: "bg-blue-100"
      }
    ];
  };

  const orderTypes = calculateOrderTypes();

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
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Weekly Sales Report</h3>
              <div className="flex items-center space-x-2 text-blue-100">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Week {selectedWeek} of {selectedYear}
                  {weekPeriod && ` (${weekPeriod})`}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 px-3 py-1 rounded-full">
              <span className="text-white text-sm font-medium">Weekly Data</span>
            </div>
            <button
              onClick={() => setShowWeekPicker(!showWeekPicker)}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg transition-colors flex items-center space-x-1"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Change Week</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showWeekPicker ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* Week Picker Dropdown */}
        {showWeekPicker && (
          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <WeekSelector onWeekChange={onWeekChange} selectedWeek={selectedWeek} selectedYear={selectedYear} />
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

        {/* Daily Breakdown Chart */}
        {dailyBreakdown.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 mb-6">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-5 h-5 text-gray-600 mr-2" />
              <h4 className="text-lg font-semibold text-gray-900">Daily Sales Breakdown</h4>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {dailyBreakdown.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                    <p className="text-xs font-medium text-gray-600 mb-1">{day.day.slice(0, 3)}</p>
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(day.dailySales)}</p>
                    <p className="text-xs text-gray-500">{day.dailyOrders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Types Section - Note: This data is not available in current API structure */}
        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
          <div className="flex items-center mb-4">
            <Store className="w-5 h-5 text-gray-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-900">Weekly Order Distribution</h4>
            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Data Not Available</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {orderTypes.map((type, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors opacity-50">
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
          <p className="text-xs text-gray-500 mt-2 text-center">
            Order type breakdown not included in current API response
          </p>
        </div>

        {/* Quick Insights */}
        {weeklyTotals && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Daily Average</p>
                  <p className="text-2xl font-bold text-green-800">
                    {formatCurrency(Math.round((weeklyTotals.totalSales || 0) / 7) || 0)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Average Order Value</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {formatCurrency(Math.round((weeklyTotals.totalSales || 0) / (weeklyTotals.totalOrders || 1)) || 0)}
                  </p>
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

// Monthly Report Component
const MonthlyReportSection = ({ monthlyData, onMonthChange, isLoading, selectedMonth, selectedYear }) => {
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const MonthSelector = ({ onMonthChange, selectedMonth, selectedYear }) => {
    const [tempMonth, setTempMonth] = useState(selectedMonth || new Date().getMonth() + 1);
    const [tempYear, setTempYear] = useState(selectedYear || new Date().getFullYear());

    const handleMonthSubmit = () => {
      onMonthChange(tempMonth, tempYear);
      setShowMonthPicker(false);
    };

    const getQuickMonthOptions = () => {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      return [
        { label: 'This Month', month: currentMonth, year: currentYear },
        { label: 'Last Month', month: currentMonth === 1 ? 12 : currentMonth - 1, year: currentMonth === 1 ? currentYear - 1 : currentYear },
        { label: '2 Months Ago', month: currentMonth <= 2 ? 12 + currentMonth - 2 : currentMonth - 2, year: currentMonth <= 2 ? currentYear - 1 : currentYear }
      ];
    };

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
      <div className="mt-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {getQuickMonthOptions().map((option) => (
            <button
              key={option.label}
              onClick={() => {
                setTempMonth(option.month);
                setTempYear(option.year);
                onMonthChange(option.month, option.year);
              }}
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
            >
              {option.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={tempYear}
            onChange={(e) => setTempYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={tempMonth}
            onChange={(e) => setTempMonth(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {monthNames.map((month, index) => (
              <option key={index} value={index + 1}>{month}</option>
            ))}
          </select>
          <button
            onClick={handleMonthSubmit}
            disabled={isLoading}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <PieChart className="w-4 h-4" />
            )}
            <span>{isLoading ? 'Loading...' : 'Get Report'}</span>
          </button>
        </div>
      </div>
    );
  };

  // Fixed: Check for monthlyData directly, not monthlyData?.data
  if (!monthlyData && !isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
        <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Monthly Data Available</h3>
        <p className="text-gray-500">Select a month to view monthly sales report</p>
        <MonthSelector onMonthChange={onMonthChange} selectedMonth={selectedMonth} selectedYear={selectedYear} />
      </div>
    );
  }

  const formatCurrency = (amount) => `₹${amount?.toLocaleString() || 0}`;
  
  // Fixed: Access data directly from monthlyData
  const monthlyTotals = monthlyData?.monthlyTotals || {};
  const monthStart = monthlyData?.monthStart || '';
  const monthEnd = monthlyData?.monthEnd || '';
  const month = monthlyData?.month || '';
  const dailyBreakdown = monthlyData?.dailyBreakdown || [];
  
  const stats = [
    {
      title: "Monthly Sales",
      value: formatCurrency(monthlyTotals.totalSales || 0),
      icon: IndianRupee,
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700"
    },
    {
      title: "Total Orders",
      value: monthlyTotals.totalOrders || 0,
      icon: ShoppingBag,
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700"
    },
    {
      title: "COD Sales",
      value: formatCurrency(monthlyTotals.codSales || 0),
      icon: CreditCard,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700"
    },
    {
      title: "Online Sales",
      value: formatCurrency(monthlyTotals.onlineSales || 0),
      icon: Smartphone,
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700"
    }
  ];

  // Extract order types from monthlyTotals if available
  const orderTypes = [
    {
      label: "Dine-In",
      count: Math.round((monthlyTotals.dineInSales || 0) / ((monthlyTotals.totalSales || 1) / (monthlyTotals.totalOrders || 1))),
      value: formatCurrency(monthlyTotals.dineInSales || 0),
      icon: UtensilsCrossed,
      color: "text-rose-600",
      bgColor: "bg-rose-100"
    },
    {
      label: "Parcel",
      count: Math.round((monthlyTotals.parcelSales || 0) / ((monthlyTotals.totalSales || 1) / (monthlyTotals.totalOrders || 1))),
      value: formatCurrency(monthlyTotals.parcelSales || 0),
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      label: "Delivery",
      count: Math.round((monthlyTotals.deliverySales || 0) / ((monthlyTotals.totalSales || 1) / (monthlyTotals.totalOrders || 1))),
      value: formatCurrency(monthlyTotals.deliverySales || 0),
      icon: Truck,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    }
  ];

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

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <PieChart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Monthly Sales Report</h3>
              <div className="flex items-center space-x-2 text-purple-100">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {month || `${monthNames[selectedMonth - 1]} ${selectedYear}`}
                  {monthStart && monthEnd && ` (${new Date(monthStart).toLocaleDateString()} - ${new Date(monthEnd).toLocaleDateString()})`}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 px-3 py-1 rounded-full">
              <span className="text-white text-sm font-medium">Monthly Data</span>
            </div>
            <button
              onClick={() => setShowMonthPicker(!showMonthPicker)}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg transition-colors flex items-center space-x-1"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Change Month</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showMonthPicker ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* Month Picker Dropdown */}
        {showMonthPicker && (
          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <MonthSelector onMonthChange={onMonthChange} selectedMonth={selectedMonth} selectedYear={selectedYear} />
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

        {/* Daily Breakdown Chart - Fixed for monthly data structure */}
        {dailyBreakdown.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 mb-6">
            <div className="flex items-center mb-4">
              <PieChart className="w-5 h-5 text-gray-600 mr-2" />
              <h4 className="text-lg font-semibold text-gray-900">Daily Sales Breakdown</h4>
            </div>
            
            <div className="grid grid-cols-7 gap-2 mb-4">
              {dailyBreakdown.slice(0, 7).map((day, index) => (
                <div key={index} className="text-center">
                  <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                    <p className="text-xs font-medium text-gray-600 mb-1">Day {day._id}</p>
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(day.dailySales)}</p>
                    <p className="text-xs text-gray-500">{day.dailyOrders} orders</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Show remaining days if more than 7 */}
            {dailyBreakdown.length > 7 && (
              <div className="grid grid-cols-7 gap-2">
                {dailyBreakdown.slice(7).map((day, index) => (
                  <div key={index + 7} className="text-center">
                    <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                      <p className="text-xs font-medium text-gray-600 mb-1">Day {day._id}</p>
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(day.dailySales)}</p>
                      <p className="text-xs text-gray-500">{day.dailyOrders} orders</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Order Types Section - Now using actual data */}
        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
          <div className="flex items-center mb-4">
            <Store className="w-5 h-5 text-gray-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-900">Monthly Order Distribution</h4>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {orderTypes.map((type, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${type.bgColor}`}>
                    <type.icon className={`w-4 h-4 ${type.color}`} />
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">{type.label}</span>
                    <p className="text-xs text-gray-500">{type.value}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-gray-900">{type.count}</span>
                  <p className="text-xs text-gray-500">est. orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Insights */}
        {monthlyTotals && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Daily Average</p>
                  <p className="text-2xl font-bold text-green-800">
                    {formatCurrency(Math.round((monthlyTotals.totalSales || 0) / 30) || 0)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Average Order Value</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {formatCurrency(Math.round((monthlyTotals.totalSales || 0) / (monthlyTotals.totalOrders || 1)) || 0)}
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        )}

        {/* Additional Monthly Insights */}
        {monthlyTotals && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-xl border-l-4 border-rose-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-rose-700 font-medium">Total Items Sold</p>
                  <p className="text-2xl font-bold text-rose-800">
                    {monthlyTotals.totalItems || 0}
                  </p>
                </div>
                <ShoppingBag className="w-8 h-8 text-rose-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-xl border-l-4 border-amber-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700 font-medium">COD Percentage</p>
                  <p className="text-2xl font-bold text-amber-800">
                    {Math.round(((monthlyTotals.codSales || 0) / (monthlyTotals.totalSales || 1)) * 100)}%
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-amber-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-700 font-medium">Online Percentage</p>
                  <p className="text-2xl font-bold text-indigo-800">
                    {Math.round(((monthlyTotals.onlineSales || 0) / (monthlyTotals.totalSales || 1)) * 100)}%
                  </p>
                </div>
                <Smartphone className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-xl border-l-4 border-teal-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-teal-700 font-medium">Items per Order</p>
                  <p className="text-2xl font-bold text-teal-800">
                    {Math.round((monthlyTotals.totalItems || 0) / (monthlyTotals.totalOrders || 1))}
                  </p>
                </div>
                <Package className="w-8 h-8 text-teal-600" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Export both components
export { WeeklyReportSection, MonthlyReportSection };