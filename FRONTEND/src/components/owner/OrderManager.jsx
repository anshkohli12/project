import React, { useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaTruck, FaUtensils, FaCheck } from 'react-icons/fa';

const OrderManager = ({ restaurant }) => {
  // Sample orders data - in a real app, this would come from your API
  const [orders, setOrders] = useState([
    {
      id: 1,
      customer: 'John Smith',
      items: ['Cheeseburger', 'Fries', 'Soda'],
      total: 24.99,
      status: 'pending',
      time: '10:30 AM',
      address: '123 Main St, City'
    },
    {
      id: 2,
      customer: 'Sarah Johnson',
      items: ['Pizza', 'Garlic Bread', 'Salad'],
      total: 32.50,
      status: 'confirmed',
      time: '11:15 AM',
      address: '456 Oak Dr, Town'
    },
    {
      id: 3,
      customer: 'Michael Brown',
      items: ['Pad Thai', 'Spring Rolls'],
      total: 19.75,
      status: 'preparing',
      time: '12:00 PM',
      address: '789 Pine Ave, Village'
    },
    {
      id: 4,
      customer: 'Emily Davis',
      items: ['Sushi Combo', 'Miso Soup'],
      total: 28.50,
      status: 'ready',
      time: '12:45 PM',
      address: '101 Cedar Ln, County'
    },
    {
      id: 5,
      customer: 'Robert Wilson',
      items: ['Steak', 'Baked Potato', 'Salad'],
      total: 42.99,
      status: 'delivered',
      time: '1:30 PM',
      address: '202 Elm St, District'
    }
  ]);

  // Status options and their colors
  const statusConfig = {
    pending: { label: 'Pending', icon: <FaSpinner />, color: 'bg-yellow-100 text-yellow-800' },
    confirmed: { label: 'Confirmed', icon: <FaCheckCircle />, color: 'bg-blue-100 text-blue-800' },
    preparing: { label: 'Preparing', icon: <FaUtensils />, color: 'bg-purple-100 text-purple-800' },
    ready: { label: 'Ready', icon: <FaTruck />, color: 'bg-green-100 text-green-800' },
    delivered: { label: 'Delivered', icon: <FaCheck />, color: 'bg-gray-100 text-gray-800' },
    cancelled: { label: 'Cancelled', icon: <FaTimesCircle />, color: 'bg-red-100 text-red-800' }
  };

  // Update order status
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  if (!restaurant) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg text-gray-500">Restaurant data not available</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button className="px-4 py-2 text-sm font-medium bg-orange-100 text-orange-800 rounded-md">
            All Orders
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md">
            Pending
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md">
            Confirmed
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md">
            Preparing
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md">
            Ready
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md">
            Delivered
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md">
            Cancelled
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-700">Today's Orders</h3>
        </div>
        
        {orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No orders found for today.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                      <div className="text-xs text-gray-500">{order.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <ul className="text-sm text-gray-500">
                        {order.items.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusConfig[order.status].color}`}>
                        {statusConfig[order.status].icon}
                        <span className="ml-1">{statusConfig[order.status].label}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select 
                        className="p-1 border border-gray-300 rounded text-sm bg-white"
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirm</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancel</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="p-4 text-center text-sm text-gray-500">
        This is a demo order management interface. In a real application, this would connect to your order API.
      </div>
    </div>
  );
};

export default OrderManager; 