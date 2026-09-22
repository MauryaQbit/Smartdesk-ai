const mongoose = require('mongoose');
const historySchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actorName: String,
  action: { type: String, required: true },
  meta: mongoose.Schema.Types.Mixed,
}, { timestamps: { createdAt: true, updatedAt: false } });
historySchema.index({ ticketId: 1, createdAt: 1 });
module.exports = mongoose.model('TicketHistory', historySchema);
