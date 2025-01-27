import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";

export const getAllProducts = async (req, res, next) => {
    // only admin should be able to call this function
    try {
        const products = await Product.find({});
        if (products) {
            return res.status(200).json({ products: products });
        }
        else {
            return res.status(401).json({ message: "no products found" });
        }
    } catch (error) {
        console.log("error in the getAllProducts controller ", error.message);
        return res.status(500).json({ message: error.message });
    }
};

// get featured products stored in Redis database--> it will act as cache
export const getFeaturedProducts = async (req, res, next) => {
    try {
        // check the redis DB if we have any products
        let FeaturedProducts = await redis.get("featured_products");
        if (FeaturedProducts) {
            // if found in cache, then return it 
            return res.status(200).json(JSON.parse(FeaturedProducts)); // parse it because it will be stored as a string
        }
        // if not in redis, fetch them from mongo DB 
        FeaturedProducts = await Product.find({ isFeatured: true }).lean(); // lean --> instead pf returning mongoDB object it will return javascript object to make the performance better

        if (!FeaturedProducts) {
            return res.status(404).json({ message: "no featured products" });
        }
        // then store the featured products in the cache (REDIS) as a string
        await redis.set("featured_products", JSON.stringify(FeaturedProducts));

        return res.status(200).json(FeaturedProducts);  // return the fetched products from mongo DB
    } catch (error) {
        console.log("error in the getFeatured Products controller ", error.message);
        return res.status(500).json({
            message: error.message,
        });
    }
};

export const createProduct = async (req, res, next) => {
    try {
        const { name, description, price, image, category } = req.body;
        console.log(req.body);
        let cloudinaryResponse = null;
        if (image) {
            cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
        }

        const product = await Product.create({
            name,
            description,
            price,
            image: cloudinaryResponse ? cloudinaryResponse.secure_url : "",
            category
        });
        return res.status(201).json(product);
    } catch (error) {
        console.log("error in the createProduct controller", error.message);
        return res.status(500).json({ message: error.message });
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "product not found!" });
        }
        // delete the image from clodinary
        if (product.image) {
            const publicId = product.image.split("/").pop().split(".")[0]; // we get the id of the image to delete it
            try {
                await cloudinary.uploader.destroy(`products/${publicId}`);
            } catch (error) {
                console.log("errpr deleting image from cloudinary", error.message);
            }
        }
        //delete the image from the database as well
        await Product.findByIdAndDelete(req.params.id);

    } catch (error) {
        console.log("error in the deleteProduct controller", error.message);
        return res.status(500).json({ message: error.message });
    }
};

export const getRecommendedProducts = async (req, res) => {
	try {
		const products = await Product.aggregate([
			{
                // aggregate --> Random Selection
				$sample: { size: 4 }, // to select 4 different random products from the database
			},
			{
                // project is used to include or exclude fields in the final output , 1 means included
				$project: {
					_id: 1,
					name: 1,
					description: 1,
					image: 1,
					price: 1,
				},
			},
		]);

		res.json(products);
	} catch (error) {
		console.log("Error in getRecommendedProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getProductsByCategory = async (req, res) => {
	const { category } = req.params;
	try {
		const products = await Product.find({ category });
		res.json({ products });
	} catch (error) {
		console.log("Error in getProductsByCategory controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const toggleFeaturedProducts = async (req, res, next) => {
    // we need to update the cache in the redis
    try {
        const product = await Product.findById(req.params.id);
        if(product){
            product.isFeatured = !product.isFeatured;
            // update it in the cache and DB
            const updatedProduct = await product.save();
            // update the redis(cache)
            await updateFeaturedProductsCache();
            return res.status(200).json(updatedProduct);
        }else{
            return res.status(404).json({message: "no product found!"});
        }
    } catch (error) {
        console.log("error in the toggleFeaturedProducts controller", error.message);
        return res.status(500).json({ message: error.message });
    }
};

async function updateFeaturedProductsCache(){
    try {
        // get all the featured products from DB and then save them to redis
        const featuredProducts = await Product.find({ isFeatured: true}).lean();
        await redis.set("featured_products", JSON.stringify(featuredProducts));
    } catch (error) {
        console.log("error in the updateFeaturedProductsCache function", error.message);
    }
};