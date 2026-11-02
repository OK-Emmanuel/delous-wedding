import { asc } from "drizzle-orm";
import { db } from "@/db";
import { faqs } from "@/db/schema";
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
import { createFaqAction, deleteFaqAction, updateFaqAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function FaqsAdminPage() {
  await requirePermission("manage_faqs");
  const items = await db.query.faqs.findMany({
    orderBy: [asc(faqs.sortOrder), asc(faqs.id)],
  });

  return (
    <>
      <PageHeader
        title="FAQs"
        description="Questions shown on the public website. Lower sort order appears first; drafts are hidden."
      />

      <details className="mb-5 rounded-xl border border-slate-200 bg-white shadow-sm" open={items.length === 0}>
        <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-burgundy">
          + Add a question
        </summary>
        <form action={createFaqAction} className="space-y-4 border-t border-slate-100 p-5">
          <div>
            <label className={labelCls}>Question *</label>
            <input name="question" className={inputCls} required />
          </div>
          <div>
            <label className={labelCls}>Answer *</label>
            <textarea name="answer" rows={3} className={inputCls} required />
          </div>
          <div className="flex gap-3">
            <div>
              <label className={labelCls}>Sort order</label>
              <input name="sortOrder" type="number" defaultValue={items.length} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select name="status" defaultValue="published" className={inputCls}>
                <option value="published">Published</option>
                <option value="draft">Hidden</option>
              </select>
            </div>
          </div>
          <button className={btnPrimary}>Add FAQ</button>
        </form>
      </details>

      {items.length === 0 ? (
        <EmptyState title="No FAQs yet" />
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const update = updateFaqAction.bind(null, item.id);
            const remove = deleteFaqAction.bind(null, item.id);
            return (
              <details key={item.id} className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4">
                  <span className="font-medium text-slate-800">
                    <span className="mr-2 text-xs text-slate-400">#{item.sortOrder}</span>
                    {item.question}
                  </span>
                  <Badge value={item.status} label={item.status === "draft" ? "Hidden" : "Published"} />
                </summary>
                <form action={update} className="space-y-3 border-t border-slate-100 p-5">
                  <input name="question" defaultValue={item.question} className={inputCls} required />
                  <textarea name="answer" rows={3} defaultValue={item.answer} className={inputCls} required />
                  <div className="flex items-end gap-3">
                    <div>
                      <label className={labelCls}>Sort order</label>
                      <input
                        name="sortOrder"
                        type="number"
                        defaultValue={item.sortOrder}
                        className={`${inputCls} !w-24`}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Status</label>
                      <select name="status" defaultValue={item.status} className={inputCls}>
                        <option value="published">Published</option>
                        <option value="draft">Hidden</option>
                      </select>
                    </div>
                    <button className={btnPrimary}>Save</button>
                    <button formAction={remove} className={btnDanger}>
                      Delete
                    </button>
                  </div>
                </form>
              </details>
            );
          })}
        </div>
      )}
    </>
  );
}
