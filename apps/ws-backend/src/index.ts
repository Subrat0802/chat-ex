import WebSocket, { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/prisma/db";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

const users: User[] = [];

function checkUser(token: string): string | null {
  try {
    const decode = jwt.verify(token, JWT_SECRET);
    console.log(decode);
    if (typeof decode === "string") {
      return null;
    }
    if (!decode || !decode.id) {
      return null;
    }
    return decode.id;
  } catch (error) {
    return null;
  }
}

wss.on("connection", function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";

  const userId = checkUser(token);
  if (userId === null) {
    ws.close();
    return null;
  }

  users.push({
    userId,
    rooms: [],
    ws,
  });

  ws.on("message", async function message(data) {
    const parsedData = JSON.parse(data as unknown as string); // {type: "join_room", roomId: 1}

    console.log("PARSEDDATA", parsedData);

    if(parsedData.type === "join_room"){
      const user = users.find(x => x.ws === ws);
      user?.rooms.push(parsedData.roomId)
    }

    if (parsedData.type === "leave_room") {
      const user = users.find((x) => x.ws === ws);
      if (!user) {
        return;
      }
      user.rooms = user.rooms.filter((x) => x !== parsedData.roomId);
    }

    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;

      const res = await prismaClient.chat.create({
        data:{
          roomId,
          message,
          userId
        }
      })

      console.log(res);

      users.forEach(user => {
        if(user.rooms.includes(roomId)) {
          user.ws.send(JSON.stringify({
            type:"chat",
            message:message,
            roomId
          }))
        }
      }) 
    }
  });
});







//--------------

// import { WebSocketServer, WebSocket } from "ws";
// import jwt, { JwtPayload } from "jsonwebtoken";
// import { JWT_SECRET } from "@repo/backend-common/config";
// import {prismaClient} from "@repo/prisma/db";

// const wss = new WebSocketServer({port: 8080});


// // const users = [{
// //     userId: 1,
// //     rooms: ["rrom1", "room2"],  //whwn ever msg comes from room1, here we check user1 is part of room1
// //     ws: socket
// // },
// // {
// //     userId: 1,
// //     rooms: ["rrom1", "room2"],  // here also whwn ever msg comes from room1, here we check user2 is part of room1
// //     ws: socket
// // },
// // {
// //     userId: 1,
// //     rooms: ["rrom3", "room6"],
// //     ws: socket
// // }];

// interface User {
//     ws: WebSocket,
//     rooms: string[],
//     userId: string
// }

// const users: User[] = [];


// function checkUser(token: string): string | null {
//     try{
//         const decode = jwt.verify(token, JWT_SECRET);
//         if(typeof decode == "string"){
//             return null
//         }

//         if(!decode || (decode as JwtPayload).userId){
//             return null;
//         }
//         return decode.id;   
//     }catch(error){
//         console.log("Error, invalid token");
//         return null;
//     }
// }

// wss.on('connection', function connection(ws: WebSocket, request: Request) {
//     const url = request.url;
//     if(!url){
//         return;
//     }

//     const queryParams = new URLSearchParams(url.split('?')[1]);
//     const token = queryParams.get('token') || "";

//     const userId = checkUser(token);
//     if(!userId){
//         ws.close();
//         return;
//     }

//     users.push({
//         userId,
//         rooms: [],
//         ws
//     })

//     ws.on('message', function message(data: unknown) {
//         const parseData = JSON.parse(data as unknown as string);
//         if(parseData.type === "join_room"){ 
//             const user = users.find(x => x.ws === ws); //find the user in global array and push roomId in room users.room {{type: "join_room", roomId: 1 } 
//             user?.rooms.push(parseData.roomId);
//         }

//         if(parseData.type === "leave_room"){
//             const user = users.find(x => x.ws === ws); //first find user / user send this to leave room {type: "leave_room", roomId: 1 } 
//             if(!user){
//                 return;
//             }
//             user.rooms = user?.rooms.filter(x => x === parseData.room); //and remove roomId from user object
//         }

//         if(parseData.type === "chat") { //now user wants to chat in room {type: "chat", roomId: 1, message:"Hi there" } 
//             const roomId = parseData.roomId;
//             const message = parseData.message;

//             //now here we send this message to all ws(user) those who are in roomId: 1
//             users.forEach(user => {
//                 if(user.rooms.includes(roomId)){
//                     user.ws.send(JSON.stringify({
//                         type: "chat",
//                         message:message,
//                         roomId
//                     }))
//                 }
//             })
//         }   
//     });
// })