import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiTag, FiZap, FiGitBranch, FiBox, FiActivity, FiAlertCircle, FiBarChart2, FiChevronDown, FiMenu, FiX } from 'react-icons/fi';

function Navigation() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const dashboardLink = { path: '/', label: 'Dashboard', icon: <FiHome className="w-5 h-5" /> };

  const actionLinks = [
    { path: '/device-types', label: 'Device Types', icon: <FiTag className="w-5 h-5" /> },
    { path: '/devices', label: 'Devices', icon: <FiZap className="w-5 h-5" /> },
    { path: '/poles', label: 'Poles', icon: <FiGitBranch className="w-5 h-5" /> },
    { path: '/switches', label: 'Switches', icon: <FiBox className="w-5 h-5" /> },
    { path: '/substations', label: 'Substations', icon: <FiActivity className="w-5 h-5" /> },
    { path: '/regulators', label: 'Regulators', icon: <FiActivity className="w-5 h-5" /> },
    { path: '/alarms', label: 'Alarms', icon: <FiAlertCircle className="w-5 h-5" /> },
    { path: '/device-logs', label: 'Device Logs', icon: <FiBarChart2 className="w-5 h-5" /> },
    { path: '/power-logs', label: 'Power Logs', icon: <FiBarChart2 className="w-5 h-5" /> }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-md sticky top-0 z-50">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 md:h-16">
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-4 md:space-x-6">
            {/* Dashboard Link */}
            <Link
              to={dashboardLink.path}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                isActive(dashboardLink.path)
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              {dashboardLink.icon}
              <span>{dashboardLink.label}</span>
            </Link>

            {/* Actions Dropdown */}
            <div className="relative group">
              <button className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center space-x-2 transition-colors">
                <FiActivity className="w-5 h-5" />
                <span>Actions</span>
                <FiChevronDown className="w-4 h-4" />
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute left-0 mt-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {actionLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-4 py-3 text-sm first:rounded-t-lg last:rounded-b-lg transition-colors flex items-center space-x-3 ${
                      isActive(link.path)
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 ml-auto"
          >
            {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 max-h-[calc(100vh-70px)] overflow-y-auto">
          <div className="px-3 sm:px-4 pt-2 pb-3 space-y-1">
            {/* Mobile Dashboard */}
            <Link
              to={dashboardLink.path}
              onClick={() => setIsMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center space-x-2 ${
                isActive(dashboardLink.path)
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {dashboardLink.icon}
              <span>{dashboardLink.label}</span>
            </Link>

            {/* Mobile Actions Toggle */}
            <button
              onClick={() => setIsActionsOpen(!isActionsOpen)}
              className="w-full px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100 flex items-center space-x-2 justify-between transition-colors"
            >
              <div className="flex items-center space-x-2">
                <FiActivity className="w-5 h-5" />
                <span>Actions</span>
              </div>
              <FiChevronDown className={`w-4 h-4 transition-transform ${isActionsOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Mobile Actions List */}
            {isActionsOpen && (
              <div className="pl-4 sm:pl-6 space-y-1">
                {actionLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsActionsOpen(false);
                    }}
                    className={`block px-3 py-2 rounded-md text-sm transition-colors flex items-center space-x-2 ${
                      isActive(link.path)
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navigation;
