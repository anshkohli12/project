const { readJsonFile, writeJsonFile } = require('../util/fileUtils');
const path = require('path');

// Save a new order
const placeOrder = async (req, res) => {
  try {
    const {
      restaurantId,
      userId,
      name,
      address,
      phone,
      cartItems
    } = req.body;
    const now = new Date();
    // Convert to IST (Indian Standard Time)
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(utc + istOffset);
    const order = {
      id: Date.now().toString(),
      restaurantId,
      userId,
      name,
      address,
      phone,
      cartItems,
      status: 'pending',
      createdAt: istDate.toISOString(),
      updatedAt: istDate.toISOString()
    };
    const filePath = path.join(__dirname, '../data/orders.json');
    const data = await readJsonFile(filePath);
    if (!data.orders) data.orders = [];
    data.orders.push(order);
    await writeJsonFile(filePath, data);
    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Order save error:', error);
    res.status(500).json({ success: false, error: 'Failed to save order' });
  }
};

// (Optional) Get all orders for a restaurant
const getOrdersByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const filePath = path.join(__dirname, '../data/orders.json');
    const data = await readJsonFile(filePath);
    const orders = (data.orders || []).filter(o => o.restaurantId === restaurantId);
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
};

const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const filePath = path.join(__dirname, '../data/orders.json');
    const data = await readJsonFile(filePath);
    const orders = (data.orders || []).filter(o => o.userId === userId);
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch user orders' });
  }
};

module.exports = { placeOrder, getOrdersByRestaurant, getOrdersByUser };
