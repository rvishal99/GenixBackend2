import AppError from "../Utilities/error.util.js";
import User from "../models/user.model.js";
import cloudinary from "cloudinary"

import fs from 'fs/promises'

import { sendEmail } from "../Utilities/sendEmail.js";
import crypto from 'crypto';


const cookieOptions = {
    maxAge:  2* 60 * 60 * 1000, 
    httpOnly: true,
    secure: true
}


const register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        console.log(firstName, lastName, email, password)
        if (!firstName || !lastName || !email || !password) {
            return next(new AppError('All fields are required', 400))
        }

        const userExists = await User.findOne({ email });


        if (userExists) {
            return next(new AppError('Email Already exists', 400));
        }
     

        const user = await User.create({
            firstName,
            lastName,
            email,
            password
        })

        if (!user) {
            console.log("4")
            return next(new AppError('User Registeration failed, please try again later', 400))
        }

        

      
        await user.save();

        const token = await user.generateJWTToken()

        user.password = undefined; // dont send back password to user

        // res.cookie('token', token, cookieOptions);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user,
        })
    } catch (error) {

        return next(new AppError(error || 'User registration failed, please try again', 500))
    }


};
const login = async (req, res, next) => {

    const { email, password, keep } = req.body;
    console.log("keep: ", keep)


    // if (token) {
    //     try {
    //         console.log("reached")
    //         const decoded = jwt.verify(token, JWT_SECRET);
    //         if (decoded.email === email) {
    //             return { success: true, message: 'Successfully signed in' };
    //         } else {
    //             return { success: false, message: 'Email does not match' };
    //         }
    //     } catch (error) {
    //         return { success: false, message: 'Invalid token' };
    //     }
    // }


    try {
        if (!password) {
            return next(new AppError('All fields are required', 400))
        }


        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return next(new AppError('Email doesnt exist!', 400))
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return next(new AppError('Incorrect Password!', 400))
        }

        const token = await user.generateJWTToken();

        user.password = undefined

        if (keep) {
            res.cookie('token', token, cookieOptions);
        }

        res.status(200).json({
            success: true,
            message: 'User loggedIn successfully',
            user,
            token
        });
    }
    catch (e) {
        return next(new AppError(e.message, 500));
    }
};
const logout = (req, res) => {
    res.cookie('token', null, {
        secure: true,
        httpOnly: true,
        maxAge: 0
    })

    res.status(200).json({
        success: true,
        message: "User Logged out successfully"
    })
};
const getProfile = async (req, res, next) => {
    try {
        const { id } = req.params;
        // console.log(userId)

        const user = await User.findById(id);

        res.status(200).json({
            success: true,
            message: 'User details',
            user
        })
    }
    catch (e) {
        return next(new AppError('Failed to fetch Profile Details', 500))
    }


};

const forgotPassword = async (req, res, next) => {
    let { email } = req.body;
    if (email == " ") {
        return next(new AppError('Email is required', 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError('Email is not registered', 400));
    }

    const resetToken = await user.generatePasswordResetToken();

    await user.save();

    let emailId = email.split(".com")[0];


    const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}${emailId}`;

    console.log(resetPasswordURL)

    const subject = 'Forgot Password'
    const message = `you can reset your password by clicking <a href=${resetPasswordURL} target = '_blank'>Reset Your Password</a>\n If the above link doesn't work for some reason then copy paste this link in new tab ${resetPasswordURL}.`

    try {
        await sendEmail(email, subject, message);
        res.status(200).json({
            success: true,
            message: `Reset password token has been sent to ${email} sucessfully`
        })

    } catch (error) {

        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;


        await user.save();

        return next(new AppError(error.message, 500));
    }
}
const resetPassword = async (req, res, next) => {

    const { resetToken } = req.params;

    const { password } = req.body;

    console.log(password, resetToken)
    if (password == " ") {
        return next(new AppError('Password is required', 400));
    }

    const forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');


    const user = await User.findOne({
        forgotPasswordToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    });


    if (!user) {
        return next(new AppError('Token is invalid or expired, please try again', 400));
    }

    user.password = password;


    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save();


    res.status(200).json({
        success: true,
        message: 'Password changed successfully!!'
    })

}

const changePassword = async (req, res, next) => {

    const { oldPassword, newPassword, email } = req.body;

    if (oldPassword == " " || newPassword == " ") {
        return next(new AppError('All fields are mandatory', 400));
    }


    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new AppError('User Doesnt Exist', 400));
    }

    const isPasswordValid = await user.comparePassword(oldPassword);


    if (!isPasswordValid) {
        return next(new AppError('Invalid old password', 400));

    }

    user.password = newPassword;

    await user.save();

    user.password = undefined;

    res.status(200).json({
        success: true,
        message: 'Password Changed Successfully!'
    })

}


export {
    register, login, logout, getProfile, forgotPassword, resetPassword, changePassword
}