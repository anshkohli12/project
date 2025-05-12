const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = 'your-secret-key'; // In production, this should be in environment variables
const OWNERS_FILE = path.join(__dirname, '../data/restaurantOwners.json');
const RESTAURANTS_FILE = path.join(__dirname, '../data/restaurants.json');

// Utility functions to read and write JSON files
const readOwnersData = () => {
  try {
    const data = fs.readFileSync(OWNERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { owners: [] };
  }
};

const writeOwnersData = (data) => {
  fs.writeFileSync(OWNERS_FILE, JSON.stringify(data, null, 2));
};

const readRestaurantsData = () => {
  try {
    const data = fs.readFileSync(RESTAURANTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { restaurants: [] };
  }
};

const writeRestaurantsData = (data) => {
  fs.writeFileSync(RESTAURANTS_FILE, JSON.stringify(data, null, 2));
};

// Get the next ID for owners and restaurants
const getNextId = () => {
  const ownersData = readOwnersData();
  const restaurantsData = readRestaurantsData();
  
  const lastOwnerId = ownersData.owners.length > 0 
    ? Math.max(...ownersData.owners.map(owner => owner.id))
    : 0;
    
  const lastRestaurantId = restaurantsData.restaurants.length > 0
    ? Math.max(...restaurantsData.restaurants.map(restaurant => restaurant.id))
    : 0;
    
  return Math.max(lastOwnerId, lastRestaurantId) + 1;
};

// Login restaurant owner
const loginOwner = async (req, res) => {
  try {
    const { username, password } = req.body;
    const ownersData = readOwnersData();
    const owner = ownersData.owners.find(o => o.username === username);

    if (!owner) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // For existing owners without hashed passwords, we'll compare directly
    // In a real app, all passwords should be hashed
    const isValidPassword = owner.hashedPassword 
      ? await bcrypt.compare(password, owner.hashedPassword)
      : password === owner.password;

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: owner.id,
        username: owner.username,
        restaurantId: owner.restaurantId
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      id: owner.id,
      username: owner.username,
      restaurantId: owner.restaurantId,
      email: owner.email
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

// Register a new restaurant owner
const registerOwner = (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const ownersData = readOwnersData();
    
    // Check if email already exists
    if (ownersData.owners.some(owner => owner.email === email)) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Create new owner with next ID
    const newId = getNextId();
    const newOwner = {
      id: newId.toString(), // Convert to string to match existing format
      username: name.toLowerCase().replace(/\s+/g, '_'), // Create username from name
      password: password,
      email: email,
      restaurantId: null // Will be set after restaurant creation
    };
    
    // Add new owner to the list
    ownersData.owners.push(newOwner);
    writeOwnersData(ownersData);
    
    // Return success response with owner data (excluding password)
    res.status(201).json({
      message: 'Owner registered successfully',
      owner: {
        id: newOwner.id,
        username: newOwner.username,
        email: newOwner.email
      }
    });
  } catch (error) {
    console.error('Error registering owner:', error);
    res.status(500).json({ message: 'Error registering owner' });
  }
};

// Create a new restaurant for an owner
const createRestaurant = (req, res) => {
  try {
    const {
      ownerId,
      name,
      image,
      categories,
      cuisine,
      hasFreeDelivery,
      minOrder,
      description,
      deliveryTime
    } = req.body;
    
    // Validate required fields
    if (!ownerId || !name || !image || !categories || !cuisine || !minOrder || !description || !deliveryTime) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const restaurantsData = readRestaurantsData();
    const ownersData = readOwnersData();
    
    // Check if restaurant already exists for this owner
    if (restaurantsData.restaurants.some(restaurant => restaurant.id === ownerId)) {
      return res.status(400).json({ message: 'Restaurant already exists for this owner' });
    }
    
    // Create new restaurant
    const newRestaurant = {
      id: ownerId, // Use the same ID as the owner
      name,
      image,
      categories,
      rating: 0,
      deliveryTime: parseInt(deliveryTime),
      cuisine,
      hasFreeDelivery: !!hasFreeDelivery,
      minOrder: parseFloat(minOrder),
      description,
      isOpen: true,
      menu: []
    };
    
    // Add new restaurant to the list
    restaurantsData.restaurants.push(newRestaurant);
    writeRestaurantsData(restaurantsData);
    
    // Update the owner's restaurantId
    const ownerIndex = ownersData.owners.findIndex(owner => owner.id === ownerId);
    if (ownerIndex !== -1) {
      ownersData.owners[ownerIndex].restaurantId = ownerId;
      writeOwnersData(ownersData);
    }
    
    res.status(201).json({
      message: 'Restaurant created successfully',
      restaurant: newRestaurant
    });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({ message: 'Error creating restaurant' });
  }
};

// Get owner's restaurant
const getOwnerRestaurant = (req, res) => {
  try {
    const { ownerId } = req.params;
    const ownersData = readOwnersData();
    const restaurantsData = readRestaurantsData();

    // Log the owner ID we're looking for to help debug
    console.log('Looking for owner ID:', ownerId);
    
    const owner = ownersData.owners.find(o => o.id === ownerId);
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }
    
    // Log the restaurant ID we're looking for to help debug
    console.log('Owner found, looking for restaurant ID:', owner.restaurantId);
    
    // Convert IDs to strings to ensure consistent comparison
    const restaurant = restaurantsData.restaurants.find(r => 
      String(r.id) === String(owner.restaurantId)
    );
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json(restaurant);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ message: 'Error fetching restaurant' });
  }
};

// Update restaurant details
const updateRestaurant = (req, res) => {
  try {
    const { ownerId } = req.params;
    const { name, cuisine, location, image } = req.body;
    const ownersData = readOwnersData();
    const restaurantsData = readRestaurantsData();

    const owner = ownersData.owners.find(o => o.id === ownerId);
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    const restaurantIndex = restaurantsData.restaurants.findIndex(r => r.id === owner.restaurantId);
    if (restaurantIndex === -1) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Update restaurant details
    restaurantsData.restaurants[restaurantIndex] = {
      ...restaurantsData.restaurants[restaurantIndex],
      name: name || restaurantsData.restaurants[restaurantIndex].name,
      cuisine: cuisine || restaurantsData.restaurants[restaurantIndex].cuisine,
      location: location || restaurantsData.restaurants[restaurantIndex].location,
      image: image || restaurantsData.restaurants[restaurantIndex].image
    };

    writeRestaurantsData(restaurantsData);
    res.json(restaurantsData.restaurants[restaurantIndex]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating restaurant' });
  }
};

module.exports = {
  loginOwner,
  registerOwner,
  createRestaurant,
  getOwnerRestaurant,
  updateRestaurant
}; 