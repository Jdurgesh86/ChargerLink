const mongoose = require("mongoose");

// Define the schema for EV Bunk
const bunkSchema = new mongoose.Schema({
  bunkName: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
    unique:true
  },
  latitude: {
    type: String,
    required: true,
  },
  longitude: {
    type: String,
    required: true,
  },
  currentSlotCount: {
    type: Number,
    default: 0, // Initialize the current slot count to 0
},
  slotCapacity: {
    type: Number,
    required: true,
  },
  chargingPower: {
    type: Number,
    required: true,
  },
  operator: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    required: true,
  },
});

// Create a model based on the schema
const Bunk = mongoose.model("Bunk", bunkSchema);

module.exports = Bunk;
