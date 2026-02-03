import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "Please provide a username"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
    },
    brandName: {
      type: String,
      required: [true, "Please provide a brand name"],
    },
    location: {
      type: String,
      required: [true, "Please provide a brand location"],
    },
    phone: {
      type: String,
      required: [true, "Please provide a brand phone"],
    },
    logo: {
      type: String, // URL or base64 string for the image
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
