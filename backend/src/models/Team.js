const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true }, // ex: rain team alpha
    format: { type: String, required: true }, // vgc 2026, ou, etc
    description: { type: String },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);