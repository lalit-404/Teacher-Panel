import "dotenv/config"
import app from "./src/app.js"
import { connectDB } from "./src/config/dbConfig.js"

connectDB().then((res)=>{
    app.listen(3000,()=>{
        console.log("Server is ruuning at Port :3000")
    })
}).catch((err)=>{
    console.log(err)
})