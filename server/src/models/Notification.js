const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
  type: { type: String, enum: ['ticket_created','assigned','status','message','ai_triage'], default: 'message' },
  title: { type: String, required: true },
  read: { type: Boolean, default: false, index: true },
}, { timestamps: true });
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
module.exports = mongoose.model('Notification', notificationSchema);
