import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

function Alert({ type = 'info', title, message, onClose }) {
  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  }[type];

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800'
  }[type];

  const iconColor = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400'
  }[type];

  return (
    <div className={`border rounded-lg p-4 ${bgColor} ${textColor} fade-in`}>
      <div className="flex items-start">
        <FiAlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 mr-3 ${iconColor}`} />
        <div className="flex-1">
          {title && <h3 className="font-semibold mb-1">{title}</h3>}
          {message && <p className="text-sm">{message}</p>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-4 text-lg font-bold opacity-50 hover:opacity-75 transition-opacity`}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

export default Alert;
