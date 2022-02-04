const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
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
    serviceTimestamp: {
        type: Number,
        default: 1
    },
    timeForService: {
        type: Number,
        default: 1
    }
});

const Service = mongoose.model("Service", ServiceSchema);
module.exports = Service;