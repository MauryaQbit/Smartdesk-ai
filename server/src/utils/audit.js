const AuditLog = require('../models/AuditLog');

async function recordAudit({ actor, action, resourceType, resourceId = null, metadata = {} }) {
  return AuditLog.create({
    actorId: actor._id,
    actorRole: actor.role,
    action,
    resourceType,
    resourceId,
    metadata
  });
}

module.exports = { recordAudit };
