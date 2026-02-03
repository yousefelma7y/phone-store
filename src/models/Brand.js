import mongoose from 'mongoose';

const BrandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a brand name'],
    unique: true,
    trim: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Brand || mongoose.model('Brand', BrandSchema);