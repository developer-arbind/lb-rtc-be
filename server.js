const express = require("express");
const socket = require("socket.io");
const cors = require("cors");
const http = require("http");

const app = express();

const origin = {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}

app.use(cors(origin));
const server = http.createServer(app);
const io = new socket.Server(server,{
    cors: origin
})
server.listen(8000, () => {
    console.log("server running on: " + "8000");
});
let IDS = [];
class IPs {
    constructor (websocket, id) {
        this.websocket = websocket;
        this.id = id
    }

    sendOffer (offer, socketId) {
        this.websocket.to(socketId).emit("get-remote-offer", {offer, socketId: this.id});
    }
    sendAnwser (anwser, socketId) {
        this.websocket.to(socketId).emit("get-remote-anwser", {anwser, socketId: this.id});
    }
    sendAnwserNego (anwser, socketId) {
        this.websocket.to(socketId).emit("get-remote-nego-ans", {anwser, socketId: this.id});
    }

    setLocalDsc (anwser,  socketId) {
        this.websocket.to(socketId).emit("set-local-dsc", {anwser, socketId: this.id});
    }

    sendNegoOffer  (offer, socketId) {
        this.websocket.to(socketId).emit("set-negotiation-offer", {offer, socketId: this.id})
    }
    iAMlEAVING () {
        IDS = IDS.filter(ie => ie !== this.id);
        for(let i = 0; i < IDS.length; i++) {
            this.websocket.to(IDS[i]).emit("on-someone-disconnects", this.id);
        }

        console.log("after removing: ", IDS);
    }
}

io.on("connection", (socket) => {
    const IP = new IPs(socket, socket.id);
    IDS.push(socket.id);
    socket.emit("on-connected", socket.id);
    socket.on("send-offer", ({offer, socketId}) => {
        IP.sendOffer(offer, socketId);
    });

    socket.on("send-anwser", ({anwser, socketId}) => {
         IP.sendAnwser(anwser, socketId);
    });
    socket.on("send-anwser-nego", ({anwser, socketId}) => {
         IP.sendAnwserNego(anwser, socketId);
    });

    socket.on("GET-ALL-SOCKET-USERS", () => {
        socket.emit("on-ids-get", IDS);
    })

    socket.on("send-track-vice-versa", (id) => {
        socket.to(id).emit("send-track", socket.id);
    })
    socket.on("i-am-leaving", () => {
        console.log("before leaving: ", [...IDS])
        IP.iAMlEAVING();
    })
    socket.on("send-negotiation-offer", ({offer, socketId}) => {
        IP.sendNegoOffer(offer, socketId);
    })
    socket.on("send-set-local-dsc", ({mergedAnwser, socketId}) => {
        IP.setLocalDsc(mergedAnwser, socketId);
    })
});