const mongoose = require('mongoose')

const dbConnect = async () => {
    
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI environment variable is not set.');
            return;
        }
    
        try {
            const connect = await mongoose.connect(process.env.MONGODB_URI);
            console.log('Database Connected Successfully!');
        } catch (error) {
            console.error('Error connecting to the database:', error);
        }
    };
    
    module.exports = dbConnect;
    