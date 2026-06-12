import jwt from "jsonwebtoken"
import type { NextFunction, Request, Response } from "express"



export interface Authrequest extends Request{
    user?:{
        sessionID : string
        userID : string,
        role : string
    };
}

export const verifyjwt = async(req:Authrequest,res:Response,next:NextFunction) =>{
    try {
         const token = req?.cookies.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if(!token){
           return res.status(401).json({message:"token not found in verifyjwt",success:false})
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET!) as {sessionID : string; userID:string; role:string };
        req.user = decoded
        next()
    } catch (error) {
        // const message = error instanceof Error ? error.message : "unknown message caused in verifyjwt middleware"
        // throw new Error(`error cause at verifyjwt || ${message}`)
        next(error)
    }
}