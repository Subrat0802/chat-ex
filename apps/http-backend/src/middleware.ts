import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export const middleware = (req: Request, res: Response, next: NextFunction) => {
    try{
        const token = req.header("authorization") ?? "";

        const decode = jwt.verify(token, JWT_SECRET);

        if(decode){
            //@ts-ignore
            req.userId = decode.userId
        }
        next();
    }catch(error){
        res.status(403).json({
            message:"Unauthorized",
            success:false
        })
    }
}