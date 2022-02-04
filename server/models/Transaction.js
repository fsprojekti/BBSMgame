const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    consumer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    typeOfService: {
        type: String,
        required: true
    },
    amountOfService: {
        type: Number,
        required: true
    },
    timeForService: {
        type: Number,
        default: 1
    },
    price: {
        type: Number,
        required: true
    },
    txFee: {
        type: Number,
        required: true
    },
    typeOfTransaction: {
        type: String,
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId
    },
});


const Transaction = mongoose.model("Transaction", TransactionSchema);
module.exports = Transaction;