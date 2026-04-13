// server/models/Attendance.js

import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    // L'ID de l'employé (référence à la collection 'User')
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: String, // Format YYYY-MM-DD
        required: true,
    },
    arrivalTime: {
        type: String, // Format HH:MM:SS
        default: null,
    },
    departureTime: {
        type: String, // Format HH:MM:SS
        default: null,
    },
    status: {
        type: String,
        enum: ['Present', 'Late', 'Absent'],
        default: 'Present',
    }
}, { timestamps: true });

// Empêche un employé de pointer deux fois le même jour
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;