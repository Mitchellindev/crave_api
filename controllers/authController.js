const User = require('../models/authModel')
const verifyCode = require('../models/resetPassword')
const bcrypt = require('bcrypt')
const session = require('express-session');
// const jwt = require('jsonwebtoken')
const moment = require('moment')
const nodemailer = require('nodemailer')
// const dotenv = require('dotenv').config();
const { body, validationResult } = require('express-validator');



const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: 'wiseapp52@gmail.com',
        pass: 'rdmmiysnuyruxsfj'
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    }
    else {
        console.log('Ready for messages');
        console.log(success);
    }
});


const userSignup = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);      

    //   req.flash('error', errorMessages);
    //   req.flash('formData', req.body);
    //   res.redirect('/user/signup');
    //   return;
    }

    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
        return res.status(200).json({ message: "All field are required!"})
        // req.flash('error', "All Fields are required");
        // res.redirect('/user/signup')
        // return;
    }

    const user = await User.findOne({ email })
    if (user) {
        // req.flash('error', "User Already Exist");
        // res.redirect('/user/signup')
        // return;
        return res.status(404).json({ message: "User already exist, proceed to Login"})
    }
    
    const hashedPassword = bcrypt.hashSync(password, 10)

    const newUser = new User({
        username,
        email,
        password,
        confirmPassword,
        password: hashedPassword,
        confirmPassword:hashedPassword
    })

    try {
        await newUser.save()

        req.session.user = {
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            profilePicture: newUser.profilePicture
        };
        

        req.flash('success', "User Successfully Created");
        return res.redirect('/user/login')

    } catch (error) {
        console.log(error)
        // req.flash('error', "Internal Server Error");
        return res.status(500).json({message: "Internal Server Error"})
    }
    // return res.status(201).json({message: "User has successfully Signed up their account.", newUser})
    // return res.redirect('/user/login')
}




const userLogin = async (req, res) => {
    const { email, password } = req.body

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
      

      req.flash('error', errorMessages);
      res.redirect('/user/login');
      return;
    }

    if (!email || !password) {
        // return res.status(404).json({ message: "All fields are required!"})
        //  req.flash('error', "All Fields are required");
        //  res.redirect('/user/login');
    }


    try {
        const existingUser = await User.findOne({ email })

        const correctPassword = await bcrypt.compare(password, existingUser.password)
        if (!correctPassword) {
            return res.status(400).json({message: "Incorrect Email/Password!"})
        }


        req.session.user = {
            _id: existingUser._id,
            username: existingUser.username,
            email: existingUser.email,
            profilePicture: existingUser.profilePicture
        };

        req.session.user = existingUser;
        req.flash('success', "Login Successfull");
        return res.redirect('/user/account-settings')
    } catch (error) {
        console.log(error)
        req.flash('error', "Internal Server Error");
    }
}



const forgetPassword = async (req, res) => {
    const { email } = req.body;

    const existingUser = await User.findOne({ email })
    if (!existingUser) {
        return res.status(404).json({ message: "User does not exist"})
    }

    const verificationCode = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
    const expirations = moment().add(10, 'minutes').toDate();

    req.session.verificationCode = verificationCode;
    req.session.verificationExpiration = expirations;
    req.session.email = email;

    const userForgetPassword = new verifyCode({
        email,
        verificationCode,
        expiresAt: expirations,
    })

    try {
        await userForgetPassword.save()
    } catch (error) {
        return res.status(500).json({message: "Internal Server Error"})
    }

    const mailOptions = {
        from: 'wiseapp52@gmail.com',
        to: email,
        subject: "Verification Code",
        html: `<p>Your password recovery code is: <b>${verificationCode}</b>. Kindly note that this code is valid for <b>10 min</b>.</P>`
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
    });
      

    req.flash('formData', req.body);
    req.flash('success', "Verification Code has been sent to your mail");

    return res.redirect('/user/verify-code')
}


const verificationCode = async (req, res) => {
    const { verificationCode, email } = req.body

    try {
        const recoveryCode = await verifyCode.findOne({ email })

        if (!recoveryCode) {
            req.flash('error', "User not found!");
            req.flash('formData', req.body);
            return res.redirect('/user/verify-code')

        }

        if (recoveryCode.verificationCode != verificationCode) {
            req.flash('error', "Invalid Verification Code");
            req.flash('formData', req.body);
            return res.redirect('/user/verify-code')
        }

        const currentTime = moment();
        if (currentTime.isAfter(recoveryCode.expiresAt)) {
            req.flash('error', "Recovery code has expired");
            req.flash('formData', req.body);
            return res.redirect('/user/verify-code')
        }
    
        
        recoveryCode.isVerified = true;
        
        try {
            await recoveryCode.save()
            req.flash('formData', req.body);
            req.flash('success', "Verification successful");
            return res.redirect('/user/reset-password')

        } catch (error) {
            req.flash('error', "Internal Server Error");
            return res.redirect('/user/login')
        }

    } catch (error) {
        req.flash('error', "Internal Server Error");
        return res.redirect('/user/login')
    }
}


const passwordReset = async (req, res) => {
    const { newPassword, confirmPassword } = req.body;
    // const userId = req.session.userId;
  
    const resetPassword = await verifyCode.findOne({
        verificationCode,
        expiresAt: { $gt: new Date() },
    });
  
    if (!resetPassword) {
        req.flash('formData', req.body);
        req.flash('error', "Invalid or expired recovery code");
        return res.redirect('/user/reset-password')
    }

    const existingUser = await User.findOne({ email: resetPassword.email });
  
    if (!existingUser) {
        req.flash('formData', req.body);
        req.flash('error', "User not found");
        return res.redirect('/user/reset-password')
    }

    if (newPassword === existingUser.password) {
        req.flash('formData', req.body);
        req.flash('error', "New password must be different from the old password");
        return res.redirect('/user/reset-password')
    }

    if (newPassword !== confirmPassword) {
        req.flash('formData', req.body);
        req.flash('error', "Password and confirm password do not match");
        return res.redirect('/user/reset-password')
    }
    console.log(newPassword)
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    existingUser.password = hashedPassword;

    await existingUser.save();

    try{
        await verifyCode.deleteOne({ _id: resetPassword._id });


        const isPasswordCorrect = bcrypt.compare(newPassword, existingUser.password);
        if (!isPasswordCorrect) {
            req.flash('formData', req.body);
            req.flash('error', "Invalid Email/Password");
            return res.redirect('/user/reset-password')    
        }
        return res.redirect('/user/login')

    } catch (error) {
      console.error('Error resetting password:', error);
      req.flash('error', "Failed to reset password");
      return res.redirect('/user/login')    
    }

}




























// const userSignup = async (req, res) => {

//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {
//         const errorMessages = errors.array().map(error => error.msg);      

//       req.flash('error', errorMessages);
                                              
//       ('formData', req.body);     
//        res.redirect('/user/signup');
//       return;
//     }

    // res.send(req.body)
    // const { username, email, password, confirmPassword } = req.body;

    // if (!username || !email || !password || !confirmPassword) {
        // return res.status(200).json({ message: "All field are required!"})
    //      req.flash('error', "All Fields are required");
    //     res.redirect('/user/signup')
    //     return;
    // }

    // const user = await User.findOne({ email })
    // if (user) {
    //     req.flash('error', "User Already Exist");
    //     res.redirect('/user/signup')
    //     return;
        // return res.status(404).json({ message: "User already exist, proceed to Login"})
    // }

    // if (password !== confirmPassword) {
    //     return res.status(404).json({ message: 'Password and confirm Password do not match!'})
    // }

    // const hashedPassword = await bcrypt.hash(password, 10)

    // const newUser = new User({
    //     username,
    //     email,
    //     password,
    //     confirmPassword,
    //     password: hashedPassword
    // })

    // try {
    //     await newUser.save()
    //     req.flash('success', "User Successfully Created");
    //     return res.redirect('/user/login')

    // } catch (error) {
    //     console.log(error)
    //     req.flash('error', "Internal Server Error");
        // return res.status(500).json({message: "Internal Server Error"})
    // }

    // return res.status(201).json({message: "User has successfully Signed up their account.", newUser})
    // return res.redirect('/user/login')
// }


// const userLogin = async (req, res) => {
//     const { email, password } = req.body

//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         const errorMessages = errors.array().map(error => error.msg);
      

//       req.flash('error', errorMessages);
//       res.redirect('/user/login');
//       return;
//     }

//     if (!email || !password) {
//         // return res.status(404).json({ message: "All fields are required!"})
//          req.flash('error', "All Fields are required");
//          res.redirect('/user/login');
//     }


//     try {
//         const existingUser = await User.findOne({ email })

//         req.session.user = existingUser;
//         req.flash('success', "Login Successfull");
//         return res.redirect('/user/home')
//     } catch (error) {
//         console.log(error)
//     }
    
// }


// const forgetPassword = async (req, res) => {
//     const { email } = req.body;

//     const existingUser = await User.findOne({ email })
//     if (!existingUser) {
//         return res.status(404).json({ message: "User does not exist"})
//     }

//     const verificationCode = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
//     const expirations = moment().add(1, 'hour').toDate();

//     const userForgetPassword = new verifyCode({
//         email,
//         verificationCode,
//         expiresAt: expirations,
//     })

//     try {
//         await userForgetPassword.save()
//     } catch (error) {
//         return res.status(500).json({message: "Internal Server Error"})
//     }

//     const mailOptions = {
//         from: 'wiseapp52@gmail.com',
//         to: email,
//         subject: "Verification Code",
//         html: `<p>Your password recovery code is: <b>${verificationCode}</b>. Kindly note that this code is valid for <b>10 min</b>.</P>`
//     }

//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//           console.error('Error sending email:', error);
//         } else {
//           console.log('Email sent:', info.response);
//         }
//     });
      

//     req.flash('formData', req.body);
//     req.flash('success', "Verification Code has been sent to your mail");

//     return res.redirect('/user/verify-code')
// }


// const verificationCode = async (req, res) => {
//     const { verificationCode, email } = req.body

//     try {
//         const recoveryCode = await verifyCode.findOne({ email })

//         if (!recoveryCode) {
//             req.flash('error', "User not found!");
//             req.flash('formData', req.body);
//             return res.redirect('/user/verify-code')

//         }

//         if (recoveryCode.verificationCode != verificationCode) {
//             req.flash('error', "Invalid verification Code");
//             req.flash('formData', req.body);
//             return res.redirect('/user/verify-code')
//         }

//         const currentTime = moment();
//         if (currentTime.isAfter(recoveryCode.expiresAt)) {
//             req.flash('error', "Recovery code has expired");
//             req.flash('formData', req.body);
//             return res.redirect('/user/verify-code')
//         }
    
        
//         recoveryCode.isVerified = true;
        
//         try {
//             await recoveryCode.save()
//             req.flash('formData', req.body);
//             req.flash('success', "Verification successful");
//             return res.redirect('/user/reset-password')
//         } catch (error) {
//             req.flash('error', "Internal Server Error");
//             return res.redirect('/user/login')
//         }
    
//     } catch (error) {
//         req.flash('error', "Internal Server Error");
//         return res.redirect('/user/login')
//     }
// }


// const passwordReset = async (req, res) => {
//     const { verificationCode, newPassword, confirmPassword } = req.body;
  
//     const resetPassword = await verifyCode.findOne({
//         verificationCode,
//         expiresAt: { $gt: new Date() },
//     });
  
//     if (!resetPassword) {
//         req.flash('formData', req.body);
//         req.flash('error', "Invalid or expired recovery code");
//         return res.redirect('/user/reset-password')
//     }

//     const existingUser = await User.findOne({ email: resetPassword.email });
  
//     if (!existingUser) {
//         req.flash('formData', req.body);
//         req.flash('error', "User not found");
//         return res.redirect('/user/reset-password')
//     }

//     if (newPassword === existingUser.password) {
//         req.flash('formData', req.body);
//         req.flash('error', "New password must be different from the old password");
//         return res.redirect('/user/reset-password')
//     }

//     if (newPassword !== confirmPassword) {
//         req.flash('formData', req.body);
//         req.flash('error', "Password and confirm password do not match");
//         return res.redirect('/user/reset-password')
//     }
// console.log(newPassword)
//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     existingUser.password = hashedPassword;

//     await existingUser.save();
  
//     try {

//         await verificationCode.deleteOne({ _id: resetPassword._id });


//         const isPasswordCorrect = bcrypt.compare(newPassword, existingUser.password);
//         if (!isPasswordCorrect) {
//             req.flash('formData', req.body);
//             req.flash('error', "Invalid Email/Password");
//             return res.redirect('/user/reset-password')    
//         }

        // const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // console.log('Generated Token\n', token);

        // if (req.cookies[`${existingUser._id}`]) {
        //     req.cookies[`${existingUser._id}`] = '';
        // }

        // res.cookie(String(existingUser._id), token, {
        //     path: '/',
        //     expires: new Date(Date.now() + 1000 * 30),
        //     httpOnly: true,
        //     sameSite: 'lax',
        // });
      
        // return res.status(200).json({ message: 'Password reset successful and user can successfully log in', existingUser});
//         return res.redirect('/user/login')

//     } catch (error) {
//       console.error('Error resetting password:', error);
//       req.flash('error', "Failed to reset password");
//       return res.redirect('/user/login')    
//     }
// }

// Logout
// const userLogout = (req, res) => {
//     req.session.destroy((err) => {
//       if (err) console.error(err);
//       res.redirect('/user/login');
//     });
//   };
  



exports.userSignup = userSignup;
exports.userLogin = userLogin;
// exports.userLogout = userLogout;
exports.forgetPassword = forgetPassword;
exports.verificationCode = verificationCode;
exports.passwordReset = passwordReset;
