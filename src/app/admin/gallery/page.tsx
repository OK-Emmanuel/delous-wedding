import { asc } from "drizzle-orm";
import { db } from "@/db";
import { gallery } from "@/db/schema";
import { requirePermission } from "@/lib/auth/permissions";
import {
  Badge,
  EmptyState,
  PageHeader,
  btnDanger,
  btnPrimary,
  inputCls,
  labelCls,
} from "@/components/admin/ui";
import {
  createGalleryItemAction,
  deleteGalleryItemAction,
  updateGalleryItemAction,
} from "./actions";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Image01Icon,
  Add01Icon,
  Delete02Icon,
  FloppyDiskIcon,
} from "@hugeicons/core-free-icons";

export const dynamic = "force-dynamic";

export default async function GalleryAdminPage() {
  await requirePermission("manage_gallery");
  const items = await db.query.gallery.findMany({
    orderBy: [asc(gallery.sortOrder), asc(gallery.id)],
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pre-wedding Gallery"
        description="Curated photographs shown on the website. Draft images remain hidden from guests; lower sort numbers display first."
      />

      {/* Add New Photo Collapsible Card */}
      <details
        className="group rounded-2xl border border-zinc-200/80 bg-white shadow-xs overflow-hidden"
        open={items.length === 0}
      >
        <summary className="flex cursor-pointer items-center justify-between px-6 py-4.5 text-xs sm:text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50/70 select-none">
          <span className="inline-flex items-center gap-2 text-burgundy">
            <HugeiconsIcon icon={Add01Icon} size={16} />
            <span>Add a New Photograph</span>
          </span>
          <span className="text-xs text-zinc-400 group-open:rotate-180 transition-transform">
            ▼
          </span>
        </summary>
        <form
          action={createGalleryItemAction}
          className="border-t border-zinc-100 bg-zinc-50/40 p-6 space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>Image URL * (Cloudinary or public delivery URL)</label>
              <input
                name="imageUrl"
                type="url"
                className={inputCls}
                required
                placeholder="https://res.cloudinary.com/..."
              />
            </div>
            <div>
              <label className={labelCls}>Photo Caption</label>
              <input
                name="caption"
                placeholder="e.g. Royal Traditional Attire"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Alt Text (Accessibility)</label>
              <input
                name="altText"
                placeholder="Description of image for screen readers"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Sort Order</label>
              <input
                name="sortOrder"
                type="number"
                defaultValue={items.length}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select name="status" defaultValue="published" className={inputCls}>
                <option value="published">Published (Visible)</option>
                <option value="draft">Draft (Hidden)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className={btnPrimary}>
              Upload Photo Entry
            </button>
          </div>
        </form>
      </details>

      {/* Gallery Photo Grid */}
      {items.length === 0 ? (
        <EmptyState
          title="No gallery photos added yet"
          description="Add pre-wedding photos by URL above to populate the celebration gallery."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const update = updateGalleryItemAction.bind(null, item.id);
            const remove = deleteGalleryItemAction.bind(null, item.id);

            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xs transition hover:border-zinc-300"
              >
                <div className="relative h-48 w-full bg-zinc-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.altText ?? ""}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge
                      value={item.status}
                      label={item.status === "draft" ? "Draft" : "Published"}
                    />
                  </div>
                  <div className="absolute top-3 right-3 rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-mono text-white">
                    #{item.sortOrder}
                  </div>
                </div>

                <form action={update} className="p-5 space-y-3 bg-white">
                  <div>
                    <label className={labelCls}>Delivery URL</label>
                    <input
                      name="imageUrl"
                      defaultValue={item.imageUrl}
                      className={`${inputCls} !text-xs !py-1.5`}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Caption</label>
                    <input
                      name="caption"
                      defaultValue={item.caption ?? ""}
                      placeholder="Optional caption"
                      className={`${inputCls} !text-xs !py-1.5`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={labelCls}>Sort Order</label>
                      <input
                        name="sortOrder"
                        type="number"
                        defaultValue={item.sortOrder}
                        className={`${inputCls} !text-xs !py-1.5`}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Status</label>
                      <select
                        name="status"
                        defaultValue={item.status}
                        className={`${inputCls} !text-xs !py-1.5`}
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                    <button
                      type="submit"
                      formAction={remove}
                      className="text-xs font-medium text-rose-600 hover:text-rose-800 transition p-1"
                    >
                      Delete
                    </button>
                    <button type="submit" className={btnPrimary}>
                      <HugeiconsIcon icon={FloppyDiskIcon} size={14} />
                      <span>Save</span>
                    </button>
                  </div>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
