const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const Admin = require('../models/Admin');
const Player = require('../models/Player');

const Production = require("../Production");
let production = new Production();
const Blockchain = require("../Blockchain");
let blockchain = new Blockchain();

exports.login_admin = (req, res, next) => {
    Admin.find({username: req.body.username})
        .exec()
        .then(admin => {
            if (admin.length < 1) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }
            bcrypt.compare(req.body.password, admin[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth failed'
                    });
                }
                if (result) {
                    const token = jwt.sign({
                            username: admin[0].username,
                            adminId: admin[0]._id
                        },
                        process.env.ADMIN_KEY,
                        {
                            expiresIn: "24h"
                        },
                    );
                    return res.status(200).json({
                        message: 'Auth successful',
                        token: token
                    });
                }
                return res.status(401).json({
                    message: 'Auth failed'
                });
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.create_player = (req, res, next) => {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if(err) {
            return res.status(500).json({
                error: err
            });
        } else {
            const player = new Player({
                playerName: req.body.playerName,
                password: hash
            });
            player
                .save()
                .then(result => {
                    res.status(201).json({
                        message: 'Player created'
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
        }
    });
};

exports.start_game = async (req, res, next) => {
    try {
        if (req.body.adminId !== undefined) {
            if (validator.isInt(req.body.timeForBlock) && validator.isFloat(req.body.exponent)) {
                await Player.updateMany({}, {
                    amountOfAvailableService: 1,
                    timeForService: req.body.timeForService,
                    amountOfOtherService1: 0,
                    amountOfOtherService2: 0,
                    upgradeNumber: 0,
                    balance: req.body.balance,
                    stake: req.body.stake,
                    fromStakeBalance: 0,
                    fromServiceBalance: 0
                });
                let players = await Player.find();
                let service = 1;
                for (let player of players) {
                    switch (service) {
                        case 1:
                            await Player.findByIdAndUpdate(player._id, {typeOfService: "Mechanical service", typeOfOtherService1: "Electrical service", typeOfOtherService2: "IT service"});
                            service = 2;
                            break;
                        case 2:
                            await Player.findByIdAndUpdate(player._id, {typeOfService: "Electrical service", typeOfOtherService1: "IT service", typeOfOtherService2: "Mechanical service"});
                            service = 3;
                            break;
                        case 3:
                            await Player.findByIdAndUpdate(player._id, {typeOfService: "IT service", typeOfOtherService1: "Mechanical service", typeOfOtherService2: "Electrical service"});
                            service = 1;
                            break;
                    }

                }
                blockchain.timeForBlock = req.body.timeForBlock;
                production.exponent = -req.body.exponent;
                req.io.emit("start", Date.now());
                await Admin.findByIdAndUpdate(req.body.adminId, {gameIsOn: true, miningTime: Date.now()});
                let startProduction = await production.startProduction(req.io, req.playerSockets, req.queue);
                let startBlockchain = await blockchain.startBlockchain(req.io, req.playerSockets, req.queue);
                if (startProduction && startBlockchain) {
                    res.status(201).json({
                        message: "Game started"
                    });
                }
            } else {
                res.status(400).json({
                    error: 'timeForBlock and exponent must be a number'
                });
            }
        } else {
            res.status(400).json({
                error: 'Body must have property adminId'
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
};

exports.end_game = async (req, res, next) => {
    try {
        const code = await q_end_game(req);
        if (code === 201) {
            res.status(201).json({message: 'Game is finished'});
        }
        if (code === 400) {
            res.status(400).json({ message: "Body must have property adminId" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
};

q_end_game = async (req) => {
    return req.queue.add(async () => {
        if (req.body.adminId !== undefined) {
            req.io.emit("end", false);
            await Admin.findByIdAndUpdate(req.body.adminId, {gameIsOn: false});
            await production.endProduction();
            await blockchain.endBlockchain();
            return 201;
        } else {
            return 400;
        }
    });
};