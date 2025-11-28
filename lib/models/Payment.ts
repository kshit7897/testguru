import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  partyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Party', required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  mode: { type: String, enum: ['cash', 'online', 'cheque'], required: true },
  reference: String,
  notes: String,
}, { timestamps: true });

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);