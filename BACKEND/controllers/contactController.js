const { readJsonFile, writeJsonFile } = require('../util/fileUtils');
const path = require('path');

const CONTACTS_FILE = 'contacts.json';

// Helper function to read contacts data
const readContactsData = async () => {
    try {
        return await readJsonFile(CONTACTS_FILE);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return { contacts: [] };
        }
        throw error;
    }
};

// Helper function to write contacts data
const writeContactsData = async (data) => {
    try {
        await writeJsonFile(CONTACTS_FILE, data);
    } catch (error) {
        throw error;
    }
};

// Get all contacts
const getContacts = async (req, res) => {
    try {
        const data = await readContactsData();
        res.json({ contacts: data.contacts });
    } catch (error) {
        console.error('Error getting contacts:', error);
        res.status(500).json({ message: 'Error retrieving contacts' });
    }
};

// Submit a new contact form
const submitContact = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Read existing contacts
        const data = await readContactsData();

        // Create new contact
        const newContact = {
            _id: Date.now().toString(),
            name,
            email,
            message,
            createdAt: new Date().toISOString()
        };

        // Add to contacts array
        data.contacts.push(newContact);

        // Save updated contacts
        await writeContactsData(data);

        res.status(201).json({ 
            message: 'Contact form submitted successfully',
            contact: newContact 
        });
    } catch (error) {
        console.error('Error submitting contact:', error);
        res.status(500).json({ message: 'Error submitting contact form' });
    }
};

module.exports = {
    getContacts,
    submitContact
};
