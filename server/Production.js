const Player = require('./models/Player');
const Service = require('./models/Service');

class Production {
    constructor() {
        this.period = 100;
        this.exponent = -0.3;
        this.timeInterval = {};
    }

    async q_set_production (ioSocket, playerSockets, queue) {
        return new Promise(async (resolve, reject) => {
            let that = this;
            try {
                return queue.add(async () => {
                    const players = await Player.find();
                    await players.forEach(async player => {
                        //const startNextTimeForService = await that.productionFunction(player.timeForService, player.upgradeNumber);
                        const startNextTimeForService = await that.productionFunction(player.timeForService);
                        ioSocket.to(playerSockets.get(player._id.toHexString())).emit("initial_time", startNextTimeForService);
                        await Player.findByIdAndUpdate(player._id, {
                            nextTimeForService: startNextTimeForService,
                            initialTimeForService: player.timeForService
                        });
                        resolve(true);
                    });
                });
            } catch(err) {
                reject(err);
            }
        })
    };

    async q_interval (ioSocket, playerSockets, queue) {
        return new Promise(async (resolve, reject) => {
            let that = this;
            try {
                return queue.add(async () => {
                    const players = await Player.find();
                    await players.forEach(async player => {
                        if ((player.amountOfOtherService1 > 0) && (player.amountOfOtherService2 > 0)) {
                            //const newTimeForService = await that.productionFunction(player.initialTimeForService, player.upgradeNumber);
                            const newTimeForService = await that.productionFunction(player.timeForService);
                            //const newNextTimeForService = await that.productionFunction(player.initialTimeForService, player.upgradeNumber + 1);
                            const newNextTimeForService = await that.productionFunction(newTimeForService);
                            ioSocket.to(playerSockets.get(player._id.toHexString())).emit("update_production", newTimeForService, newNextTimeForService, player.upgradeNumber + 1, player.amountOfOtherService1 - 1, player.amountOfOtherService2 - 1);
                            ioSocket.emit("update_upgrade", player._id.toHexString(), player.upgradeNumber + 1);
                            await Player.findByIdAndUpdate(player._id, {
                                timeForService: newTimeForService,
                                nextTimeForService: newNextTimeForService,
                                upgradeNumber: player.upgradeNumber + 1,
                                amountOfOtherService1: player.amountOfOtherService1 - 1,
                                amountOfOtherService2: player.amountOfOtherService2 - 1
                            });
                        }
                    });
                    let currentTime = Date.now();
                    let services = await Service.find();
                    await services.forEach(async service => {
                        if ((currentTime - service.serviceTimestamp) >= service.timeForService) {
                            ioSocket.emit("delete_service", service._id.toHexString());
                            ioSocket.to(playerSockets.get(service.provider.toString())).emit("update_available_service", 1);
                            await Player.findByIdAndUpdate(service.provider, {
                                amountOfAvailableService: 1,
                            });
                            const consumer = await Player.findById(service.consumer);
                            if (consumer.typeOfOtherService1 === service.typeOfService) {
                                ioSocket.to(playerSockets.get(service.consumer.toString())).emit("update_other_service1", consumer.amountOfOtherService1 + 1);
                                await Player.findByIdAndUpdate(service.consumer.toString(), {
                                    $inc: { amountOfOtherService1: 1 }
                                });
                            } if (consumer.typeOfOtherService2 === service.typeOfService) {
                                ioSocket.to(playerSockets.get(service.consumer.toString())).emit("update_other_service2", consumer.amountOfOtherService2 + 1);
                                await Player.findByIdAndUpdate(service.consumer.toString(), {
                                    $inc: { amountOfOtherService2: 1 }
                                });
                            }
                            await Service.findByIdAndDelete(service._id);
                        }
                    });
                    resolve(true);
                });
            } catch(err) {
                reject(err);
            }
        })

    };

    async startProduction(ioSocket, playerSockets, queue) {
        return new Promise(async (resolve, reject) => {
            let that = this;
            try {
                await that.q_set_production(ioSocket, playerSockets, queue);
                that.timeInterval = await setInterval(async () => {
                    await that.q_interval(ioSocket, playerSockets, queue);
                }, that.period);
                resolve(true);
            } catch(err) {
                reject(err);
            }
        })
    }

    async endProduction() {
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

    /*async productionFunction(initialTimeForService, upgradeNumber) {
        return new Promise(async (resolve, reject) => {
            let that = this;
            try {
                const newTime = ((upgradeNumber + 2) ** that.exponent) * (initialTimeForService - 30000) + 30000;
                resolve(newTime);
            } catch(err) {
                reject(err);
            }
        })
    }*/

    async productionFunction(timeForService) {
        return new Promise(async (resolve, reject) => {
            let that = this;
            try {
                const newTime = that.exponent * (timeForService - 20000) + 20000;
                resolve(newTime);
            } catch(err) {
                reject(err);
            }
        })
    }
}

module.exports = Production;