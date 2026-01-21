import { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

const wss = new WebSocketServer({port: 8080});

wss.on('connect', function connection(ws, request) {
    const url = request.url;
    if(!url){
        return;
    }

    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || "";
    const decode = jwt.verify(token, JWT_SECRET);

    if(typeof decode == "string"){
        ws.close();
        return
    }

    if(!decode || (decode as JwtPayload).userId){
        ws.close();
        return;
    }

    ws.on('message', function message() {
        ws.send('pong');
    });
})