const { readJsonFile, writeJsonFile } = require('../util/fileUtils');
const bcrypt = require('bcrypt');
const path = require('path');

const SALT_ROUNDS = 10;
const USERS_FILE = 'users.json';

// Helper function to read users data
const readUsersData = async () => {
    try {
        return await readJsonFile(USERS_FILE);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return { users: [] };
        }
        throw error;
    }
};

// Helper function to write users data
const writeUsersData = async (data) => {
    try {
        await writeJsonFile(USERS_FILE, data);
    } catch (error) {
        throw error;
    }
};

const getUsers = async (req, res) => {
    try {
        const { users } = await readUsersData();
        res.json({ 
            users: users.map(u => ({ 
                id: u.id, 
                name: u.username, 
                email: u.email 
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const { users } = await readUsersData();
        const user = users.find(u => u.id === req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ id: user.id, username: user.username, email: user.email });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const { users } = await readUsersData();
        
        if (users.find(u => u.username === username)) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        if (users.find(u => u.email === email)) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const newUser = {
            id: String(users.length + 1),
            username,
            email,
            password: hashedPassword
        };

        users.push(newUser);
        await writeUsersData({ users });
        
        res.status(201).json({ 
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const { users } = await readUsersData();
        
        const user = users.find(u => u.username === username);
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.json({ 
            message: 'Logged in successfully', 
            user: {
                id: user.id, 
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, username } = req.body;
        
        if (!email && !username) {
            return res.status(400).json({ message: 'At least one field (email or username) is required' });
        }

        const { users } = await readUsersData();
        const userIndex = users.findIndex(u => u.id === id);
        
        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if new username is already taken
        if (username && username !== users[userIndex].username) {
            const usernameExists = users.some((u, idx) => idx !== userIndex && u.username === username);
            if (usernameExists) {
                return res.status(400).json({ message: 'Username already exists' });
            }
        }

        // Check if new email is already taken
        if (email && email !== users[userIndex].email) {
            const emailExists = users.some((u, idx) => idx !== userIndex && u.email === email);
            if (emailExists) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }

        users[userIndex] = {
            ...users[userIndex],
            email: email || users[userIndex].email,
            username: username || users[userIndex].username
        };

        await writeUsersData({ users });
        
        res.json({ 
            message: 'User updated successfully',
            user: {
                id: users[userIndex].id,
                username: users[userIndex].username,
                email: users[userIndex].email
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await readUsersData();
        
        const userIndex = data.users.findIndex(user => user.id === id);
        
        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        data.users.splice(userIndex, 1);
        await writeUsersData(data);
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
};

module.exports = {
    getUsers,
    getUserById,
    registerUser,
    updateUser,
    deleteUser,
    loginUser
};
