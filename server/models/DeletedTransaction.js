const mongoose = require('mongoose');

const DeletedTransactionSchema = new mongoose.Schema({
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
    createdAt: {
        type: Date,
        default: Date.now,
    }
});


const DeletedTransaction = mongoose.model("DeletedTransaction", DeletedTransactionSchema);
module.exports = DeletedTransaction;