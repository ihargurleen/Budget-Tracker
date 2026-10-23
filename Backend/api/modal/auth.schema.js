import mongoose from "mongoose";
import bcrypt from "bcrypt";

const authSchema = new mongoose.Schema({
    userName : {
        type : String,
        trial : true ,
    },
    email: {
        type : String,
        required: true,
        trial : true,
    },
    password: {
        type : String,
        Required: true,
    },   
},
 {timestamps: true},
);

authSchema.pre("save", async function () {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
//compare
authSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}
export const Auth = mongoose.model("Auth",authSchema);