import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { invitationGroups } from "@/db/schema";
import { requirePermission } from "@/lib/auth/permissions";
import CheckInClient from "@/components/admin/CheckInClient";

export const dynamic = "force-dynamic";

export default async function CheckInPage() {
  const session = await requirePermission("check_in");
  const groups = await db.query.invitationGroups.findMany({
    where: eq(invitationGroups.status, "active"),
    orderBy: [asc(invitationGroups.name)],
  });

  return (
    <CheckInClient
      groups={groups.map((g) => ({ id: g.id, name: g.name }))}
      officerName={session.name}
    />
  );
}
