import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiTag, FiZap, FiGitBranch, FiBox, FiActivity, FiAlertCircle, FiBarChart2, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';

function Navigation() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const links = [
    { path: '/', label: 'Dashboard', icon: <FiHome className="w-5 h-5" /> },
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
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <FiActivity className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">NAISS NMS</h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex space-x-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${isActive(link.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive(link.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  {link.icon}
                  <span>{link.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navigation;
