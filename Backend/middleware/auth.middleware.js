import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) =>{
    try {
        // check if user is authenticated 
        const accessToken = req.cookies.accessToken;
        if(!accessToken){
            return res.status(401).json({message: "unauthorized - no access token provided"});
        }
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded.userId).select("-password"); // return the user without the password

        if(!user){
            return res.status(401).json({message: "user not found"});
        }
        req.user = user; // to use the user in different functions
        next();
    } catch (error) {
        console.log("error in protectRoute middleware");
        return res.status(500).json({message: error.message});
    }
};

export const adminRoute = (req, res, next) => {
    try {
        if(req.user && req.user.role === "admin"){
            next();
        }else{
            return res.status(403).json({message: "forbidden - you are not an admin"});
        }
    } catch (error) {
        console.log("error in adminRoute middleware");
        return res.status(500).json({message: error.message});
    }
};