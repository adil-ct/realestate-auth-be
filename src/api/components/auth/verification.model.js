import mongoose from 'mongoose';
import db from '../../connections/dbMaster.js';

const verificationSchema = new mongoose.Schema(
  {
    email: { type: String },
    code: { type: Number },
    expiresAt: Date,
  },
  {
    timestamps: true,
  }
);

const verification = db.model('verifications', verificationSchema);

export default verification;
