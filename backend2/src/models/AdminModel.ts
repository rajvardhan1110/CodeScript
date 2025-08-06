import mongoose, { Document, Schema } from "mongoose";

// Step 1: Define the TypeScript interface for Admin
export interface IAdmin extends Document {
    email: string;
    password: string;
    name: string;
}

// Step 2: Create the schema
const AdminSchema: Schema<IAdmin> = new Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true }
});

// Step 3: Create and export the model
export const AdminModel = mongoose.model<IAdmin>("admins", AdminSchema);
