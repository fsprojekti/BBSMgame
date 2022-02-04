 const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    gameIsOn:{
        type: Boolean,
        default:false
    },
    miningTime: {
        type: Date,
        default: Date.now,
    }
});


const Admin = mongoose.model("Admin", AdminSchema);
module.exports = Admin;