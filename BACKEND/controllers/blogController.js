const { readJsonFile, writeJsonFile } = require('../util/fileUtils');

const getBlogs = async (req, res) => {
    try {
        let data;
        try {
            data = await readJsonFile('blogs.json');
        } catch (error) {
            if (error.code === 'ENOENT') {
                data = { blogs: [] };
                await writeJsonFile('blogs.json', data);
            } else {
                throw error;
            }
        }
        // Transform the blogs to have consistent _id field
        const transformedBlogs = data.blogs.map(blog => ({
            ...blog,
            _id: blog._id || blog.id.toString()  // Use existing _id or convert id to string
        }));
        res.json({ blogs: transformedBlogs });
    } catch (error) {
        console.error('Error getting blogs:', error);
        res.status(500).json({ message: error.message });
    }
};

const getBlogById = async (req, res) => {
    try {
        const { blogs } = await readJsonFile('blogs.json');
        const blog = blogs.find(b => (b._id === req.params.id || b.id.toString() === req.params.id));
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        // Transform the blog to have consistent _id field
        const transformedBlog = {
            ...blog,
            _id: blog._id || blog.id.toString()
        };
        res.json({ blog: transformedBlog });
    } catch (error) {
        console.error('Error getting blog by id:', error);
        res.status(500).json({ message: error.message });
    }
};

const createBlog = async (req, res) => {
    try {
        const { title, content, author, img, category } = req.body;
        
        console.log('Received blog data:', req.body); // Debug log
        
        if (!title || !content || !author) {
            return res.status(400).json({ message: "Title, content, and author are required" });
        }

        let data;
        try {
            data = await readJsonFile('blogs.json');
        } catch (error) {
            if (error.code === 'ENOENT') {
                data = { blogs: [] };
            } else {
                throw error;
            }
        }

        // Find the highest existing ID and increment by 1
        const highestId = data.blogs.reduce((max, blog) => {
            const currentId = parseInt(blog._id || blog.id);
            return currentId > max ? currentId : max;
        }, 0);
        const newId = (highestId + 1).toString();

        const newBlog = {
            _id: newId,
            title,
            content,
            author,
            img: img || '/default-blog-image.jpg',
            category: category || 'Uncategorized',
            createdAt: new Date().toISOString()
        };

        console.log('Creating new blog:', newBlog); // Debug log

        data.blogs.push(newBlog);
        await writeJsonFile('blogs.json', data);
        
        console.log('Blog created successfully'); // Debug log
        
        res.status(201).json({ blog: newBlog });
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateBlog = async (req, res) => {
    try {
        const { blogs } = await readJsonFile('blogs.json');
        const id = parseInt(req.params.id);
        const index = blogs.findIndex(b => b.id === id);
        if (index === -1) {
            return res.status(404).json({ message: "Blog not found" });
        }
        blogs[index] = { ...blogs[index], ...req.body, id };
        await writeJsonFile('blogs.json', { blogs });
        res.json(blogs[index]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteBlog = async (req, res) => {
    try {
        let data = await readJsonFile('blogs.json');
        const blogId = req.params.id;
        
        const index = data.blogs.findIndex(b => 
            (b._id === blogId || b.id.toString() === blogId)
        );
        
        if (index === -1) {
            return res.status(404).json({ message: "Blog not found" });
        }

        data.blogs.splice(index, 1);
        await writeJsonFile('blogs.json', data);
        res.json({ message: "Blog deleted successfully" });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog
};
