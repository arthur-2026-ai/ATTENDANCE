// models/User.js (CORRECTION N°1 : Remplacer 'name' par 'firstName' et 'lastName')

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { /* ... */ },
    password: { /* ... */ },
    role: { /* ... */ },
    firstName: {
        type: String,
        required: true
    },
    
    lastName: {
        type: String,
        required: true
    },
    department: { type: String, required: true },
    position: { type: String, required: true },
    phone: { type: String },
    joinDate: { type: String, required: true },

}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;