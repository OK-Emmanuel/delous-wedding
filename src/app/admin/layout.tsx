import { requireSession } from "@/lib/auth/permissions";
import { hasPermission, type Permission } from "@/lib/auth/permissions";
import { ROLE_LABELS } from "@/lib/constants";
import AdminSidebar, { type NavItem } from "@/components/admin/AdminSidebar";
import { ToastProvider } from "@/components/admin/Toast";
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
    <ToastProvider>
      <div className="min-h-screen bg-zinc-50/70 text-zinc-900 antialiased font-sans">
        <AdminSidebar
          items={items}
          userName={session.name}
          roleLabel={ROLE_LABELS[session.role] ?? session.role}
          logout={logoutAction}
        />
        <div className="md:pl-64 flex flex-col min-h-screen">
          <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
