import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { gallery } from "@/db/schema";
import GalleryGrid from "@/components/public/GalleryGrid";
import { getMergedGallery } from "@/lib/gallery-sources";

export const revalidate = 300;

export const metadata = { title: "Gallery — DELOUS '26" };

export default async function GalleryPage() {
  const adminImages = await db.query.gallery.findMany({
    where: eq(gallery.status, "published"),
    orderBy: [asc(gallery.sortOrder)],
  });

  const merged = getMergedGallery(adminImages);

  return (
    <div className="bg-ivory pb-24 pt-32">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-12 text-center">
          <p className="text-xs tracking-[0.4em] text-gold uppercase">
            PRE-WEDDING MOMENTS &bull; DELOUS &rsquo;26
          </p>
          <h1 className="mt-3 font-display text-5xl sm:text-6xl font-medium text-burgundy">
            Our Gallery
          </h1>
          <div className="ornament-divider mx-auto mt-5 max-w-xs text-sm">✦</div>
          <p className="mx-auto mt-4 max-w-xl text-rich-black/70 text-sm sm:text-base">
            Every glance, every smile, and every promise captured as we celebrate our journey of love.
          </p>
        </div>
        <GalleryGrid images={merged} />
      </div>
    </div>
  );
}
