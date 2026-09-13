const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Ticket = require('./models/Ticket');
const Message = require('./models/Message');

function initSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token
        || socket.handshake.headers?.cookie?.split('token=')[1]?.split(';')[0];
      if (!token) return next(new Error('Unauthorized'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('Unauthorized'));
      socket.user = user;
      next();
    } catch (e) {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join-ticket', async (ticketId) => {
      try {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) return socket.emit('error-message', 'Ticket not found');
        const isOwner = ticket.customerId.toString() === socket.user._id.toString();
        const isStaff = ['agent', 'admin'].includes(socket.user.role);
        if (!isOwner && !isStaff) return socket.emit('error-message', 'Forbidden');
        socket.join(ticketId.toString());
      } catch (e) {
        socket.emit('error-message', 'Join failed');
      }
    });

    socket.on('send-message', async ({ ticketId, text }) => {
      try {
        if (!text || text.length > 2000) return;
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) return;
        const isOwner = ticket.customerId.toString() === socket.user._id.toString();
        const isStaff = ['agent', 'admin'].includes(socket.user.role);
        if (!isOwner && !isStaff) return;
        const senderType = isStaff ? 'agent' : 'user';
        const msg = await Message.create({
          ticketId, senderId: socket.user._id, senderType, text: text.trim()
        });
        io.to(ticketId.toString()).emit('new-message', msg);
      } catch (e) {
        socket.emit('error-message', 'Send failed');
      }
    });
  });
}

module.exports = initSocket;
