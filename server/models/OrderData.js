const mongoose = require('mongoose');

const OrderDataSchema = new mongoose.Schema({
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    playerName: {
        type: String,
        required: true
    },
    typeOfService: {
        type: String,
        required: true
    },
    amountOfService: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    timeForService: {
        type: Number,
        default: 1
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const OrderData = mongoose.model("OrderData", OrderDataSchema);
module.exports = OrderData;