const Transaction = require('./models/Transaction');
const TransactionData = require('./models/TransactionData');
const Player = require('./models/Player');
const Order = require('./models/Order');
const Service = require('./models/Service');
const Admin = require('./models/Admin');
const DeletedTransaction = require('./models/DeletedTransaction');
const {default: PQueue} = require("p-queue");


class Blockchain {
    constructor() {
        this.timeForBlock = 10000;
        this.timeInterval = {};
        this.adminId = "5f9945a43173144c25fea161";
        this.blockchainQueue = new PQueue({ concurrency: 1 });
    }

    async q_interval (ioSocket, playerSockets, queue) {
        return new Promise(async (resolve, reject) => {
            let that = this;
            try {
                return queue.add(async () => {
                    const transactions = await Transaction.find();
                    if (transactions.length !== 0) {
                        // Find transaction with highest fee
                        const max = await transactions.reduce((prev, current) => {
                            return (prev.txFee > current.txFee) ? prev : current
                        });
                        // Distribute TxFee between players
                        let winners = await that.q_distribute_fee(ioSocket, playerSockets, queue, max);
                        // Process transaction
                        if (max.typeOfTransaction === "trade") {
                            await that.q_trade(ioSocket, playerSockets, queue, max);
                        } if (max.typeOfTransaction === "stake") {
                            await that.q_stake(ioSocket, playerSockets, queue, max);
                        } if (max.typeOfTransaction === "unstake") {
                            await that.q_unstake(ioSocket, playerSockets, queue, max);
                        }
                        const transactionData = await new TransactionData({
                            consumer: max.consumer,
                            provider: max.provider,
                            typeOfService: max.typeOfService,
                            amountOfService: max.amountOfService,
                            timeForService: max.timeForService,
                            price: max.price,
                            txFee: max.txFee,
                            typeOfTransaction: max.typeOfTransaction,
                            orderId: max.orderId,
                            winners: winners
                        });
                        ioSocket.emit("delete_transaction", max._id.toHexString(), true);
                        ioSocket.emit("add_allTransaction", transactionData);
                        await transactionData.save();
                        await Transaction.findByIdAndDelete(max._id);
                    }
                    // Update mining time
                    ioSocket.emit("update_time", Date.now());
                    await Admin.findByIdAndUpdate(that.adminId, {miningTime: Date.now()});
                    resolve(true);
                });
            } catch(err) {
                reject(err);
            }
        })
    };

    async q_distribute_fee (ioSocket, playerSockets, queue, max) {
        return new Promise(async (resolve, reject) => {
            let that = this;
            try {
                return that.blockchainQueue.add(async () => {
                    let winners = [];
                    if (max.txFee > 0) {
                        const players = await Player.find();
                        let lotteryArray = [];
                        const sum = await players.reduce((prev, current) => {
                            return prev + current.stake;
                        }, 0);
                        await players.forEach(async player => {
                            for (let step = 0; step < player.stake; step++) {
                                lotteryArray.push(player._id);
                            }
                        });
                        for (let i = 0; i < max.txFee; i++) {
                            let index = Math.floor(Math.random() * sum);
                            winners.push(lotteryArray[index]);
                        }
                        await players.forEach(async player => {
                            let reward = winners.filter((value) => (value === player._id)).length;
                            if(reward !== 0) {
                                ioSocket.emit("update_balance", player.balance + reward, player._id.toHexString(), "stake", player.fromStakeBalance + reward);
                                await Player.findByIdAndUpdate(player._id, {
                                    $inc: { balance: reward, fromStakeBalance: reward }
                                });
                            }
                        });
                    }
                    resolve(winners);
                });
            } catch(err) {
                reject(err);
            }
        })
    };

    async q_trade (ioSocket, playerSockets, queue, max) {
        return new Promise(async (resolve, reject) => {
            let that = this;
            try {
                return that.blockchainQueue.add(async () => {
                    const provider = await Player.findById(max.provider);
                    const newBalance = provider.balance + max.price;
                    ioSocket.emit("update_balance", newBalance, max.provider.toString(), "trade", provider.fromServiceBalance + max.price);
                    ioSocket.to(playerSockets.get(max.provider.toString())).emit("update_available_service", provider.amountOfAvailableService - 1);
                    await Player.findByIdAndUpdate(max.provider.toString(), {
                        $inc: { balance: max.price, fromServiceBalance: max.price, amountOfAvailableService: -1 }
                    });
                    const service = await new Service({
                        consumer: max.consumer,
                        provider: max.provider,
                        typeOfService: max.typeOfService,
                        serviceTimestamp: Date.now(),
                        timeForService: max.timeForService,
                    });
                    ioSocket.emit("create_service", service);
                    await service.save();
                    const otherTransactions = await Transaction.find({orderId: max.orderId});
                    if (!(!Array.isArray(otherTransactions) || !otherTransactions.length)) {
                        for (let transaction of otherTransactions) {
                            if (transaction._id.toHexString() !== max._id.toHexString()) {
                                const consumer = await Player.findById(transaction.consumer._id);
                                const newBalance = consumer.balance + transaction.price + transaction.txFee;
                                ioSocket.emit("update_balance", newBalance, transaction.consumer._id.toHexString(), "balance");
                                ioSocket.emit("delete_transaction", transaction._id.toHexString(), false);
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
                    }
                    ioSocket.emit("delete_order", max.orderId);
                    await Order.findByIdAndDelete(max.orderId);
                    resolve(true);
                });
            } catch(err) {
                reject(err);
            }
        })
    };

    async q_stake (ioSocket, playerSockets, queue, max) {
        return new Promise(async (resolve, reject) => {
            let that = this;
            try {
                return that.blockchainQueue.add(async () => {
                    let consumer = await Player.findById(max.consumer);
                    ioSocket.emit("update_stake", max.consumer.toString(), consumer.stake + max.price);
                    await Player.findByIdAndUpdate(max.consumer.toString(), {
                        $inc: { stake: max.price }
                    });
                    resolve(true);
                });
            } catch(err) {
                reject(err);
            }
        })
    };

    async q_unstake (ioSocket, playerSockets, queue, max) {
        return new Promise(async (resolve, reject) => {
            let that = this;
            try {
                return that.blockchainQueue.add(async () => {
                    let consumer = await Player.findById(max.consumer);
                    const newStake = consumer.stake - max.price;
                    ioSocket.emit("update_stake", max.consumer.toString(), newStake);
                    const newBalance = consumer.balance + max.price;
                    ioSocket.emit("update_balance", newBalance, max.consumer.toString(), "balance", 0);
                    await Player.findByIdAndUpdate(max.consumer.toString(), {
                        $inc: { balance: max.price, stake: -max.price }
                    });
                    resolve(true);
                });
            } catch(err) {
                reject(err);
            }
        })
    };

    async startBlockchain(ioSocket, playerSockets, queue) {
        return new Promise(async (resolve, reject) => {
            let that = this;
            try {
                that.timeInterval = await setInterval(async () => {
                    await that.q_interval(ioSocket, playerSockets, queue);
                }, that.timeForBlock);
                resolve(true);
            } catch(err) {
                reject(err);
            }
        })
    }

    async endBlockchain() {
        return new Promise(async (resolve, reject) => {
            let that = this;
            try {
                await clearInterval(that.timeInterval);
                resolve(true);
            } catch(err) {
                reject(err);
            }

        })
    }
}

module.exports = Blockchain;