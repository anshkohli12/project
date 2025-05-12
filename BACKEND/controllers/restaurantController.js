const { readJsonFile, writeJsonFile } = require('../util/fileUtils');

const getRestaurants = async (req, res) => {
    try {
        const data = await readJsonFile('restaurants.json');
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getRestaurantById = async (req, res) => {
    try {
        const { restaurants } = await readJsonFile('restaurants.json');
        const requestedId = parseInt(req.params.id);
        console.log('Requested Restaurant ID:', requestedId);
        console.log('Available Restaurant IDs:', restaurants.map(r => r.id));
        
        const restaurant = restaurants.find(r => parseInt(r.id) === requestedId);
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        res.json(restaurant);
    } catch (error) {
        console.error('Error in getRestaurantById:', error);
        res.status(500).json({ message: error.message });
    }
};

const createRestaurant = async (req, res) => {
    try {
        // Read both restaurants and owners
        const { restaurants } = await readJsonFile('restaurants.json');
        const { owners } = await readJsonFile('restaurantOwners.json');

        // Validate required fields
        const requiredFields = ['name', 'image', 'categories', 'cuisine', 'address', 'location'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }

        // Validate categories is an array with at least one category
        if (!Array.isArray(req.body.categories) || req.body.categories.length === 0) {
            return res.status(400).json({
                message: 'Categories must be an array with at least one category'
            });
        }

        // Get next sequential ID
        const nextId = restaurants.length > 0 
            ? Math.max(...restaurants.map(r => Number(r.id))) + 1 
            : 1;
        
        console.log('Creating new restaurant with ID:', nextId);

        // Create new restaurant with exact same format as existing ones
        const newRestaurant = {
            id: nextId,
            name: req.body.name,
            image: req.body.image,
            categories: req.body.categories,
            rating: 4.5,  // Default rating
            deliveryTime: req.body.deliveryTime || 30,
            address: req.body.address,
            cuisine: req.body.cuisine,
            isOpen: true,
            hasFreeDelivery: req.body.hasFreeDelivery || false,
            minOrder: req.body.minOrder || 15,
            description: req.body.description || `${req.body.cuisine} restaurant`,
            location: req.body.location
        };

        // Create matching owner entry with same format as existing ones
        const newOwner = {
            id: nextId,
            username: req.body.username,
            password: req.body.password,  // Note: Should be hashed in production
            restaurantId: nextId,
            email: req.body.email
        };

        // Initialize empty menu for the new restaurant
        let menusData = await readJsonFile('menus.json') || { menus: [] };
        if (!menusData.menus) {
            menusData.menus = [];
        }
        console.log('Current menus before adding:', menusData.menus.map(m => m.restaurantId));
        
        // Create new menu entry
        menusData.menus.push({
            restaurantId: nextId,
            items: []
        });
        console.log('Added new menu for restaurant:', nextId);
        
        await writeJsonFile('menus.json', menusData);
        console.log('Saved updated menus file');

        // Save both restaurant and owner
        restaurants.push(newRestaurant);
        owners.push(newOwner);

        await writeJsonFile('restaurants.json', { restaurants });
        await writeJsonFile('restaurantOwners.json', { owners });

        console.log('Successfully created restaurant and initialized empty menu');
        res.status(201).json({
            restaurant: newRestaurant,
            owner: newOwner
        });
    } catch (error) {
        console.error('Error in createRestaurant:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateRestaurant = async (req, res) => {
    try {
        const { restaurants } = await readJsonFile('restaurants.json');
        const index = restaurants.findIndex(r => r.id === parseInt(req.params.id));
        if (index === -1) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        restaurants[index] = { ...restaurants[index], ...req.body, id: parseInt(req.params.id) };
        await writeJsonFile('restaurants.json', { restaurants });
        res.json(restaurants[index]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteRestaurant = async (req, res) => {
    try {
        const { restaurants } = await readJsonFile('restaurants.json');
        const index = restaurants.findIndex(r => r.id === parseInt(req.params.id));
        if (index === -1) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        restaurants.splice(index, 1);
        await writeJsonFile('restaurants.json', { restaurants });
        res.status(204).json("Deleted Successfully");
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getRestaurants,
    getRestaurantById,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant
};
