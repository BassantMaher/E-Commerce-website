import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { redis } from "../lib/redis.js";
import generateVerficationToken from "../utils/generateVerificationCode.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessfulEmail } from "../mailtrap/email.js";
import crypto from "crypto";

const generateToken = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    return { accessToken, refreshToken };
};
const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh_token_${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); // expire in 7 days
};
const setCookies = async (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true, // to prevent XXS attacks
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", // to prevent CSRF attacks
        maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
};

export const Signup = async (req, res, next) => {
    const { email, password, name } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const newUser = await User.create({
            name: name, email: email, password: password,
            verficationToken: verificationToken,
            verficationTokenExpiresAt: Date.now() + 10 * 60 * 1000, // expires in 10 minutes
        });

        await newUser.save();

        // authenticate user 
        const { accessToken, refreshToken } = generateToken(newUser._id);
        await storeRefreshToken(newUser._id, refreshToken);

        setCookies(res, accessToken, refreshToken);

        // verify email
        await sendVerificationEmail(user.email, verificationToken);

        return res.status(201).json({
            newUser: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: "customer",
                verficationToken: verificationToken,
                verficationTokenExpiresAt: Date.now() + 10 * 60 * 1000, // expires in 10 minutes
            }, message: "User created successfully"
        });

    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ message: error.message });
    }

};

export const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        console.log(user.password);
        if (user && (await user.comparePassword(password))) {

            const { accessToken, refreshToken } = generateToken(user._id);
            await storeRefreshToken(user._id, refreshToken);
            setCookies(res, accessToken, refreshToken);

            user.lastLogin = new Date();
            await user.save();

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const Logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            // delete refresh token from redis if existed
            const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET); // decode it because we have the userId in it
            await redis.del(`refresh_token_${decode.userId}`);
        }
        // clear them from the cookies
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// create refresh token api --> recreate the access token 
export const refreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        // if no refresh token --> error
        console.log("refreshToken ====== ", refreshToken);
        if (!refreshToken) {
            return res.status(401).json({ message: "no refresh token found!" });
        }
        // if found then check if the token is valid, if valid then re generate access token , if not then logout
        // decode the token using the secret
        const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        // get the token from redis database
        const storedToken = await redis.get(`refresh_token_${decode.userId}`);
        if (storedToken !== refreshToken) {
            return res.status(401).json({ message: "invalid refresh token" });
        }
        // if the tokens match, correct user not a hacker then create a new access token and save it to cookies
        const accessToken = jwt.sign({ userId: decode.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

        res.cookie("accessToken", accessToken, {
            httpOnly: true, // to prevent XXS attacks
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict", // to prevent CSRF attacks
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        return res.status(200).json({ message: "accessToken refreshed!" });

    } catch (error) {
        console.log("Error in refresh token controller", error.message);
    }
};

export const getProfile = async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "user not found!" });
        }
        // generate reset token
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // expires in 1 hour
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;

        // update the database
        await user.save();
        // send reset email
        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

        res.status(200).json({ message: "Reset password email sent successfully!" });
    } catch (error) {
        console.log("Error in forgotPassword: ", error.message)
    }
};

export const resetPawssord = async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() },
        });
        console.log(user);
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset password token!" });
        }
        //update password, hash it first
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        // remove the tokens from the database
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();
        await sendResetSuccessfulEmail(user.email);

        return res.status(200).json({ message: "password updated successfuly" })
    } catch (error) {
        console.log("Error in forgotPassword: ", error.message);
    }
};

export const verifyEmail = async (req, res) => {
    const { code } = req.body;
    try {
        // find the sent verification code from the database, and check if it is still valid (not expired)
        const user = await User.findOne({
            verficationToken: code,
            verficationTokenExpiresAt: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired verification code" });
        }
        // if user is found, verify = true and delete the code from the database
        user.isVerified = true;
        user.verficationToken = undefined;
        user.verficationTokenExpiresAt = undefined;

        // save the changes to the database
        await user.save();

        // send welcome email
        await sendWelcomeEmail(user.email, user.name);

        return res.status(200).json({ message: "user verified!" })
    } catch (error) {
        console.log("Error in verify email ", error);
        res.status(400).json({ success: false, message: error.message });
    }

};
