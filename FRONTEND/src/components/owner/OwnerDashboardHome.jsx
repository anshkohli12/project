import React from 'react';
import { FaUtensils, FaClipboardList, FaStar, FaMoneyBill } from 'react-icons/fa';

const OwnerDashboardHome = ({ restaurant, owner }) => {
  if (!restaurant) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg text-gray-500">No restaurant data available</h3>
      </div>
    );
  }

  const stats = [
    {
      id: 'menu',
      label: 'Menu Items',
      value: restaurant.menu?.length || 0,
      icon: <FaUtensils className="text-blue-500" />,
      color: 'bg-blue-100'
    },
    {
      id: 'orders',
      label: 'Active Orders',
      value: 0, // This would come from your orders API
      icon: <FaClipboardList className="text-green-500" />,
      color: 'bg-green-100'
    },
    {
      id: 'rating',
      label: 'Rating',
      value: restaurant.rating?.toFixed(1) || 'N/A',
      icon: <FaStar className="text-yellow-500" />,
      color: 'bg-yellow-100'
    },
    {
      id: 'revenue',
      label: 'Today\'s Revenue',
      value: '$0.00', // This would come from your orders/revenue API
      icon: <FaMoneyBill className="text-purple-500" />,
      color: 'bg-purple-100'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome back, {owner?.username || 'Restaurant Owner'}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with {restaurant.name} today.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.id} className={`${stat.color} rounded-lg shadow-md p-4`}>
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-white">
                {stat.icon}
              </div>
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Restaurant summary */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Restaurant Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 mb-1">Cuisine</p>
            <p className="font-medium">{restaurant.cuisine}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Minimum Order</p>
            <p className="font-medium">${restaurant.minOrder?.toFixed(2) || '0.00'}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Delivery Time</p>
            <p className="font-medium">{restaurant.deliveryTime} min</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Free Delivery</p>
            <p className="font-medium">{restaurant.hasFreeDelivery ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors text-center">
            <FaUtensils className="mx-auto text-xl mb-2" />
            <span>Add Menu Item</span>
          </button>
          <button className="p-4 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors text-center">
            <FaClipboardList className="mx-auto text-xl mb-2" />
            <span>View Orders</span>
          </button>
          <button className="p-4 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 rounded-lg transition-colors text-center">
            <FaStar className="mx-auto text-xl mb-2" />
            <span>View Reviews</span>
          </button>
          <button className="p-4 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg transition-colors text-center">
            <FaMoneyBill className="mx-auto text-xl mb-2" />
            <span>Financial Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboardHome; 