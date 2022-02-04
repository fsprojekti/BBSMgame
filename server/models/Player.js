const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
    playerName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    typeOfService: {
        type: String
    },
    typeOfOtherService1: {
        type: String
    },
    typeOfOtherService2: {
        type: String
    },
    amountOfAvailableService: {
        type: Number,
        default: 1
    },
    timeForService: {
        type: Number,
        default: 1
    },
    nextTimeForService: {
        type: Number,
        default: 1
    },
    initialTimeForService: {
        type: Number,
        default: 1
    },
    amountOfOtherService1: {
        type: Number,
        default: 0
    },
    amountOfOtherService2: {
        type: Number,
        default: 0
    },
    upgradeNumber: {
        type: Number,
        default: 0
    },
    balance: {
        type: Number,
        default: 0
    },
    stake: {
        type: Number,
        default: 1
    },
    fromStakeBalance: {
        type: Number,
        default: 0
    },
    fromServiceBalance: {
        type: Number,
        default: 0
    }
    /*price: {
        type: Map,
        default: {}
    }*/
});


const Player = mongoose.model("Player", PlayerSchema);
module.exports = Player;