import { COOKIE_OPTIONS } from "../../constants.js";
import { OTP } from "../models/Otp.js";
import { User } from "../models/User.js";
import { sendPasswordResetOTPOnMail, sendRegistrationOTPOnMail } from "../utils/email/emailTemplate.js";
import ApiError from "../utils/error/ApiError.js";
import { asyncHandler } from "../utils/error/asyncHandler.js";
import { generateOTP } from "../utils/generateOtp.js";

 
export const signup_controller = asyncHandler(async(req, res, next)=>{
   const {name,email, phoneNumber, role, password} = req.body;
   console.log("the request body is", req.body)
   const otp = generateOTP()
   if(!name,!email,!phoneNumber,!role,!password){
    return next(new ApiError('Invalid Fields',400))
   }
   const existingUser = await User.findOne({ email })
   try {
    if (existingUser) {
               if(existingUser?.isVerified){
               return next(new ApiError('User Already Exist', 400))
               }
     }
 
    await User.create({
        ...req?.body,
        isVerified : true
    }); // thsi will through error if user creation fails
    res.status(201).json({
        success: true,
        message: "User Registered successfully",
    });
    }
    catch (error) {
        console.error("Error Sending OTP:", error);
        return next(new ApiError(`Failed to send OTP: ${error.message}`, 400));
    }
})


export const login = asyncHandler(async (req, res, next) => {
    const {
        email,
        password
    } = req?.body;
    if (!email || !password) {
        return next(new ApiError("All fields are required", 400));
    }
    const existingUser = await User.findOne({
        email
    });
    if (!existingUser) return next(new ApiError("User not found", 400));

     if (!existingUser.isVerified) {
        return next(
            new ApiError("Please verify your email before logging in.", 403)
        );
    }

    const isValidPassword = await existingUser.isPasswordCorrect(password);

    if (!isValidPassword) {
        return next(new ApiError("Wrong password", 400));
    }

    const access_token = existingUser.generateAccessToken();
    const refresh_token = existingUser.generateRefreshToken();
    existingUser.refreshToken = refresh_token
    await existingUser.save()
    
    const sanitizedUser = existingUser.toObject();
    sanitizedUser.password = undefined;
    sanitizedUser.createdAt = undefined;
    sanitizedUser.updatedAt = undefined;
    sanitizedUser.refreshToken=undefined
    sanitizedUser.__v = undefined;

    res
        .cookie("access_token", access_token, {
            ...COOKIE_OPTIONS,
            expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
        })
        .cookie("refresh_token", refresh_token, {
            ...COOKIE_OPTIONS,
            expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
        })
        .status(200)
        .json({
            success: true,
            message: "Login Successful",
            user: sanitizedUser,
        });
});


 

 

