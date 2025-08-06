import mongoose, { Document, Schema } from "mongoose";

// Define the interface for a User document
export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
}

// Define the schema
const UserSchema: Schema<IUser> = new Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
});

// Create the model
export const UserModel = mongoose.model<IUser>("users", UserSchema);
