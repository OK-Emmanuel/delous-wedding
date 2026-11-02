import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { gallery } from "@/db/schema";
import GalleryGrid from "@/components/public/GalleryGrid";

export const revalidate = 300;

export const metadata = { title: "Gallery — DELOUS '26" };

export default async function GalleryPage() {
  const images = await db.query.gallery.findMany({
    where: eq(gallery.status, "published"),
    orderBy: [asc(gallery.sortOrder)],
  });

  return (
    <div className="bg-ivory pb-24 pt-32">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-12 text-center">
          <p className="text-xs tracking-[0.4em] text-gold">PRE-WEDDING MOMENTS</p>
          <h1 className="mt-3 font-display text-5xl font-medium text-burgundy">
            Gallery
          </h1>
          <div className="ornament-divider mx-auto mt-5 max-w-xs text-sm">✦</div>
        </div>
        <GalleryGrid images={images} />
      </div>
    </div>
  );
}
