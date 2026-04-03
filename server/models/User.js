const mongoose = require("mongoose");
const bcrypt = require('bcrypt')
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false,
    },
    confirmPassword: {
        type: String,
        required: [true, "Please confirm your password"],
        minlength: 8,
        select: false,
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: "Passwords do not match"
        }
    },
    role: {
        type: String,
        enum: ["admin", "manager", "cashier",],
        default: "cashier",
    },
    passwordChangedAt: {
        type: Date,
        default: Date.now
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
}, {
    timestamps: true
});

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
})

userSchema.pre("save", async function () {
    if (!this.isModified("password") || this.isNew) return;

    this.passwordChangedAt = Date.now() - 1000; // to make sure the token is created after the password has been changed
});

userSchema.methods.correctPassword = async function (password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );

        return JWTTimeStamp < changedTimeStamp;
    }

    return false;
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

module.exports = mongoose.model("User", userSchema);