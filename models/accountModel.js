const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userAccountSchema = new Schema(
    {
        profilePicture: {
            type: String
        },
        fullName: {
            type: String
        },
        userame: {
            type: String
        },
        name: {
            type: String
        },
        email: {
            type: String
        },
        gender: {
            type: String
        },
        expertise: {
            type: String
        },
        bio: {
            type: String
        },
        benefit: {
            type: String
        },
        password: {
            type: String
        },
        phoneNumber: {
            type: Number
        },
        dietaryPreference: {
            type: String
        },
        foodAllergies: {
            type: String,
        },
        healthConditions: {
            type: String
        },
        yearsOfExperience: {
            type: String
        },
        socialMediaLinks: {
            type: String
        },
    },


    {
        timestamps: true,
    }
)


module.exports = mongoose.model('Users', userAccountSchema)