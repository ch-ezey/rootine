import API from "./httpClient.js";

const DETAIL_LEVELS = ["low", "medium", "high"];
const PRIORITIES = ["low", "medium", "high"];
const TASK_TYPES = ["routine", "one_time", "event", "habit"];

const pick = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);

const normalizeTime = (value) => {
  if (typeof value !== "string") return null;
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const [h, m] = [Number(match[1]), Number(match[2])];
  if (h > 23 || m > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

/**
 * Asks the API to draft a routine from a plain-language description.
 * The model's output is untrusted text, so it is parsed and coerced into the
 * shape the routine editor expects; nothing is saved until the user confirms.
 */
export const generateRoutineDraft = async (prompt) => {
  const res = await API.post("/openai/response", prompt, {
    headers: { "Content-Type": "text/plain" },
    // Keep the raw text; parse it ourselves
    transformResponse: [(data) => data],
  });

  const text = String(res.data ?? "")
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();

  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("The AI response couldn't be read. Try rephrasing your request.");
  }

  const tasks = (Array.isArray(raw.tasks) ? raw.tasks : [])
    .filter((t) => t && typeof t.title === "string" && t.title.trim())
    .slice(0, 50)
    .map((t) => ({
      title: t.title.trim().slice(0, 150),
      description: typeof t.description === "string" ? t.description.slice(0, 1000) : "",
      taskType: pick(t.taskType, TASK_TYPES, "routine"),
      startTime: normalizeTime(t.startTime) ?? "",
      duration: Number.isInteger(Number(t.duration)) && Number(t.duration) > 0 ? Number(t.duration) : "",
      priority: pick(t.priority, PRIORITIES, "medium"),
    }));

  if (!tasks.length) {
    throw new Error("The AI couldn't build a routine from that. Try adding more detail.");
  }

  return {
    name: typeof raw.name === "string" && raw.name.trim() ? raw.name.trim().slice(0, 255) : "New routine",
    description: typeof raw.description === "string" ? raw.description.slice(0, 1000) : "",
    detailLevel: pick(raw.detailLevel, DETAIL_LEVELS, "medium"),
    tasks,
  };
};
