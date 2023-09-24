// adminRegisters.js

const mongoose = require('mongoose');

// Define the schema for admin registration
const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique:true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    confirmPassword: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    }
});

// Create a model for admin registration using the schema
const AdminRegister = mongoose.model('AdminRegister', adminSchema);

module.exports = AdminRegister;
