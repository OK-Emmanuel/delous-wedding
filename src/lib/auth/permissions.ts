import { redirect } from "next/navigation";
import { getSession, type SessionUser } from "./session";

export type Role = SessionUser["role"];

// Server-enforced permission matrix per PRD §8.6
export const PERMISSIONS = {
  view_dashboard: ["super_admin", "admin", "checkin_officer", "content_manager"],
  manage_guests: ["super_admin", "admin"],
  manage_groups: ["super_admin", "admin"],
  import_csv: ["super_admin", "admin"],
  check_in: ["super_admin", "admin", "checkin_officer"],
  export_records: ["super_admin", "admin"],
  manage_gallery: ["super_admin", "content_manager"],
  manage_faqs: ["super_admin", "content_manager"],
  manage_staff: ["super_admin"],
  change_settings: ["super_admin", "admin"],
  manage_emails: ["super_admin", "admin"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

/** For pages: redirects to login / dashboard when unauthorised. */
export async function requirePermission(
  permission: Permission,
): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!hasPermission(session.role, permission)) redirect("/admin");
  return session;
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** For API routes / server actions: throws instead of redirecting. */
export async function authorize(permission: Permission): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new AuthError("Not authenticated", 401);
  if (!hasPermission(session.role, permission))
    throw new AuthError("Not permitted", 403);
  return session;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
