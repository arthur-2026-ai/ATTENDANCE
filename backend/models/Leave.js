// backend/models/Leave.js
import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['Paid', 'Sick', 'Unpaid', 'Other'],
        required: true
    },
    startDate: {
        type: String, // Format YYYY-MM-DD
        required: true
    },
    endDate: {
        type: String, // Format YYYY-MM-DD
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    adminComment: {
        type: String
    }
}, { timestamps: true });

const Leave = mongoose.model('Leave', leaveSchema);
export default Leave;
