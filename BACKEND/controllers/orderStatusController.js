const { readJsonFile, writeJsonFile } = require('../util/fileUtils');
const path = require('path');

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const filePath = path.join(__dirname, '../data/orders.json');
    const data = await readJsonFile(filePath);
    let updated = false;
    if (data.orders) {
      data.orders = data.orders.map(order => {
        if (order.id === orderId) {
          updated = true;
          return {
            ...order,
            status,
            updatedAt: new Date().toISOString()
          };
        }
        return order;
      });
    }
    if (updated) {
      await writeJsonFile(filePath, data);
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
};

module.exports = { updateOrderStatus };
