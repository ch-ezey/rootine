import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Plus, Sparkles, Trash2, Wand2 } from "lucide-react";
import { generateRoutineDraft } from "../../services/api/ai.service.js";
import { getErrorMessage } from "../../services/api/httpClient.js";
import { useCreateRoutine } from "../../services/queries.js";
import { Button } from "../../shared/ui/Button.jsx";
import { Dialog } from "../../shared/ui/Dialog.jsx";
import { Field, Input, Select, Textarea } from "../../shared/ui/Field.jsx";
import { cn } from "../../shared/lib/cn.js";

const EXAMPLES = [
  "A 45-minute weekday morning routine before work with stretching, breakfast and planning",
  "An evening wind-down that helps me sleep by 11pm",
  "A 1-hour study block with breaks for exam revision",
];

const emptyTask = () => ({ title: "", startTime: "", duration: "", priority: "medium", taskType: "routine", description: "" });

/** Converts form strings into the API's request shape. */
const toRequest = (draft) => ({
  name: draft.name.trim(),
  description: draft.description?.trim() || null,
  detailLevel: draft.detailLevel,
  tasks: draft.tasks
    .filter((t) => t.title.trim())
    .map((t) => ({
      title: t.title.trim(),
      description: t.description?.trim() || null,
      taskType: t.taskType,
      priority: t.priority,
      startTime: t.startTime || null,
      duration: t.duration ? Number(t.duration) : null,
    })),
});

export default function CreateRoutineDialog({ open, onClose }) {
  const [mode, setMode] = useState("ai"); // "ai" | "blank"
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [draft, setDraft] = useState(null);
  const [blank, setBlank] = useState({ name: "", description: "", detailLevel: "medium" });
  const create = useCreateRoutine();
  const navigate = useNavigate();

  const close = () => {
    onClose();
    // Reset after the closing animation
    setTimeout(() => {
      setMode("ai");
      setPrompt("");
      setDraft(null);
      setAiError(null);
      setBlank({ name: "", description: "", detailLevel: "medium" });
    }, 200);
  };

  const generate = async () => {
    setAiError(null);
    setGenerating(true);
    try {
      setDraft(await generateRoutineDraft(prompt.trim()));
    } catch (err) {
      const status = err.response?.status;
      setAiError(
        status === 503
          ? "AI drafting isn't set up on this server yet (no OpenAI key). You can still start from a blank routine."
          : err.response
            ? getErrorMessage(err, "The AI couldn't draft that routine. Try again.")
            : err.message,
      );
    } finally {
      setGenerating(false);
    }
  };

  const save = (payload) =>
    create.mutate(payload, {
      onSuccess: (routine) => {
        toast.success(`"${routine.name}" created`);
        close();
        navigate(`/routines/${routine.routineId}`);
      },
    });

  const draftValid = draft && draft.name.trim() && draft.tasks.some((t) => t.title.trim());

  let body;
  let footer;
  if (mode === "ai" && draft) {
    body = <DraftEditor draft={draft} onChange={setDraft} />;
    footer = (
      <>
        <Button variant="ghost" icon={ArrowLeft} onClick={() => setDraft(null)} className="mr-auto">
          Back
        </Button>
        <Button onClick={() => save(toRequest(draft))} loading={create.isPending} disabled={!draftValid}>
          Save routine
        </Button>
      </>
    );
  } else if (mode === "ai") {
    body = (
      <div className="space-y-4">
        <Field label="What should this routine look like?" error={aiError}>
          {(p) => (
            <Textarea
              {...p}
              rows={4}
              maxLength={2000}
              placeholder="e.g. A calm 30-minute morning before work with stretching, coffee and journaling"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              autoFocus
            />
          )}
        </Field>
        <div>
          <p className="mb-2 text-xs font-medium text-muted">Try an example</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setPrompt(ex)}
                className="rounded-full border border-border px-3 py-1.5 text-left text-xs text-muted transition-colors hover:border-primary hover:text-text cursor-pointer"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
    footer = (
      <Button icon={Wand2} onClick={generate} loading={generating} disabled={!prompt.trim()}>
        {generating ? "Drafting…" : "Draft with AI"}
      </Button>
    );
  } else {
    body = (
      <form
        id="blank-routine"
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          save(toRequest({ ...blank, tasks: [] }));
        }}
      >
        <Field label="Name">
          {(p) => (
            <Input
              {...p}
              placeholder="e.g. Weekday morning"
              maxLength={255}
              value={blank.name}
              onChange={(e) => setBlank({ ...blank, name: e.target.value })}
              autoFocus
            />
          )}
        </Field>
        <Field label="Description" hint="Optional">
          {(p) => (
            <Textarea
              {...p}
              rows={2}
              maxLength={1000}
              placeholder="What is this routine for?"
              value={blank.description}
              onChange={(e) => setBlank({ ...blank, description: e.target.value })}
            />
          )}
        </Field>
        <DetailLevelField value={blank.detailLevel} onChange={(v) => setBlank({ ...blank, detailLevel: v })} />
      </form>
    );
    footer = (
      <Button type="submit" form="blank-routine" loading={create.isPending} disabled={!blank.name.trim()}>
        Create routine
      </Button>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      size={draft ? "lg" : "md"}
      title={draft ? "Review your draft" : "New routine"}
      description={draft ? "Edit anything you like. Nothing is saved until you click Save." : undefined}
      footer={footer}
    >
      {!draft && (
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1" role="tablist">
          {[
            { id: "ai", label: "Describe it", icon: Sparkles },
            { id: "blank", label: "Start blank", icon: Plus },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={mode === id}
              onClick={() => setMode(id)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors cursor-pointer",
                mode === id ? "bg-surface text-text shadow-card" : "text-muted hover:text-text",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      )}
      {body}
    </Dialog>
  );
}

export function DetailLevelField({ value, onChange }) {
  return (
    <Field label="Detail level" hint="How granular the steps are.">
      {(p) => (
        <Select {...p} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>
      )}
    </Field>
  );
}

function DraftEditor({ draft, onChange }) {
  const setTask = (i, patch) =>
    onChange({ ...draft, tasks: draft.tasks.map((t, j) => (j === i ? { ...t, ...patch } : t)) });

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
        <Field label="Name">
          {(p) => (
            <Input {...p} maxLength={255} value={draft.name} onChange={(e) => onChange({ ...draft, name: e.target.value })} />
          )}
        </Field>
        <DetailLevelField value={draft.detailLevel} onChange={(v) => onChange({ ...draft, detailLevel: v })} />
      </div>
      <Field label="Description">
        {(p) => (
          <Textarea
            {...p}
            rows={2}
            maxLength={1000}
            value={draft.description}
            onChange={(e) => onChange({ ...draft, description: e.target.value })}
          />
        )}
      </Field>

      <div>
        <p className="mb-2 text-sm font-medium">Steps</p>
        <ol className="space-y-2">
          {draft.tasks.map((t, i) => (
            <li key={i} className="rounded-xl border border-border p-3">
              <div className="flex items-center gap-2">
                <span className="w-5 text-center text-xs font-semibold text-muted">{i + 1}</span>
                <Input
                  aria-label={`Step ${i + 1} title`}
                  value={t.title}
                  maxLength={150}
                  placeholder="Step title"
                  onChange={(e) => setTask(i, { title: e.target.value })}
                  className="h-9"
                />
                <Button
                  variant="danger-ghost"
                  size="icon"
                  aria-label={`Remove step ${i + 1}`}
                  onClick={() => onChange({ ...draft, tasks: draft.tasks.filter((_, j) => j !== i) })}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 pl-7 pr-11">
                <Input
                  type="time"
                  aria-label={`Step ${i + 1} start time`}
                  value={t.startTime}
                  onChange={(e) => setTask(i, { startTime: e.target.value })}
                  className="h-9"
                />
                <Input
                  type="number"
                  min={1}
                  aria-label={`Step ${i + 1} duration in minutes`}
                  placeholder="min"
                  value={t.duration}
                  onChange={(e) => setTask(i, { duration: e.target.value })}
                  className="h-9"
                />
                <Select
                  aria-label={`Step ${i + 1} priority`}
                  value={t.priority}
                  onChange={(e) => setTask(i, { priority: e.target.value })}
                  className="h-9"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </div>
            </li>
          ))}
        </ol>
        <Button
          variant="ghost"
          size="sm"
          icon={Plus}
          className="mt-2"
          onClick={() => onChange({ ...draft, tasks: [...draft.tasks, emptyTask()] })}
        >
          Add step
        </Button>
      </div>
    </div>
  );
}
