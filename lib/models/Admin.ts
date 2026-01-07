import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
    email: {
        type: String, // Enforce email format if needed, but basic string is ok for now
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
}, { timestamps: true });

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
