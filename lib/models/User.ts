import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed
  role: { 
    type: String, 
    enum: ['Super Admin', 'Admin', 'Staff'], 
    default: 'Staff' 
  },
  permissions: {
    canCreateInvoice: { type: Boolean, default: false },
    canEditInvoice: { type: Boolean, default: false },
    canViewReports: { type: Boolean, default: false },
    canManageSettings: { type: Boolean, default: false },
  }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);