import mongoose from 'mongoose';
import Counter from "./Counter.js";

const CustomerSchema = new mongoose.Schema({
  _id: { type: Number }, // Auto-incremented numeric ID
  name: {
    type: String,
    required: [true, 'Please provide customer name'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Please provide phone number'],
    trim: true
  },
  birthdayDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// 🔢 Auto-increment ID before saving
CustomerSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { model: "Customer" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this._id = counter.seq;
  }
  next();
});

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);