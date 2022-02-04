const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const Player = require('../models/Player');
const Transaction = require('../models/Transaction');
const TransactionData = require('../models/TransactionData');
const DeletedTransaction = require('../models/DeletedTransaction');
const AllTransaction = require('../models/AllTransaction');
const Admin = require('../models/Admin');
const Order = require('../models/Order');
const OrderData = require('../models/OrderData');
const Service = require('../models/Service');

exports.login_player = (req, res, next) => {
    Player.find({playerName: req.body.playerName})
        .exec()
        .then(player => {
            if (player.length < 1) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }
            bcrypt.compare(req.body.password, player[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth failed'
                    });
                }
                if (result) {
                    const token = jwt.sign({
                            playerName: player[0].playerName,
                            playerId: player[0]._id
                        },
                        process.env.PLAYER_KEY,
                        {
                            expiresIn: "24h"
                        },
                    );
                    return res.status(200).json({
                        message: 'Auth successful',
                        token: token,
                        id: player[0]._id
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

exports.create_order = async (req, res, next) => {
    try {
        const code = await q_create_order(req);
        if (code === 201) {
            res.status(201).json({message: 'Order created'});
        }
        if (code === 400) {
            res.status(400).json({ message: "Order already exists" });
        }
        if (code === 401) {
            res.status(401).json({ message: "The amount of services is too low" });
        }
        if (code === 402) {
            res.status(402).json({
                error: 'Price must be an integer'
            });
        }
    } catch (err) {
        res.status(500).json({
            error: err
        });
    }
};

q_create_order = async (req) => {
    return req.queue.add(async () => {
        if (validator.isInt(req.body.price)) {
            const price = parseInt(req.body.price);
            const player = await Player.findById(req.params.playerId);
            if (player.amountOfAvailableService > 0) {
                const existingOrder = await Order.find({provider: player._id});
                if (!Array.isArray(existingOrder) || !existingOrder.length) {
                    const order = await new Order({
                        provider: req.params.playerId,
                        playerName: player.playerName,
                        typeOfService: player.typeOfService,
                        amountOfService: 1,
                        price: price,
                        timeForService: player.timeForService
                    });
                    req.io.emit("create_order", order);
                    await order.save();
                    const orderData = await new OrderData({
                        provider: req.params.playerId,
                        playerName: player.playerName,
                        typeOfService: player.typeOfService,
                        amountOfService: 1,
                        price: price,
                        timeForService: player.timeForService
                    });
                    await orderData.save();
                    return 201
                } else {
                    return 400
                }
            } else {
                return 401
            }
        } else {
            return 402
        }
    });
};

exports.cancel_order = async (req, res, next) => {
    try {
        const code = await q_cancel_order(req);
        if (code === 200) {
            res.status(200).json({message: "Order deleted"});
        }
        if (code === 401) {
            res.status(401).json({ message: "You are not authorized" });
        }
        if (code === 404) {
            res.status(404).json({ message: "No valid entry found for provided ID" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
};

q_cancel_order = async (req) => {
    try {
        return req.queue.add(async () => {
            const id = req.body.orderId;
            const doc = await Order.findById(id);
            if (doc) {
                req.io.emit("delete_order", id);
                if (doc.provider.toString() === req.params.playerId) {
                    const otherTransactions = await Transaction.find({orderId: id});
                    if (!(!Array.isArray(otherTransactions) || !otherTransactions.length)) {
                        for (let transaction of otherTransactions) {
                            const consumer = await Player.findById(transaction.consumer._id);
                            const newBalance = consumer.balance + transaction.price + transaction.txFee;
                            req.io.emit("update_balance", newBalance, transaction.consumer._id.toHexString(), "balance", 0);
                            req.io.emit("delete_transaction", transaction._id.toHexString(), false);
                            await Player.findByIdAndUpdate(transaction.consumer._id, {balance: newBalance});
                            await Transaction.findByIdAndDelete(transaction._id);
                            const deletedTransaction = await new DeletedTransaction({
                                consumer: transaction.consumer,
                                provider: transaction.provider,
                                typeOfService: transaction.typeOfService,
                                amountOfService: transaction.amountOfService,
                                price: transaction.price,
                                txFee: transaction.txFee,
                                typeOfTransaction: transaction.typeOfTransaction,
                                orderId: transaction.orderId
                            });
                            await deletedTransaction.save();
                        }
                    }
                    await Order.findByIdAndDelete(id);
                    return 200
                } else {
                    return 401
                }
            } else {
                return 404
            }
        });
    } catch (err) {
        return err
    }
};

exports.create_transaction = async (req, res, next) => {
    try {
        const code = await q_create_transaction(req);
        if (code === 200) {
            res.status(200).json({message: "Transaction created"});
        }
        if (code === 400) {
            res.status(401).json({ message: "Balance is too low" });
        }
        if (code === 401) {
            res.status(401).json({ message: "Service of this type is already in progress" });
        }
        if (code === 402) {
            res.status(401).json({ message: "Transaction fee must be an integer" });
        }
        if (code === 404) {
            res.status(404).json({ message: "No valid entry found for provided ID" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
};

q_create_transaction = async (req) => {
    try {
        return req.queue.add(async () => {
            const id = req.body.orderId;
            const doc = await Order.findById(id);
            if (doc) {
                if (validator.isInt(req.body.txFee)) {
                    const txFee = parseInt(req.body.txFee);
                    const player = await Player.findById(req.params.playerId);
                    if (player.balance >= doc.price + txFee) {
                        const newBalance = player.balance - doc.price - txFee;
                        req.io.emit("update_balance", newBalance, req.params.playerId, "balance", 0);
                        const transaction = await new Transaction({
                            consumer: req.params.playerId,
                            provider: doc.provider,
                            typeOfService: doc.typeOfService,
                            amountOfService: doc.amountOfService,
                            timeForService: doc.timeForService,
                            price: doc.price,
                            txFee: txFee,
                            typeOfTransaction: "trade",
                            orderId: id
                        });
                        req.io.emit("create_transaction", transaction);
                        await Player.findByIdAndUpdate(req.params.playerId, {balance: newBalance});
                        await transaction.save();
                        const allTransaction = await new AllTransaction({
                            consumer: req.params.playerId,
                            provider: doc.provider,
                            typeOfService: doc.typeOfService,
                            amountOfService: doc.amountOfService,
                            timeForService: doc.timeForService,
                            price: doc.price,
                            txFee: txFee,
                            typeOfTransaction: "trade",
                            orderId: id
                        });
                        await allTransaction.save();
                        return 200;
                    } else {
                        return 400;
                    }
                } else {
                    return 402
                }
            } else {
                return 404;
            }
        });
    } catch (err) {
        return err
    }
};

exports.cancel_transaction = async (req, res, next) => {
    try {
        const code = await q_cancel_transaction(req);
        if (code === 200) {
            res.status(200).json({message: "Transaction deleted"});
        }
        if (code === 401) {
            res.status(401).json({ message: "You are not authorized" });
        }
        if (code === 404) {
            res.status(404).json({ message: "No valid entry found for provided ID" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
};

q_cancel_transaction = async (req) => {
    try {
        return req.queue.add(async () => {
            const id = req.body.transactionId;
            const doc = await Transaction.findById(id);
            if (doc) {
                if (doc.consumer.toString() === req.params.playerId) {
                    req.io.emit("delete_transaction", id, true);
                    if (doc.typeOfTransaction === "unstake") {
                        const consumer = await Player.findById(doc.consumer._id);
                        const newBalance = consumer.balance + doc.txFee;
                        req.io.emit("update_balance", newBalance, doc.consumer._id.toHexString(), "balance", 0);
                        await Player.findByIdAndUpdate(doc.consumer._id, {balance: newBalance});
                    } else {
                        const consumer = await Player.findById(doc.consumer._id);
                        const newBalance = consumer.balance + doc.price + doc.txFee;
                        req.io.emit("update_balance", newBalance, doc.consumer._id.toHexString(), "balance", 0);
                        await Player.findByIdAndUpdate(doc.consumer._id, {balance: newBalance});
                    }
                    const deletedTransaction = await new DeletedTransaction({
                        consumer: doc.consumer,
                        provider: doc.provider,
                        typeOfService: doc.typeOfService,
                        amountOfService: doc.amountOfService,
                        price: doc.price,
                        txFee: doc.txFee,
                        typeOfTransaction: doc.typeOfTransaction,
                        orderId: doc.orderId
                    });
                    await deletedTransaction.save();
                    await Transaction.findByIdAndDelete(id);
                    return 200;
                } else {
                    return 401;
                }
            } else {
                return 404;
            }
        });
    } catch (err) {
        return err
    }
};


exports.stake = async (req, res, next) => {
    try {
        const code = await q_stake(req);
        if (code === 200) {
            res.status(200).json({message: "Transaction created"});
        }
        if (code === 400) {
            res.status(400).json({ message: "Balance is too low" });
        }
        if (code === 401) {
            res.status(400).json({ message: "Stake must be an integer" });
        }
        if (code === 402) {
            res.status(400).json({ message: "Transaction fee must be an integer" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
};

q_stake = async (req) => {
    try {
        return req.queue.add(async () => {
            if (validator.isInt(req.body.stake)) {
                if (validator.isInt(req.body.txFee)) {
                    const stake = parseInt(req.body.stake);
                    const txFee = parseInt(req.body.txFee);
                    const player = await Player.findById(req.params.playerId);
                    if (player.balance >= stake + txFee) {
                        const newBalance = player.balance - stake - txFee;
                        req.io.emit("update_balance", newBalance, req.params.playerId, "balance", 0);
                        const transaction = await new Transaction({
                            consumer: req.params.playerId,
                            provider: "5f9945a43173144c25fea161",
                            typeOfService: "Stake",
                            amountOfService: 0,
                            price: stake,
                            txFee: txFee,
                            typeOfTransaction: "stake"
                        });
                        req.io.emit("create_transaction", transaction);
                        await Player.findByIdAndUpdate(req.params.playerId, {balance: newBalance});
                        await transaction.save();
                        const allTransaction = await new AllTransaction({
                            consumer: req.params.playerId,
                            provider: "5f9945a43173144c25fea161",
                            typeOfService: "Stake",
                            amountOfService: 0,
                            price: stake,
                            txFee: txFee,
                            typeOfTransaction: "stake"
                        });
                        await allTransaction.save();
                        return 200;
                    } else {
                        return 400;
                    }
                } else {
                    return 402;
                }
            } else {
                return 401;
            }
        });
    } catch (err) {
        return err
    }
};

exports.unstake = async (req, res, next) => {
    try {
        const code = await q_unstake(req);
        if (code === 200) {
            res.status(200).json({message: "Transaction created"});
        }
        if (code === 400) {
            res.status(400).json({ message: "Balance is too low" });
        }
        if (code === 401) {
            res.status(400).json({ message: "Not enough stake" });
        }
        if (code === 402) {
            res.status(400).json({ message: "Transaction fee must be a number" });
        }
        if (code === 403) {
            res.status(400).json({ message: "Stake must be a number" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
};

q_unstake = async (req) => {
    try {
        return req.queue.add(async () => {
            if (validator.isInt(req.body.unstake)) {
                if (validator.isInt(req.body.txFee)) {
                    const unstake = parseInt(req.body.unstake);
                    const txFee = parseInt(req.body.txFee);
                    const player = await Player.findById(req.params.playerId);
                    if (player.stake >= (unstake + 1)) {
                        if (player.balance >= txFee) {
                            const newBalance = player.balance - txFee;
                            req.io.emit("update_balance", newBalance, req.params.playerId, "balance", 0);
                            const transaction = await new Transaction({
                                consumer: req.params.playerId,
                                provider: "5f9945a43173144c25fea161",
                                typeOfService: "Unstake",
                                amountOfService: 0,
                                price: unstake,
                                txFee: txFee,
                                typeOfTransaction: "unstake"
                            });
                            req.io.emit("create_transaction", transaction);
                            await Player.findByIdAndUpdate(req.params.playerId, {balance: newBalance});
                            await transaction.save();
                            const allTransaction = await new AllTransaction({
                                consumer: req.params.playerId,
                                provider: "5f9945a43173144c25fea161",
                                typeOfService: "Unstake",
                                amountOfService: 0,
                                price: unstake,
                                txFee: txFee,
                                typeOfTransaction: "unstake"
                            });
                            await allTransaction.save();
                            return 200;
                        } else {
                            return 400;
                        }
                    } else {
                        return 401;
                    }
                } else {
                    return 402;
                }
            } else {
                return 403;
            }
        });
    } catch (err) {
        return err
    }
};

exports.get_game_data = async (req, res, next) => {
    try {
        const player = await Player.findById(req.params.playerId).select("-password");
        const players = await Player.find().select("playerName typeOfService price stake");
        const orders = await Order.find().select("_id provider playerName typeOfService price");
        const allPendingTransactions = await Transaction.find();
        const allTransactions = await TransactionData.find();
        const admin = await Admin.find();
        const isGameOn = admin[0].gameIsOn;
        const miningTime = admin[0].miningTime;
        const totalStake = await players.reduce((total, current) => total + current.stake, 0);
        const playersData = await Player.find().select("_id playerName typeOfService stake");
        res.status(200).json({
            player: player,
            orders: orders,
            allPendingTransactions: allPendingTransactions,
            isGameOn: isGameOn,
            totalStake: totalStake,
            players: playersData,
            allTransactions: allTransactions,
            miningTime: miningTime
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
};

exports.get_game_data_sockets = async (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const player = await Player.findById(id).select("-password");
            const orders = await Order.find().select("_id provider playerName typeOfService price timeForService");
            const allPendingTransactions = await Transaction.find();
            const allTransactions = await TransactionData.find();
            const services = await Service.find();
            const admin = await Admin.find();
            const isGameOn = admin[0].gameIsOn;
            const miningTime = admin[0].miningTime;
            const playersData = await Player.find().select("_id playerName typeOfService stake upgradeNumber balance fromStakeBalance fromServiceBalance");
            const totalStake = await playersData.reduce((total, current) => total + current.stake, 0);
            resolve({
                player: player,
                orders: orders,
                allPendingTransactions: allPendingTransactions,
                services: services,
                isGameOn: isGameOn,
                totalStake: totalStake,
                players: playersData,
                allTransactions: allTransactions,
                miningTime: miningTime
            });
        } catch (err) {
            console.log(err);
            reject(new Error("error"));
        }
    })
};



