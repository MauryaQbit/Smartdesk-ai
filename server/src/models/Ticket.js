const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    category: { type: String, default: 'general', index: true },
    status: {
      type: String,
      enum: ['open', 'assigned', 'resolved', 'closed'],
      default: 'open',
      index: true
    },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
    sentimentAI: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
    summaryAI: { type: String, maxlength: 500 },
    aiResolved: { type: Boolean, default: false, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assignedAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    attachments: [{ url: String, name: String, size: Number, mime: String }],
    slaDeadline: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }
  },
  { timestamps: true }
);

ticketSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Ticket', ticketSchema);
