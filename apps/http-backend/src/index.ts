import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware";
import { JWT_SECRET } from "@repo/backend-common/config";
import {SigninSchema, SignupSchema, CreateRoomSchema} from "@repo/common/zodValidatiom";

const app = express();

app.post("/signup", async (req: Request, res: Response) => {
    const {username, email, password} = await SignupSchema.parseAsync(req.body);
    console.log(username, email, password);

})

app.post("/signin",async (req, res) => {
    const {email, password} = await SigninSchema.parseAsync(req.body);
    console.log(email, password);
    const userId = 1;
    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        token
    })
})

app.post("/room", middleware, async (req, res) => {
    const {name} = await CreateRoomSchema.parseAsync(req.body);
    console.log(name);
    res.json({
        roomId: 123
    })
})

app.listen(3001);