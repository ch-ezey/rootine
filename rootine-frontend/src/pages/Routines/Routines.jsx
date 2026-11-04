import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2, LayoutList, Plus, Trash2 } from "lucide-react";
import { useActivateRoutine, useDeleteRoutine, useRoutines } from "../../services/queries.js";
import { Button } from "../../shared/ui/Button.jsx";
import { Badge, Card, EmptyState, PageHeader, Skeleton } from "../../shared/ui/Card.jsx";
import { ConfirmDialog } from "../../shared/ui/Dialog.jsx";
import { cn } from "../../shared/lib/cn.js";
import CreateRoutineDialog from "./CreateRoutineDialog.jsx";

const DETAIL_LABEL = { low: "Light detail", medium: "Medium detail", high: "High detail" };

export default function Routines() {
  const routines = useRoutines();
  const [params, setParams] = useSearchParams();
  const creating = params.get("new") === "1";
  const setCreating = (open) => setParams(open ? { new: "1" } : {}, { replace: true });
  const [toDelete, setToDelete] = useState(null);
  const remove = useDeleteRoutine();
  const activate = useActivateRoutine();

  // Active routine first, then oldest → newest
  const sorted = [...(routines.data ?? [])].sort((a, b) => Number(b.isActive) - Number(a.isActive));

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Routines"
        description="Everything you've built. The active one is what you follow on Today."
        actions={
          <Button icon={Plus} onClick={() => setCreating(true)}>
            New routine
          </Button>
        }
      />

      {routines.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="space-y-3 p-5">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-24" />
            </Card>
          ))}
        </div>
      ) : routines.isError ? (
        <Card>
          <EmptyState title="Couldn't load your routines" description="Check that the API is running and try again." />
        </Card>
      ) : sorted.length === 0 ? (
        <Card>
          <EmptyState
            icon={LayoutList}
            title="No routines yet"
            description="Describe a routine and let AI draft it, or start from a blank one."
            action={
              <Button icon={Plus} onClick={() => setCreating(true)}>
                Create your first routine
              </Button>
            }
          />
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((r) => (
            <li key={r.routineId}>
              <Card
                className={cn(
                  "group relative flex h-full flex-col p-5 transition-shadow hover:shadow-pop",
                  r.isActive && "border-primary/40 ring-1 ring-primary/20",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold leading-snug">
                    {/* Stretched link: the whole card opens the routine */}
                    <Link to={`/routines/${r.routineId}`} className="after:absolute after:inset-0 after:rounded-2xl">
                      {r.name}
                    </Link>
                  </h2>
                  {r.isActive && (
                    <Badge tone="primary">
                      <CheckCircle2 className="size-3" aria-hidden />
                      Active
                    </Badge>
                  )}
                </div>
                <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-muted">{r.description || "No description"}</p>
                <div className="relative z-10 mt-5 flex items-center justify-between gap-2">
                  <span className="text-xs text-subtle">{DETAIL_LABEL[r.detailLevel]}</span>
                  <div className="flex gap-1">
                    {!r.isActive && (
                      <Button
                        variant="soft"
                        size="sm"
                        onClick={() =>
                          activate.mutate(r.routineId, { onSuccess: () => toast.success(`"${r.name}" is now active`) })
                        }
                      >
                        Make active
                      </Button>
                    )}
                    <Button
                      variant="danger-ghost"
                      size="icon"
                      aria-label={`Delete ${r.name}`}
                      onClick={() => setToDelete(r)}
                      className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <CreateRoutineDialog open={creating} onClose={() => setCreating(false)} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title={`Delete "${toDelete?.name}"?`}
        description="The routine and all of its tasks will be permanently deleted."
        loading={remove.isPending}
        onConfirm={() =>
          remove.mutate(toDelete.routineId, {
            onSuccess: () => {
              toast.success("Routine deleted");
              setToDelete(null);
            },
          })
        }
      />
    </div>
  );
}
