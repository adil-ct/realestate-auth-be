import mongoose from 'mongoose';
import db from '../../connections/dbMaster.js';
import dateFormats from '../../helpers/date.js';


const loginsSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    userType: { type: String },
    logged_out: {
        type: Boolean,
        default: false,
    },
    currentDevice: {
        type: Boolean,
        default: false
    },
    logged_in_at: {
        type: Date,
        default: Date.now,
    },
    logged_out_at: { type: Date },
    ip_address: {
        type: String,
    },
    token_id: {
        type: String,
    },
    token_secret: {
        type: String,
    },
    token_expires_at: {
        type: Date,
        default: Date.now,
    },
    user_fcm_token: { type: String, default: '' },
    device: {
        device: { type: String },
        version: { type: String },
        os: { type: String },
        type: { type: String },
    },
    location: {
        country: { type: String, default: '' },
        region: { type: String, default: '' },
        timezone: { type: String, default: '' },
        city: { type: String, default: '' },
    },
    createdAt: {
        type: Date,
        mergeable: false,
        default: dateFormats.getCurrentDateTime,
    },
    updatedAt: {
        type: Date,
        mergeable: false,
        default: dateFormats.getCurrentDateTime,
    },
});

const Logins = db.model('Logins', loginsSchema);

export default Logins;
