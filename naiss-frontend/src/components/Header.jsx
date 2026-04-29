import React, { useState, useEffect } from 'react';
import { FiServer } from 'react-icons/fi';

function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatTimeOnly = (date) => {
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-xl">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 sm:py-4 gap-3 sm:gap-4">
          {/* Company Logo and Name */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-shrink-0">
            <div className="bg-blue-500 p-2 sm:p-2.5 md:p-3 rounded-lg shadow-lg">
              <FiServer className="w-6 h-6 sm:w-7 md:w-8 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">Gee Bee Network Pvt Ltd</h1>
              <p className="text-xs sm:text-sm text-gray-300 font-medium truncate">Network Management System</p>
            </div>
          </div>

          {/* Real-time Date and Time */}
          <div className="text-right ml-auto sm:ml-0 flex-shrink-0">
            <div className="text-xs sm:text-sm md:text-lg font-semibold text-blue-400">
              <span className="hidden sm:inline">{formatDateTime(currentTime)}</span>
              <span className="sm:hidden">{formatTimeOnly(currentTime)}</span>
            </div>
            <div className="text-xs text-gray-400 mt-0.5 sm:mt-1">System Time</div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
