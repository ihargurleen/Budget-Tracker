
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const authSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        }
    },
    { timestamps: true }
);

authSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

authSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export const Auth = mongoose.model("Auth", authSchema);
