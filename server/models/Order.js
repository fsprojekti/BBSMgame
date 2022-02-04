const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
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
    }
});

const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;