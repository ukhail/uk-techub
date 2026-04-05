const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, { collection: 'users' }); // <--- This forces it to use your OLD collection

// This check prevents the "Cannot overwrite model" error
module.exports = mongoose.models.User || mongoose.model('User', userSchema);