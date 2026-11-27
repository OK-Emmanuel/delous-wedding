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
import { HugeiconsIcon } from "@hugeicons/react";
import {
  HelpCircleIcon,
  Add01Icon,
  Delete02Icon,
  FloppyDiskIcon,
} from "@hugeicons/core-free-icons";

export const dynamic = "force-dynamic";

export default async function FaqsAdminPage() {
  await requirePermission("manage_faqs");
  const items = await db.query.faqs.findMany({
    orderBy: [asc(faqs.sortOrder), asc(faqs.id)],
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Frequently Asked Questions"
        description="Public guest information. Lower sort numbers appear earlier; drafts are hidden from visitors."
      />

      {/* Add New FAQ Collapsible Card */}
      <details
        className="group rounded-2xl border border-zinc-200/80 bg-white shadow-xs overflow-hidden"
        open={items.length === 0}
      >
        <summary className="flex cursor-pointer items-center justify-between px-6 py-4.5 text-xs sm:text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50/70 select-none">
          <span className="inline-flex items-center gap-2 text-burgundy">
            <HugeiconsIcon icon={Add01Icon} size={16} />
            <span>Add a New Question</span>
          </span>
          <span className="text-xs text-zinc-400 group-open:rotate-180 transition-transform">
            ▼
          </span>
        </summary>
        <form
          action={createFaqAction}
          className="border-t border-zinc-100 bg-zinc-50/40 p-6 space-y-4"
        >
          <div>
            <label className={labelCls}>Question *</label>
            <input
              name="question"
              placeholder="e.g. What is the dress code or colour of the day?"
              className={inputCls}
              required
            />
          </div>
          <div>
            <label className={labelCls}>Answer *</label>
            <textarea
              name="answer"
              rows={3}
              placeholder="Provide clear, concise guidance for guests..."
              className={inputCls}
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              <label className={labelCls}>Publish Status</label>
              <select name="status" defaultValue="published" className={inputCls}>
                <option value="published">Published (Visible)</option>
                <option value="draft">Draft (Hidden)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className={btnPrimary}>
              Save Question
            </button>
          </div>
        </form>
      </details>

      {/* FAQs List */}
      {items.length === 0 ? (
        <EmptyState
          title="No FAQs created yet"
          description="Add questions above to populate the FAQ section on the website."
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const update = updateFaqAction.bind(null, item.id);
            const remove = deleteFaqAction.bind(null, item.id);

            return (
              <details
                key={item.id}
                className="group rounded-2xl border border-zinc-200/80 bg-white shadow-xs overflow-hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 select-none hover:bg-zinc-50/50 transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-[11px] font-mono font-semibold text-zinc-600">
                      #{item.sortOrder}
                    </span>
                    <h3 className="font-semibold text-sm text-zinc-900 truncate">
                      {item.question}
                    </h3>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    <Badge
                      value={item.status}
                      label={item.status === "draft" ? "Draft" : "Published"}
                    />
                    <span className="text-xs text-zinc-400 group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </div>
                </summary>

                <form
                  action={update}
                  className="border-t border-zinc-100 bg-zinc-50/40 p-6 space-y-4"
                >
                  <div>
                    <label className={labelCls}>Question</label>
                    <input
                      name="question"
                      defaultValue={item.question}
                      className={inputCls}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Answer</label>
                    <textarea
                      name="answer"
                      rows={3}
                      defaultValue={item.answer}
                      className={inputCls}
                      required
                    />
                  </div>
                  <div className="flex flex-wrap items-end justify-between gap-4 pt-2">
                    <div className="flex items-center gap-3">
                      <div>
                        <label className={labelCls}>Sort Order</label>
                        <input
                          name="sortOrder"
                          type="number"
                          defaultValue={item.sortOrder}
                          className={`${inputCls} !w-24`}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Status</label>
                        <select
                          name="status"
                          defaultValue={item.status}
                          className={inputCls}
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft (Hidden)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        formAction={remove}
                        className={btnDanger}
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={14} />
                        <span>Delete</span>
                      </button>
                      <button type="submit" className={btnPrimary}>
                        <HugeiconsIcon icon={FloppyDiskIcon} size={14} />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                </form>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
