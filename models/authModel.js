const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        lowercase: true,
        unique: true        
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    confirmPassword: {
        type: String,
        required: true,
        minlength: 6
    },
    },
    {
        timestamps: {
            createdAt: 'joinedOn',
            updatedAt: 'lastUpdated'
        }
    }
)



module.exports = mongoose.model('User', userSchema)