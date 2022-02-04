const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const {default: PQueue} = require("p-queue");
const queue = new PQueue({ concurrency: 1 });

const app = express();

const server = require('http').Server(app);

//Uncomment for production
/*const https = require('https');
const fs = require('fs');
const privateKey = fs.readFileSync('/etc/letsencrypt/live/sharedmanufacturing.ldse.si/privkey.pem', 'utf8'); // key
const certificate = fs.readFileSync('/etc/letsencrypt/live/sharedmanufacturing.ldse.si/cert.pem', 'utf8'); // certificate
const ca = fs.readFileSync('/etc/letsencrypt/live/sharedmanufacturing.ldse.si/chain.pem', 'utf8'); // chain
const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};*/

//const server = https.createServer(credentials, app);

const io = require('socket.io')(server, {
    wsEngine: 'ws',
    cors: {
        //origin: "https://sharedmanufacturing.ldse.si",
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
const jwt = require('jsonwebtoken');
const PlayerController = require('./controllers/players');
const playerSockets = new Map();

app.use(function(req, res, next) {
    req.io = io;
    req.playerSockets = playerSockets;
    req.queue = queue;
    next();
});

const adminRoutes = require('./routes/admin');
const playerRoutes = require('./routes/player');

app.use(morgan('dev'));

app.use(express.json());
app.use(cors());

// Routes which should handle requests
app.use('/admin', adminRoutes);
app.use('/player', playerRoutes);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

mongoose.connect('mongodb://127.0.0.1:27017/SharedManufacturing', {
    useNewUrlParser: true,
});


io.use((socket, next) => {
    if (socket.handshake.auth && socket.handshake.auth.token){
        jwt.verify(socket.handshake.auth.token, process.env.PLAYER_KEY, (err, decoded) => {
            if (err) return next(new Error('Authentication error'));
            socket.decoded = decoded;
            if (socket.handshake.query.playerId !== decoded.playerId) {
                return next(new Error('Authentication error'));
            } else {
                //console.log("Player connected: " + socket.handshake.query.playerId);
                next();
            }
        });
    }
    else {
        next(new Error('Authentication error'));
    }
})
    .on('connection', function(socket) {
        playerSockets.set(socket.decoded.playerId, socket.id);
        socket.on('query', async (socketId, playerId) => {
            const data = await PlayerController.get_game_data_sockets(playerId);
            io.to(socketId).emit("data", data);
        });
    });

server.listen(8000, () => {
    console.log('Server is running on port 8000');
});
