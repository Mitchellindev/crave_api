const mongoose = require('mongoose')

const Schema = mongoose.Schema

const verificationCodeSchema = new Schema({
        email: {
                type: String,
                required: true,
        },
        verificationCode: {
                type: Number,
                required: true,
        },
        expiresAt: {
                type: Date,
                required: true,
        },
        isVerified: {
                type: Boolean
        }
})


module.exports = mongoose.model('verifyCode', verificationCodeSchema)