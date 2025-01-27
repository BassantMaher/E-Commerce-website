import mongoose from "mongoose";

export const connectDB = async () =>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }catch(error){
        console.log("-- error connecting to MongoDB", error.message);
        console.log(process.env.MONGO_URI);
        process.exit(1);
    }
};