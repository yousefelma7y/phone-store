import mongoose from "mongoose";
import Counter from "./Counter.js";

const ProductSchema = new mongoose.Schema(
  {
    _id: { type: Number }, // Auto-incremented numeric ID
    name: {
      type: String,
      required: [true, "Please provide product name"],
      trim: true,
    },
    color: {
      type: String,
      required: [true, "Please provide color"],
      trim: true,
    },
    regularPrice: {
      type: Number,
      required: [true, "Please provide regular price"],
      min: 0,
    },
    salePrice: {
      type: Number,
      required: [true, "Please provide sale price"],
      min: 0,
    },
    wholesalePrice: {
      type: Number,
      required: [true, "Please provide wholesale price"],
      min: 0,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: [true, "Please provide brand"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Please provide category"],
    },
    stock: {
      type: Number,
      required: [true, "Please provide stock quantity"],
      min: 0,
      default: 0,
    },
  },
  { timestamps: true, _id: false } // important: disable default ObjectId
);

// 🔢 Auto-increment ID before saving
ProductSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { model: "Product" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this._id = counter.seq;
  }
  next();
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
