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

export const dynamic = "force-dynamic";

export default async function GalleryAdminPage() {
  await requirePermission("manage_gallery");
  const items = await db.query.gallery.findMany({
    orderBy: [asc(gallery.sortOrder), asc(gallery.id)],
  });

  return (
    <>
      <PageHeader
        title="Gallery"
        description="Pre-wedding photographs. Draft items are hidden from the public site; lower sort order appears first."
      />

      <details className="mb-5 rounded-xl border border-slate-200 bg-white shadow-sm" open={items.length === 0}>
        <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-burgundy">
          + Add a photo
        </summary>
        <form
          action={createGalleryItemAction}
          className="grid gap-4 border-t border-slate-100 p-5 md:grid-cols-2"
        >
          <div className="md:col-span-2">
            <label className={labelCls}>Image URL * (e.g. a Cloudinary delivery URL)</label>
            <input name="imageUrl" type="url" className={inputCls} required placeholder="https://res.cloudinary.com/…" />
          </div>
          <div>
            <label className={labelCls}>Caption</label>
            <input name="caption" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Alt text (accessibility)</label>
            <input name="altText" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Sort order</label>
            <input name="sortOrder" type="number" defaultValue={items.length} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select name="status" defaultValue="published" className={inputCls}>
              <option value="draft">Draft (hidden)</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <button className={btnPrimary}>Add Photo</button>
          </div>
        </form>
      </details>

      {items.length === 0 ? (
        <EmptyState
          title="No photos yet"
          description="Add pre-wedding photographs by URL — upload originals to Cloudinary and paste the delivery link here."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const update = updateGalleryItemAction.bind(null, item.id);
            const remove = deleteGalleryItemAction.bind(null, item.id);
            return (
              <div key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.altText ?? ""}
                  loading="lazy"
                  className="h-44 w-full object-cover"
                />
                <form action={update} className="space-y-2.5 p-4">
                  <div className="flex items-center justify-between">
                    <Badge value={item.status} />
                    <span className="text-xs text-slate-400">#{item.id}</span>
                  </div>
                  <input name="imageUrl" defaultValue={item.imageUrl} className={`${inputCls} !text-xs`} required />
                  <input
                    name="caption"
                    defaultValue={item.caption ?? ""}
                    placeholder="Caption"
                    className={`${inputCls} !text-xs`}
                  />
                  <input
                    name="altText"
                    defaultValue={item.altText ?? ""}
                    placeholder="Alt text"
                    className={`${inputCls} !text-xs`}
                  />
                  <div className="flex gap-2">
                    <input
                      name="sortOrder"
                      type="number"
                      defaultValue={item.sortOrder}
                      className={`${inputCls} !w-20 !text-xs`}
                      title="Sort order"
                    />
                    <select name="status" defaultValue={item.status} className={`${inputCls} !text-xs`}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <div className="flex justify-between pt-1">
                    <button className={`${btnPrimary} !px-3 !py-1.5 !text-xs`}>Save</button>
                    <button formAction={remove} className={`${btnDanger} !px-3 !py-1.5 !text-xs`}>
                      Delete
                    </button>
                  </div>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
