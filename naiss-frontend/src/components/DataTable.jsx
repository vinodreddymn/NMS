import React from 'react';
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';

function DataTable({ columns, data, onEdit, onDelete, onView, loading = false }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No data found</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop View - Table */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col.label}
                  </th>
                ))}
                {(onEdit || onDelete || onView) && (
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-gray-50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <td className="px-4 sm:px-6 py-4 text-sm space-x-3 flex">
                      {onView && (
                        <button
                          onClick={() => onView(row)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="View"
                        >
                          <FiEye className="w-5 h-5" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="text-yellow-600 hover:text-yellow-800 transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 className="w-5 h-5" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tablet View - Compact Table */}
      <div className="hidden sm:block md:hidden bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.slice(0, 3).map((col) => (
                  <th
                    key={col.key}
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-gray-50 transition-colors">
                  {columns.slice(0, 3).map((col) => (
                    <td key={col.key} className="px-3 py-3 text-xs text-gray-900">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                  <td className="px-3 py-3 text-xs space-x-2 flex">
                    {onView && (
                      <button
                        onClick={() => onView(row)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="View"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        className="text-yellow-600 hover:text-yellow-800 transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View - Cards */}
      <div className="sm:hidden space-y-3">
        {data.map((row, idx) => (
          <div key={row.id || idx} className="bg-white rounded-lg shadow p-3 border border-gray-200">
            <div className="space-y-2">
              {columns.slice(0, 4).map((col) => (
                <div key={col.key} className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                    {col.label}
                  </span>
                  <span className="text-sm text-gray-900 font-medium break-words line-clamp-2">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </span>
                </div>
              ))}
            </div>
            {(onEdit || onDelete || onView) && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                {onView && (
                  <button
                    onClick={() => onView(row)}
                    className="flex-1 px-2 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors text-xs font-medium flex items-center justify-center gap-1"
                  >
                    <FiEye className="w-4 h-4" />
                    View
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => onEdit(row)}
                    className="flex-1 px-2 py-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-md transition-colors text-xs font-medium flex items-center justify-center gap-1"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(row)}
                    className="flex-1 px-2 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors text-xs font-medium flex items-center justify-center gap-1"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default DataTable;
