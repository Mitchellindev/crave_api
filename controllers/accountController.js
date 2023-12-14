const Users = require('../models/accountModel')
const session = require('express-session');
// const bcrypt = require('bcrypt')
// const multer = require('multer')
// const path = require('path')


// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'upload')
//     },
//     filename: (req, file, cb) => {
//       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//       const ext = path.extname(file.originalname);
//       cb(null, file.fieldname + '-' + uniqueSuffix + ext);
//     }
// })

// const profilePicture = multer({ storage: storage }).single('profilePicture')


const accountSettings = async (req, res) => {
    const userId = req.session.user._id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, phoneNumber, password, email, dietaryPreference, foodAllergies, healthConditions } = req.body;



    
    try {
        const updateUser = await Users.findOneAndUpdate(
            { _id: userId },
            {
                name,
                phoneNumber,
                password,
                email,
                dietaryPreference,
                foodAllergies,
                healthConditions
            },
            { new: true },
        )

        if (!updateUser) {
            return res.status(400).json({ message: "User not found" })
        }


        // return res.status(200).json({ message: "Profile Detailed successfully updated!", updateUser})
        req.flash('success', "Account successfully updated!");
        res.redirect('/user/account-settings');
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error"})
    }
}



const accountProfile = async (req, res) => {
    const userId = req.session.user._id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { fullName, username, email, gender, expertise, bio, benefit } = req.body;



    
    try {
        const updateUser = await Users.findOneAndUpdate(
            { _id: userId },
            {
                fullName,
                username,
                email,
                gender,
                expertise,
                bio,
                benefit
            },
            { new: true },
        )

        if (!updateUser) {
            return res.status(400).json({ message: "User not found" })
        }


        // return res.status(200).json({ message: "Profile Detailed successfully updated!", updateUser})
        req.flash('success', "Profile Details successfully updated!");
        res.redirect('/user/account-settings');
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error"})
    }
}




const emailSettings = async (req, res) => {
    const userId = req.session.user._id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { newEmail } = req.body;

    try {
        const userEmail = await Users.findOne({ _id: userId });

        if (!userEmail) {
            throw { statusCode: 404, message: "User does not exist!" };
        }

        req.flash('success', "Email successfully updated!");
        res.redirect('/user/account-settings');
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Failed to update Email"})
    }
}



//     userEmail.email = newEmail;
    //     await userEmail.save();

    //     return res.send("Email Successfully Updated!")
    // } catch (error) {
    //     console.error(error);
    //     return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to update Email' });
    // }




const tutorProfile = async (req, res) => {
    const userId = req.session.user._id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { yearsOfExperience, socialMediaLink, expertise, bio } = req.body;



    
    try {
        const updateUser = await Users.findOneAndUpdate(
            { _id: userId },
            {
                yearsOfExperience,
                socialMediaLink,
                expertise,
                bio
            },
            { new: true },
        )

        if (!updateUser) {
            return res.status(400).json({ message: "User not found" })
        }


        // return res.status(200).json({ message: "Profile Detailed successfully updated!", updateUser})
        req.flash('success', "Tutor Profile Details successfully updated!");
        res.redirect('/user/account-settings');
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error"})
    }
}



exports.accountProfile = accountProfile
exports.accountSettings = accountSettings
exports.emailSettings = emailSettings
exports.tutorProfile = tutorProfile
// exports.profilePicture = profilePicture
// exports.viewProfilePicture = viewProfilePicture
// exports.editProfilePicture = editProfilePicture
// exports.deleteProfilePicture = deleteProfilePicture