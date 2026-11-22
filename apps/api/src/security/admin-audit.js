const RETENTION_MS = 365 * 24 * 60 * 60 * 1000
const PRUNE_INTERVAL_MS = 24 * 60 * 60 * 1000

export async function pruneExpiredAdminAuditLogs(prisma, now = new Date()) {
  return prisma.adminAuditLog.deleteMany({ where: { expiresAt: { lte: now } } })
}

export async function auditAdminMutation(
  prisma,
  req,
  { action, resourceType, resourceId },
  mutate,
) {
  return prisma.$transaction(async (tx) => {
    const now = new Date()
    await pruneExpiredAdminAuditLogs(tx, now)
    const result = await mutate(tx)
    const id = typeof resourceId === 'function' ? resourceId(result) : resourceId
    if (id == null) throw new TypeError('Admin audit resource ID is required')
    await tx.adminAuditLog.create({
      data: {
        adminId: req.auth.id,
        action,
        resourceType,
        resourceId: String(id),
        requestId: req.id,
        expiresAt: new Date(now.getTime() + RETENTION_MS),
      },
    })
    return result
  })
}

export function startAdminAuditRetention(prisma) {
  const prune = () => {
    pruneExpiredAdminAuditLogs(prisma).catch(() => {
      console.error(JSON.stringify({ level: 'error', event: 'admin.audit_retention_failed' }))
    })
  }
  prune()
  const interval = setInterval(prune, PRUNE_INTERVAL_MS)
  interval.unref()
  return interval
}
