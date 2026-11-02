import Nav from "@/components/public/Nav";
import Footer from "@/components/public/Footer";
import MusicPlayer from "@/components/public/MusicPlayer";
import { getSettings } from "@/lib/settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  return (
    <>
      <Nav />
      <main>{children}</main>
      <Footer
        rsvp1={settings.rsvp_contact_1}
        rsvp2={settings.rsvp_contact_2}
      />
      <MusicPlayer />
    </>
  );
}
