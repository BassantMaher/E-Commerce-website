import Coupon from "../models/coupon.model.js";

export const getCoupon = async (req, res, next) => {
    try {
        // search in the database if the coupon of that user is available and get it
        const coupon = await Coupon.findOne({ userId: req.user._id, isActive: true });
        if (coupon) {
            return res.status(200).json(coupon);
        }
        return res.status(404).json({ message: "Coupon not found or expired" });
    } catch (error) {
        console.log("error in the getCoupon controller", error.message);
        return res.status(500).json({ message: error.message });
    }
};

export const validateCoupon = async (req, res, next) => {
    // get the coupon from the body
    // check if its valid (expired)
    // check if its the user coupon and active
    // if not found then return error message
    try {
        const { code } = req.body;
        const coupon = await Coupon.findOne({
            code: code,
            isActive: true,
            userId: req.user._id,
        });
        // if no coupon found return invalid
        if( !coupon ){
            return res.status(404).json({ message: "Coupon not found" });
        }
        // if coupon expired
        if( coupon.expirationDate < new Date() ){
            coupon.isActive = false;
            // save the update in the database
            await coupon.save();
            return res.status(404).json({ message: "Coupon expired" });
        }
        // coupone is valid and active
        res.status(200).json({
            message: "Coupon is valid",
            code: coupon.code,
            discountPercentage: coupon.discountPercentage,
        });
    } catch (error) {
        console.log("error in the validateCoupon controller", error.message);
        return res.status(500).json({ message: error.message });
    }
};