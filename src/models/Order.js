import mongoose from 'mongoose';
import Counter from "./Counter.js";

const OrderSchema = new mongoose.Schema({
  _id: { type: Number }, // Auto-incremented numeric ID
  customer: {
    type: Number,
    ref: 'Customer',
    required: [true, 'Please provide customer']
  },
  discount: {
    amount: {
      type: Number,
      default: 0
    },
    value: {
      type: Number,
      default: 0
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    }
  },
  items: [{
    product: {
      type: Number,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  total: {
    type: Number,
    required: [true, 'Please provide total'],
    min: 0
  },
  shipping: {
    type: Number,
    default: 0,
    min: 0
  },
  subtotal: {
    type: Number,
    required: [true, 'Please provide subtotal'],
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});
// 🔢 Auto-increment ID before saving
OrderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { model: "Order" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this._id = counter.seq;
  }
  next();
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);