import mongoose from 'mongoose';

const StockLogSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  itemName: String,
  qty: { type: Number, required: true }, // Positive for Purchase, Negative for Sale
  type: { type: String, enum: ['IN', 'OUT', 'ADJUSTMENT'], required: true },
  referenceId: { type: String }, // Invoice ID
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.StockLog || mongoose.model('StockLog', StockLogSchema);