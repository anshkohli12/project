const { readJsonFile, writeJsonFile } = require('../util/fileUtils');

const getCart = async (req, res) => {
    try {
        const { userId } = req.params;
        const { carts } = await readJsonFile('carts.json');
        const userCart = carts.find(cart => cart.userId === userId);
        res.json(userCart || { userId, items: [] });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
};

const addToCart = async (req, res) => {
    try {
        const { userId } = req.params;
        const { itemId, name, price, quantity, restaurantId, image } = req.body;
        
        const data = await readJsonFile('carts.json');
        if (!data.carts) {
            data.carts = [];
        }

        let userCart = data.carts.find(cart => cart.userId === userId);

        if (!userCart) {
            userCart = { userId, items: [] };
            data.carts.push(userCart);
        }

        const existingItem = userCart.items.find(item => item.itemId === itemId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            userCart.items.push({ 
                itemId, 
                name, 
                price, 
                quantity,
                restaurantId,
                image 
            });
        }

        await writeJsonFile('carts.json', data);
        res.json(userCart);
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ error: 'Failed to add item to cart' });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const { userId } = req.params;
        const { itemId, quantity } = req.body;

        const data = await readJsonFile('carts.json');
        if (!data.carts) {
            data.carts = [];
        }

        const userCart = data.carts.find(cart => cart.userId === userId);

        if (!userCart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const item = userCart.items.find(item => item.itemId === itemId);
        if (!item) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }

        item.quantity = quantity;
        
        if (quantity <= 0) {
            userCart.items = userCart.items.filter(item => item.itemId !== itemId);
        }

        await writeJsonFile('carts.json', data);
        res.json(userCart);
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ error: 'Failed to update cart' });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const { userId, itemId } = req.params;
        
        const data = await readJsonFile('carts.json');
        if (!data.carts) {
            data.carts = [];
        }

        const userCart = data.carts.find(cart => cart.userId === userId);

        if (!userCart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        userCart.items = userCart.items.filter(item => item.itemId !== itemId);
        await writeJsonFile('carts.json', data);
        res.json(userCart);
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ error: 'Failed to remove item from cart' });
    }
};

const clearCart = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const data = await readJsonFile('carts.json');
        if (!data.carts) {
            data.carts = [];
        }

        const userCart = data.carts.find(cart => cart.userId === userId);

        if (!userCart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        userCart.items = [];
        await writeJsonFile('carts.json', data);
        res.json(userCart);
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};
