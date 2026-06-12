import express from "express";
import cookieParsor from "cookie-parser"
import database_router from "./routes/databases.routes";
import { errorHandler } from "./middleware/error.middleware";
const app =  express();

app.use(express.json())
app.use(cookieParsor())
app.get("/",(req,res)=>{
    res.send("health check")
})

app.use("/api/v1",database_router)

app.use(errorHandler);
export default app