import { asc } from "drizzle-orm";
import { db } from "@/db";
import { invitationGroups } from "@/db/schema";
import { requirePermission } from "@/lib/auth/permissions";
import ImportClient from "@/components/admin/ImportClient";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  await requirePermission("import_csv");
  const groups = await db.query.invitationGroups.findMany({
    orderBy: [asc(invitationGroups.name)],
  });
  return <ImportClient groupNames={groups.map((g) => g.name)} />;
}
