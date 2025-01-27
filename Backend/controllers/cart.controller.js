import Product from "../models/product.model.js";

export const addToCart = async (req, res, next) => {
    try {
        // get the product from the body not params
        const { productId } = req.body;
        const user = req.user;

        // check if the item is already in cart
        const existingItem = user.cartItems.find(item => item.id === productId);
        if (existingItem) {
            // if already exists then update the quantity by 1 
            existingItem.quantity += 1;
        } else {
            // if the item doesnt exist, then add it with quantity of 1
            user.cartItems.push(productId);
        }
        // save to database
        await user.save();
        return res.status(200).json(user.cartItems)
    } catch (error) {
        console.log("Error in addToCart controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const removeAllFromCart = async (req, res, next) => {
    try {
        const { productId } = req.body;
        const user = req.user;
        // if product id doesnt exist, do nothing return cart items as it is
        if (!productId) {
            user.cartItems = [];
        } else {
            // remove the whole product from the cart
            // do this by keeping all items in the cart except the one having the productId ( one to be removed)
            user.cartItems = user.cartItems.filter(item => item.id !== productId);
        }
        await user.save();
        return res.status(200).json(user.cartItems);
    } catch (error) {
        console.log("Error in removeAllFromCart controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateQuantity = async (req, res, next) => {
    try {
        const { id: productId } = req.params;
        const { quantity } = req.body;
        const user = req.user;
        // check if the item exists in cart
        const existingItem = user.cartItems.find((item) => item.id === productId);

        if (existingItem) {
            // if quantity is zero, remove it from the cart
            if (quantity == 0) {
                user.cartItems = user.cartItems.filter(item => item.id !== productId);
                await user.save();
                return res.status(200).json(user.cartItems);
            }
            // otherwise update the quantity
            existingItem.quantity = quantity;
            await user.save();
            return res.status(200).json(user.cartItems);

        } else {
            return res.status(404).json({ message: "product not found" });
        }

    } catch (error) {
        console.log("Error in updateQuantity controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getCartProducts = async (req, res) => {
	try {
		const products = await Product.find({ _id: { $in: req.user.cartItems } });// get the products id only in the cartItems of the user
        // add quantity for each product by looping over them

		const cartItems = products.map((product) => {
			const item = req.user.cartItems.find((cartItem) => cartItem.id === product.id);
			return { ...product.toJSON(), quantity: item.quantity };
		});

		res.json(cartItems);
	} catch (error) {
		console.log("Error in getCartProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};