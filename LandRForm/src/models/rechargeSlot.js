const mongoose = require('mongoose');

// Define the RechargeSlot schema
const rechargeSlotSchema = new mongoose.Schema({
    bunk: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bunk', // Reference to the Bunk model
        required: true,
    },
    slotName: {
        type: String,
        required: true,
        unique: true,
    },
    chargingPower: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'], // You can customize the status options
        required: true,
    },
});

// Create a model from the schema
const RechargeSlot = mongoose.model('RechargeSlot', rechargeSlotSchema);

module.exports = RechargeSlot;
