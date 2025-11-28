import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true },
  date: { type: String, required: true },
  partyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Party', required: true },
  partyName: String,
  items: [{
    itemId: String,
    name: String,
    qty: Number,
    rate: Number,
    discountPercent: { type: Number, default: 0 },
    taxPercent: Number,
    amount: Number
  }],
  subtotal: Number,
  taxAmount: Number,
  roundOff: { type: Number, default: 0 },
  grandTotal: Number,
  type: { type: String, enum: ['SALES', 'PURCHASE'], required: true },
  paymentMode: { type: String, default: 'cash' },
  paymentDetails: String,
  dueDate: String,
  paymentStatus: { type: String, enum: ['PAID', 'UNPAID', 'PARTIAL'], default: 'UNPAID' }
}, { timestamps: true });

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);