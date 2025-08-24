import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
dotenv.config()

const userSchema = new mongoose.Schema({
       name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phoneNumber: {
            type: String,
            unique: true,
         },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['ADMIN','USER'],
            default:'USER'
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        refreshToken: {
            type: String
        },
    }, {
        timestamps: true
    })
/** pre save hooks */
userSchema.pre("save", async function (next) {
    const user = this;
    if (!user.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
});
/** method for comparing the password */
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

//Generate Access Token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
            _id: this._id,
            email: this.email,
            name: this.name,
            role: this.role,
        },
        process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};


export const User = mongoose.model('User',userSchema)