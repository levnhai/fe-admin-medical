import React from 'react';

const LoadingSkeleton = () => {
  const skeletonRows = Array(5).fill(0);

  return (
    <>
      {skeletonRows.map((_, index) => (
        <tr 
          key={index} 
          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 animate-pulse"
        >
          <td className="w-4 p-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 bg-gray-200 rounded"
                disabled
              />
            </div>
          </td>
          <th scope="row" className="flex items-center px-6 py-4">
            <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
            <div>
              <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-36"></div>
            </div>
          </th>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-300 rounded w-20"></div>
          </td>
          <td className="ps-3">
            <div className="h-4 bg-gray-300 rounded w-32"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-300 rounded w-12"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-300 rounded w-16"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-300 rounded w-20"></div>
          </td>
          <td className="px-4 py-3">
            <div className="flex space-x-3">
              <div className="w-5 h-5 bg-gray-300 rounded"></div>
              <div className="w-5 h-5 bg-gray-300 rounded"></div>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};

export default LoadingSkeleton;