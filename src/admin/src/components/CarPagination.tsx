import { ChevronLeft, ChevronRight } from "lucide-react";
import { useInventoryStore } from "../stores/inventoryStore";

export default function CarPagination() {
  const pagination = useInventoryStore((s) => s.pagination);
  const setCurrentPage = useInventoryStore((s) => s.setCurrentPage);

  const ITEMS_PER_PAGE = 21;

  if (pagination.total === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-8 border-t border-border">
      <div className="text-xs text-text-muted font-sans">
        Showing{" "}
        <span className="font-semibold text-text-body">
          {Math.min(
            (pagination.page - 1) * ITEMS_PER_PAGE + 1,
            pagination.total,
          )}
        </span>{" "}
        to{" "}
        <span className="font-semibold text-text-body">
          {Math.min(pagination.page * ITEMS_PER_PAGE, pagination.total)}
        </span>{" "}
        of{" "}
        <span className="font-bold text-text-strong">
          {pagination.total}
        </span>{" "}
        vehicles
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center gap-1.5 font-sans">
          <button
            onClick={() =>
              setCurrentPage(Math.max(1, pagination.page - 1))
            }
            disabled={pagination.page === 1}
            className="p-2 border border-border hover:border-border-hover rounded-lg bg-bg-surface text-zinc-650 hover:text-text-body disabled:opacity-40 disabled:hover:border-border disabled:hover:text-zinc-650 cursor-pointer transition focus:outline-none flex items-center justify-center"
            id="btn_prev_page"
            title="Previous Page">
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from(
            { length: pagination.pages },
            (_, i) => i + 1,
          ).map((pg) => {
            const isSelected = pagination.page === pg;
            return (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-semibold transition cursor-pointer border ${
                  isSelected
                    ? "bg-brand border-brand text-text-on-brand shadow-xs font-bold"
                    : "bg-bg-surface border-border text-zinc-650 hover:bg-bg-raised"
                }`}
                id={`btn_page_${pg}`}>
                {pg}
              </button>
            );
          })}

          <button
            onClick={() =>
              setCurrentPage(
                Math.min(pagination.pages, pagination.page + 1),
              )
            }
            disabled={pagination.page === pagination.pages}
            className="p-2 border border-border hover:border-border-hover rounded-lg bg-bg-surface text-zinc-650 hover:text-text-body disabled:opacity-40 disabled:hover:border-border disabled:hover:text-zinc-650 cursor-pointer transition focus:outline-none flex items-center justify-center"
            id="btn_next_page"
            title="Next Page">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
