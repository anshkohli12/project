const { readJsonFile, writeJsonFile } = require('../util/fileUtils');
const path = require('path');

const MENUS_FILE = 'menus.json';

const menuController = {
  // Get menu for a specific restaurant
  async getMenuByRestaurantId(req, res) {
    try {
      const restaurantId = parseInt(req.params.id);
      console.log('Fetching menu for restaurant ID:', restaurantId);
      
      const menusData = await readJsonFile(MENUS_FILE);
      
      // Initialize menus object if file is empty
      if (!menusData.menus) {
        console.log('No menus data found, returning empty array');
        return res.json({
          success: true,
          menu: []
        });
      }

      // Find menu for the specific restaurant
      const restaurantMenu = menusData.menus.find(
        menu => parseInt(menu.restaurantId) === restaurantId
      );

      // Return empty menu array if no menu found for this restaurant
      if (!restaurantMenu) {
        console.log('No menu found for restaurant ID:', restaurantId);
        return res.json({
          success: true,
          menu: []
        });
      }

      // Return the menu items
      res.json({
        success: true,
        menu: restaurantMenu.items || []
      });
    } catch (error) {
      console.error('Error fetching menu:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch menu'
      });
    }
  },

  // Add a single menu item to a restaurant
  async addMenuItem(req, res) {
    try {
      const restaurantId = parseInt(req.params.id);
      const menuItem = req.body;

      // Validate menu item
      if (!menuItem.name || !menuItem.price || !menuItem.description || !menuItem.type) {
        return res.status(400).json({
          success: false,
          message: 'Invalid menu item. Must include name, price, description, and type'
        });
      }

      // Read existing menus
      let menusData = await readJsonFile(MENUS_FILE);

      // Initialize menus array if it doesn't exist
      if (!menusData.menus) {
        menusData = { menus: [] };
      }

      // Find the restaurant's menu
      let restaurantMenu = menusData.menus.find(
        menu => parseInt(menu.restaurantId) === restaurantId
      );

      // If restaurant menu doesn't exist, create it
      if (!restaurantMenu) {
        restaurantMenu = {
          restaurantId,
          items: []
        };
        menusData.menus.push(restaurantMenu);
      }

      // Generate a new unique ID for the menu item
      const existingIds = restaurantMenu.items.map(item => parseInt(item.id));
      const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

      // Create the new menu item
      const newMenuItem = {
        id: newId.toString(),
        ...menuItem,
        price: parseFloat(menuItem.price)
      };

      // Add item to menu
      restaurantMenu.items.push(newMenuItem);

      // Write updated menus back to file
      await writeJsonFile(MENUS_FILE, menusData);

      res.status(201).json({
        success: true,
        message: 'Menu item added successfully',
        menuItem: newMenuItem
      });
    } catch (error) {
      console.error('Error adding menu item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add menu item'
      });
    }
  },

  // Add menu for a specific restaurant
  async addMenuForRestaurant(req, res) {
    try {
      const restaurantId = req.params.id;
      const menuItems = req.body;

      // Validate menu items
      if (!Array.isArray(menuItems)) {
        return res.status(400).json({
          success: false,
          message: 'Menu items must be an array'
        });
      }

      // Validate each menu item
      const isValidMenuItems = menuItems.every(item => {
        return (
          item.name &&
          item.image &&
          item.price &&
          item.type &&
          ['Veg', 'Non-Veg'].includes(item.type)
        );
      });

      if (!isValidMenuItems) {
        return res.status(400).json({
          success: false,
          message: 'Invalid menu items. Each item must have name, image, price, and type (Veg/Non-Veg)'
        });
      }

      // Read existing menus
      let menusData = await readJsonFile(MENUS_FILE);

      // Initialize menus array if it doesn't exist
      if (!menusData.menus) {
        menusData = { menus: [] };
      }

      // Check if menu already exists for this restaurant
      const existingMenuIndex = menusData.menus.findIndex(
        menu => menu.restaurantId === restaurantId
      );

      if (existingMenuIndex !== -1) {
        // Update existing menu
        menusData.menus[existingMenuIndex] = {
          restaurantId,
          items: menuItems
        };
      } else {
        // Add new menu
        menusData.menus.push({
          restaurantId,
          items: menuItems
        });
      }

      // Write updated menus back to file
      await writeJsonFile(MENUS_FILE, menusData);

      res.status(201).json({
        success: true,
        message: 'Menu added successfully',
        menu: menuItems
      });
    } catch (error) {
      console.error('Error adding menu:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add menu'
      });
    }
  },

  // Delete a menu item
  async deleteMenuItem(req, res) {
    try {
      const restaurantId = parseInt(req.params.id);
      const itemId = req.params.itemId;
      
      // Read existing menus
      let menusData = await readJsonFile(MENUS_FILE);
      
      // Find the restaurant's menu
      const restaurantMenuIndex = menusData.menus.findIndex(
        menu => parseInt(menu.restaurantId) === restaurantId
      );

      if (restaurantMenuIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant menu not found'
        });
      }

      // Find and remove the menu item
      const itemIndex = menusData.menus[restaurantMenuIndex].items.findIndex(
        item => item.id === itemId
      );

      if (itemIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }

      // Remove the item
      menusData.menus[restaurantMenuIndex].items.splice(itemIndex, 1);

      // Write updated menus back to file
      await writeJsonFile(MENUS_FILE, menusData);

      res.json({
        success: true,
        message: 'Menu item deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting menu item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete menu item'
      });
    }
  }
};

module.exports = menuController; 