import express, { CookieOptions, Request, response, Response } from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware";
import { JWT_SECRET } from "@repo/backend-common/config";
import { SigninSchema, SignupSchema, CreateRoomSchema } from "@repo/common/zodValidatiom";
import { prismaClient } from "@repo/prisma/db";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = await SignupSchema.parseAsync(
      req.body,
    );

    const checkUserAlreadyPresent = await prismaClient.user.findFirst({
        where: {
            email: email
        }
    })

    if(checkUserAlreadyPresent) {
        return res.status(400).json({
            message:"This email is already present try to signin",
            success:false
        })
    }

    const response = await prismaClient.user.create({
      data: {
        username,
        email,
        password,
      },
    });

    if (!response) {
      return res.status(404).json({
        message: "Error while signup",
        success: false,
      });
    }

    return res.status(200).json({
      message: "User signup successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while signup",
      success: false,
    });
  }
});

app.post("/signin", async (req, res) => {
  try {
    const { email, password } = await SigninSchema.parseAsync(req.body);

    const response = await prismaClient.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!response) {
      return res.status(400).json({
        message: "Please signup first",
        success: false,
      });
    }

    if (response.password !== password) {
      return res.status(400).json({
        message: "Password not match",
        success: false,
      });
    }

    const token = jwt.sign(
      {
        id: response.id,
        email: response.email,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    const options: CookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };

    res.cookie("token", token, options).status(200).json({
      user: response,
      success: true,
      messsage: "user signin successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while signin",
      success: false,
    });
  }
});

app.post("/room", middleware, async (req, res) => {
  try {
    const { name } = await CreateRoomSchema.parseAsync(req.body);
    //@ts-ignore
    const id = req.userId;

    const checkRoomAlreadyCreated = await prismaClient.room.findFirst({
        where:{
            slug: name
        }
    })

    if(checkRoomAlreadyCreated) {
        return res.status(400).json({
            message:"This room name is already take try to create with another room name",
            success:false
        })
    }

    const response = await prismaClient.room.create({
      data: {
        slug: name,
        adminId: id,
      },
    });

    if (!response) {
      return res.status(400).json({
        message: "Error while creating room",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Room is created",
      success: true,
      roomDate: response,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while creating room",
      success: false,
    });
  }
});


app.get("/chats/:roomId", async (req, res) => {
  const roomId = Number(req.params.roomId);
  const messages = await prismaClient.chat.findMany({
    where:{
      roomId: roomId
    },
    orderBy:{
      id:"desc"
    },
    take:50
  })

  if(!messages){
    return res.status(403).json({
      message:"Error while fetching last messages",
      success:false
    })
  }

  res.status(200).json({
    messages:messages,
    success:true,
    message:"Last 50 messages"
  })
})


app.get("/room/:slug", async (req, res) => {
  try{
    const slug = req.params.slug;
    const roomId = await prismaClient.room.findFirst({
      where:{
        slug
      }
    })
    console.log("ROOM details",roomId);

    if(!roomId){
      return res.status(404).json({
        message:"Error while getting room id",
        success: false
      })
    }

    return res.status(200).json({
      roomId:roomId,
      message:"room id",
      success:true
    })
  }catch(error){
    return res.status(500).json({
      message:"Server error while getting roomid using slug",
      success:false,
      error:error
    })
  }
})

app.get("/test", (req, res) => {
  res.send("Hello");
})


app.listen(3001);
