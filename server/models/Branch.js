const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    location: {
        type: String,
        required: true,
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },  
}, {
    timestamps: true
});

const Branch = mongoose.model("Branch", branchSchema);

module.exports = Branch;