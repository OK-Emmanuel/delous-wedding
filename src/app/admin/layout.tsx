import { requireSession } from "@/lib/auth/permissions";
import { hasPermission, type Permission } from "@/lib/auth/permissions";
import { ROLE_LABELS } from "@/lib/constants";
import AdminSidebar, { type NavItem } from "@/components/admin/AdminSidebar";
import { logoutAction } from "@/app/(auth)/admin/login/actions";

const NAV: Array<NavItem & { permission: Permission }> = [
  { href: "/admin", label: "Overview", icon: "overview", permission: "view_dashboard" },
  { href: "/admin/guests", label: "Guests", icon: "guests", permission: "manage_guests" },
  { href: "/admin/groups", label: "Invitation Groups", icon: "groups", permission: "manage_groups" },
  { href: "/admin/registrations", label: "Registrations", icon: "registrations", permission: "manage_guests" },
  { href: "/admin/tickets", label: "Digital Tickets", icon: "tickets", permission: "manage_guests" },
  { href: "/admin/check-in", label: "Check-in", icon: "checkin", permission: "check_in" },
  { href: "/admin/gallery", label: "Gallery", icon: "gallery", permission: "manage_gallery" },
  { href: "/admin/faqs", label: "FAQs", icon: "faqs", permission: "manage_faqs" },
  { href: "/admin/emails", label: "Emails", icon: "emails", permission: "manage_emails" },
  { href: "/admin/reports", label: "Reports", icon: "reports", permission: "export_records" },
  { href: "/admin/staff", label: "Staff & Permissions", icon: "staff", permission: "manage_staff" },
  { href: "/admin/settings", label: "Settings", icon: "settings", permission: "change_settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const items = NAV.filter((item) =>
    hasPermission(session.role, item.permission),
  ).map(({ href, label, icon }) => ({ href, label, icon }));

  return (
    <div className="min-h-screen bg-slate-100">
      <AdminSidebar
        items={items}
        userName={session.name}
        roleLabel={ROLE_LABELS[session.role] ?? session.role}
        logout={logoutAction}
      />
      <div className="md:pl-60">
        <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
