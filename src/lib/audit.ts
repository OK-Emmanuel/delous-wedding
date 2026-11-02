import { db } from "@/db";
import { auditLogs } from "@/db/schema";

type AuditInput = {
  userId?: number | null;
  action: string;
  entityType: string;
  entityId?: string | number | null;
  detail?: unknown;
};

/** Best-effort audit trail — never lets logging break the main operation. */
export async function audit(input: AuditInput) {
  try {
    await db.insert(auditLogs).values({
      userId: input.userId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId != null ? String(input.entityId) : null,
      detail: input.detail ?? null,
    });
  } catch (err) {
    console.error("audit log failed", err);
  }
}
