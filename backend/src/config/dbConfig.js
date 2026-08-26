import mongoose from "mongoose"


export const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Mongoose Coonected Successfull")
        
    } catch (error) {
        console.log("Mongoose Connection error :"+error)
    }
}