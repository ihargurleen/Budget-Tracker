import mongoose from "mongoose";
export const db = async () =>{
    try {
        // make connection
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Database Connected");
    }
    catch(err) {
        console.log(err.message);
        process.exit(1);
    }
};